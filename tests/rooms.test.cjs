const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {createRoom,updateRoom,publicRoom}=require('../lib/games/rooms.ts');
const admin=require('firebase-admin');
const emulator=/^(localhost|127\.0\.0\.1):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '');
let db;
if(emulator){admin.initializeApp({projectId:'demo-xnx'});db=admin.firestore();}
const uid=name=>`${name}-${Date.now()}-${Math.random()}`;
async function fixture(kind='spades',options={}){
 const host=uid('host'),guest=uid('guest');
 let room=await createRoom(db,host,{kind,options:{instantTonk:false,...options},name:'Host',fillBots:true});
 await updateRoom(db,room.code,guest,{op:'join',name:'Guest',kind});
 room=await updateRoom(db,room.code,host,{op:'start'});
 return {host,guest,room};
}
test('online rooms conceal other hands and Tonk stock and discard history',{skip:!emulator},async()=>{
 for(const kind of ['tonk','spades']){
  const {host,guest,room}=await fixture(kind);
  const full=(await db.doc(`gameRooms/${room.code}`).get()).data();
  const guestView=publicRoom(full,guest);
  assert.ok(room.game.players[1].hand.every(c=>c.id.startsWith('hidden-')));
  assert.ok(guestView.game.players[0].hand.every(c=>c.rank===0));
  assert.ok(guestView.game.players[1].hand.every(c=>!c.id.startsWith('hidden-')));
  if(kind==='tonk')assert.ok(guestView.game.deck.every(c=>c.rank===0));
  assert.throws(()=>publicRoom(full,uid('outsider')),/Join/);
 }
});
test('online turns, hand ownership and stale versions are enforced',{skip:!emulator},async()=>{
 const {host,guest,room}=await fixture();
 await assert.rejects(updateRoom(db,room.code,guest,{op:'action',version:room.version,action:{type:'BID',bid:3}}),/turn/);
 const next=await updateRoom(db,room.code,host,{op:'action',version:room.version,action:{type:'BID',bid:3}});
 await assert.rejects(updateRoom(db,room.code,guest,{op:'action',version:room.version,action:{type:'BID',bid:3}}),/changed/);
 await assert.rejects(updateRoom(db,room.code,guest,{op:'action',version:next.version,action:{type:'BOT'}}),/Invalid/);
 await assert.rejects(updateRoom(db,room.code,uid('outsider'),{op:'action',action:{type:'BID',bid:3}}),/member/);
 await assert.rejects(updateRoom(db,room.code,uid('late'),{op:'join',name:'Late'}),/started/);
});
test('concurrent joins cannot overfill a room, and only host starts or closes it',{skip:!emulator},async()=>{
 const host=uid('host');const room=await createRoom(db,host,{kind:'tonk',options:{players:2},name:'Host'});
 const guests=[uid('one'),uid('two')];
 const joins=await Promise.allSettled(guests.map(guest=>updateRoom(db,room.code,guest,{op:'join',name:'Guest'})));
 assert.equal(joins.filter(r=>r.status==='fulfilled').length,1);
 const guest=guests[joins.findIndex(r=>r.status==='fulfilled')];
 await assert.rejects(updateRoom(db,room.code,guest,{op:'start'}),/host/);
 const closed=await updateRoom(db,room.code,host,{op:'close'});assert.equal(closed.status,'closed');
 await assert.rejects(updateRoom(db,room.code,guest,{op:'sync'}),/closed/);
});
test('hood Spades minimum bid is enforced online and private bot moves are server controlled',{skip:!emulator},async()=>{
 const {host,guest,room}=await fixture('spades',{jokers:true,deucesHigh:true,nil:false,minTeamBid:4});
 let current=await updateRoom(db,room.code,host,{op:'action',version:room.version,action:{type:'BID',bid:1}});
 current=await updateRoom(db,room.code,guest,{op:'action',version:current.version,action:{type:'BID',bid:1}});
 await db.doc(`gameRooms/${room.code}`).update({nextActionAt:0});
 current=await updateRoom(db,room.code,host,{op:'sync'});
 assert.ok(current.game.players[2].bid>=3);
 assert.ok(current.game.players[2].hand.every(c=>c.rank===0));
});
test.after(async()=>{if(emulator){await db.terminate();await admin.app().delete();}});
