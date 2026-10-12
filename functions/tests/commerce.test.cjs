const test = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
// This suite only ever talks to the explicitly selected local emulator.
if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Set FIRESTORE_EMULATOR_HOST to a local emulator before running this suite.');
if (!/^(localhost|127\.0\.0\.1):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST)) throw new Error('Only loopback emulators are allowed.');
admin.initializeApp({ projectId: 'demo-xnx' });
const db = admin.firestore();
const {reserveCart, finishCheckout} = require('../lib/commerce');
async function fixture(name, stock = 3, trackInventory = true, allowBackorder = false) {
  const id = `${name}-${Date.now()}`;
  const variants = [{variantKey:'medium',optionValues:{size:'M'},sku:'TEE-M',stock,trackInventory,allowBackorder},
    {variantKey:'large',optionValues:{size:'L'},sku:'TEE-L',stock:8,trackInventory:true,allowBackorder:false}];
  await db.collection('products').doc(id).set({name:'Tee',slug:'tee',isActive:true,price:25,stock:stock+8,options:{size:['M','L']},variants});
  for(const variant of variants) await db.collection('inventory').doc(`${id}-${variant.variantKey}`).set({productId:id,...variant,stockAvailable:variant.stock,reservedStock:0,soldCount:0});
  const item = {productId:id,name:'Tampered',price:.01,quantity:1,options:{size:'M'}};
  return {id,item};
}
test('canonical product price, SKU and identity override browser values', async () => {
  const {id,item} = await fixture('canonical');
  const checkout = db.collection('checkout_sessions').doc();
  const [line] = await reserveCart(db,checkout,[item],'customer');
  assert.equal(line.price,25); assert.equal(line.name,'Tee'); assert.equal(line.sku,'TEE-M');
  assert.equal(line.inventoryId,`${id}-medium`);
  const reserved = (await db.collection('inventory').doc(line.inventoryId).get()).data();
  assert.equal(reserved.stockAvailable,2); assert.equal(reserved.reservedStock,1);
  assert.equal((await db.collection('inventory').doc(`${id}-large`).get()).data().stockAvailable,8);
});
test('duplicate lines cannot bypass stock limits and rejection writes nothing', async () => {
  const {id,item} = await fixture('duplicates',1);
  const checkout = db.collection('checkout_sessions').doc();
  await assert.rejects(reserveCart(db,checkout,[item,item],''),/stock/);
  assert.equal((await db.collection('inventory').doc(`${id}-medium`).get()).data().stockAvailable,1);
  assert.equal((await checkout.get()).exists,false);
});
test('simultaneous customers cannot both reserve the last unit', async () => {
  const {id,item} = await fixture('race',1);
  const results = await Promise.allSettled([reserveCart(db,db.collection('checkout_sessions').doc(),[item],''),reserveCart(db,db.collection('checkout_sessions').doc(),[item],'')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length,1);
  const row = (await db.collection('inventory').doc(`${id}-medium`).get()).data();
  assert.equal(row.stockAvailable,0); assert.equal(row.reservedStock,1);
});
test('payment retries create one order and count each sold variant once', async () => {
  const {id,item} = await fixture('sale',3);
  const checkout = db.collection('checkout_sessions').doc();
  await reserveCart(db,checkout,[{...item,quantity:2}],'customer');
  const reservedVersion = (await db.collection('products').doc(id).get()).data().updatedAt;
  const order = {id:`order-${checkout.id}`,data:{total:50,paymentStatus:'paid'}};
  await Promise.all([finishCheckout(db,checkout.id,order),finishCheckout(db,checkout.id,order)]);
  const row = (await db.collection('inventory').doc(`${id}-medium`).get()).data();
  assert.equal(row.stockAvailable,1); assert.equal(row.reservedStock,0); assert.equal(row.soldCount,2);
  assert.equal((await db.collection('orders').doc(order.id).get()).data().customerId,'customer');
  assert.ok(!(await db.collection('products').doc(id).get()).data().updatedAt.isEqual(reservedVersion), 'paid sales must invalidate stale admin editors');
  await finishCheckout(db,checkout.id);
  assert.equal((await db.collection('inventory').doc(`${id}-medium`).get()).data().stockAvailable,1);
});
test('expiration retries restore available variant and product stock only once', async () => {
  const {id,item} = await fixture('expiration',3);
  const checkout = db.collection('checkout_sessions').doc();
  await reserveCart(db,checkout,[item],'');
  await Promise.all([finishCheckout(db,checkout.id),finishCheckout(db,checkout.id)]);
  const row = (await db.collection('inventory').doc(`${id}-medium`).get()).data();
  const product = (await db.collection('products').doc(id).get()).data();
  assert.equal(row.stockAvailable,3); assert.equal(row.reservedStock,0);
  assert.equal(product.stock,11); assert.equal(product.variants[0].stock,3);
});
test('untracked stock still holds identity, counts sales and never changes availability', async () => {
  const {id,item} = await fixture('untracked',0,false);
  const checkout = db.collection('checkout_sessions').doc();
  await reserveCart(db,checkout,[item],'');
  assert.equal((await db.collection('inventory').doc(`${id}-medium`).get()).data().reservedStock,1);
  await finishCheckout(db,checkout.id,{id:`order-${checkout.id}`,data:{total:25}});
  const row = (await db.collection('inventory').doc(`${id}-medium`).get()).data();
  assert.equal(row.stockAvailable,0); assert.equal(row.soldCount,1); assert.equal(row.reservedStock,0);
});
test('backorder stock is recorded as negative, then restored if checkout expires', async () => {
  const {id,item} = await fixture('backorder',0,true,true);
  const checkout = db.collection('checkout_sessions').doc();
  await reserveCart(db,checkout,[item],'');
  assert.equal((await db.collection('inventory').doc(`${id}-medium`).get()).data().stockAvailable,-1);
  await finishCheckout(db,checkout.id);
  assert.equal((await db.collection('inventory').doc(`${id}-medium`).get()).data().stockAvailable,0);
});
test('invalid option combinations are rejected', async () => {
  const {item} = await fixture('invalid');
  await assert.rejects(reserveCart(db,db.collection('checkout_sessions').doc(),[{...item,options:{size:'XXL'}}],''),/options/);
});
test.after(async()=> { await db.terminate(); await admin.app().delete(); });
