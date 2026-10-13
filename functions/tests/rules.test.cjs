const test = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const {initializeApp, deleteApp} = require('firebase/app');
const {getFirestore,connectFirestoreEmulator,doc,getDoc,setDoc,updateDoc,collection,getDocs,query,where,terminate,serverTimestamp} = require('firebase/firestore');
if (!/^(localhost|127\.0\.0\.1):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) throw new Error('Local FIRESTORE_EMULATOR_HOST is required.');
const [host,port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
admin.initializeApp({projectId:'demo-xnx'});
const db = admin.firestore();
const sessions=[];
function client(uid) {
  const app=initializeApp({projectId:'demo-xnx',apiKey:'demo-key',appId:'demo-app'},`rules-${uid || 'guest'}`);
  const firestore=getFirestore(app);
  connectFirestoreEmulator(firestore,host,Number(port),uid ? {mockUserToken:{sub:uid,user_id:uid}} : undefined);
  sessions.push({app,firestore}); return firestore;
}
test('public can read active products and published posts, but drafts and inventory stay private',async()=>{
  await db.doc('products/rules-active').set({isActive:true}); await db.doc('products/rules-draft').set({isActive:false});
  await db.doc('blogPosts/rules-published').set({isPublished:true}); await db.doc('blogPosts/rules-draft').set({isPublished:false});
  const guest=client();
  assert.ok((await getDoc(doc(guest,'products','rules-active'))).exists());
  assert.ok((await getDoc(doc(guest,'blogPosts','rules-published'))).exists());
  await assert.rejects(getDoc(doc(guest,'products','rules-draft')), /permission/);
  await assert.rejects(getDoc(doc(guest,'blogPosts','rules-draft')), /permission/);
  await assert.rejects(getDocs(collection(guest,'inventory')), /permission/);
  await assert.rejects(getDocs(collection(guest,'gameRooms')), /permission/);
  await assert.rejects(setDoc(doc(guest,'mail','spam'),{to:['test@example.com']}), /permission/);
});
test('customer can edit profile but cannot grant admin or rewards, or read another order',async()=>{
  await db.doc('users/rules-customer').set({role:'customer',isDisabled:false,rewardsPoints:0});
  await db.doc('orders/rules-own').set({customerId:'rules-customer'}); await db.doc('orders/rules-other').set({customerId:'someone-else'});
  const user=client('rules-customer');
  await updateDoc(doc(user,'users','rules-customer'),{displayName:'Test Customer'});
  await assert.rejects(updateDoc(doc(user,'users','rules-customer'),{role:'admin'}),/permission/);
  await assert.rejects(updateDoc(doc(user,'users','rules-customer'),{rewardsPoints:999}),/permission/);
  assert.ok((await getDoc(doc(user,'orders','rules-own'))).exists());
  await assert.rejects(getDoc(doc(user,'orders','rules-other')), /permission/);
  assert.equal((await getDocs(query(collection(user,'orders'),where('customerId','==','rules-customer')))).size,1);
});
test('admins can manage catalog and settings; disabled admins cannot',async()=>{
  await db.doc('users/rules-admin').set({role:'admin',isDisabled:false});
  await db.doc('users/rules-disabled').set({role:'admin',isDisabled:true});
  const owner=client('rules-admin'),disabled=client('rules-disabled');
  await setDoc(doc(owner,'products','rules-admin-product'),{isActive:false});
  await setDoc(doc(owner,'storeSettings','public'),{announcement:'Test announcement'});
  await db.doc('gameRooms/rules-room').set({status:'lobby'});
  assert.ok((await getDoc(doc(owner,'gameRooms','rules-room'))).exists());
  await updateDoc(doc(owner,'gameRooms','rules-room'),{status:'closed'});
  await assert.rejects(setDoc(doc(disabled,'products','rules-denied'),{isActive:true}), /permission/);
});
test('jersey source is private and immutable; only active admins can decide once',async()=>{
  await db.doc('users/jersey-customer').set({role:'customer',isDisabled:false});
  await db.doc('users/jersey-admin').set({role:'admin',isDisabled:false});
  await db.doc('users/jersey-disabled').set({role:'admin',isDisabled:true});
  await db.doc('jerseySubmissions/rules-jersey').set({customerId:'jersey-customer',status:'pending',design:{version:1},reviewNote:''});
  const customer=client('jersey-customer'),owner=client('jersey-admin'),disabled=client('jersey-disabled'),other=client('jersey-other');
  assert.ok((await getDoc(doc(customer,'jerseySubmissions','rules-jersey'))).exists());
  await assert.rejects(getDoc(doc(other,'jerseySubmissions','rules-jersey')),/permission/);
  await assert.rejects(setDoc(doc(customer,'jerseySubmissions','fake'),{customerId:'jersey-customer',status:'pending'}),/permission/);
  const decision={status:'changes_requested',reviewNote:'Please use a higher resolution logo.',reviewedBy:'jersey-admin',reviewedAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await assert.rejects(updateDoc(doc(customer,'jerseySubmissions','rules-jersey'),decision),/permission/);
  await assert.rejects(updateDoc(doc(disabled,'jerseySubmissions','rules-jersey'),{...decision,reviewedBy:'jersey-disabled'}),/permission/);
  await assert.rejects(updateDoc(doc(owner,'jerseySubmissions','rules-jersey'),{...decision,reviewNote:''}),/permission/);
  await assert.rejects(updateDoc(doc(owner,'jerseySubmissions','rules-jersey'),{...decision,design:{version:2}}),/permission/);
  await updateDoc(doc(owner,'jerseySubmissions','rules-jersey'),decision);
  await assert.rejects(updateDoc(doc(owner,'jerseySubmissions','rules-jersey'),{...decision,status:'approved'}),/permission/);
});
test('direct contact creation cannot bypass the checked server endpoint',async()=>{
  const guest=client('contact-spammer');
  await assert.rejects(setDoc(doc(guest,'contactMessages','bypass-captcha'),{
    name:'Spammer',email:'spam@example.com',type:'General Inquiry',message:'This bypasses the form.',status:'new',isArchived:false,
    createdAt:serverTimestamp(),updatedAt:serverTimestamp(),
  }),/permission/);
});

test.after(async()=>{
  for(const {app,firestore} of sessions) {await terminate(firestore);await deleteApp(app);}
  await db.terminate();await admin.app().delete();
});
