const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const validation=require('../lib/contact-validation.ts');
const records=new Map(); let nextId=0, verdict, calls;
const db={collection:name=>({doc:id=>({key:`${name}/${id||++nextId}`})}),runTransaction:async fn=>{
 const writes=[]; await fn({get:async ref=>({data:()=>records.get(ref.key)}),set:(ref,data)=>writes.push(()=>records.set(ref.key,data))}); writes.forEach(write=>write());
}};
const original=Module._load;
Module._load=function(name,...args){
 if(name==='@/lib/firebaseAdmin')return {adminDb:db};
 if(name==='@/lib/contact-validation')return validation;
 if(name==='firebase-admin/firestore')return {FieldValue:{serverTimestamp:()=> 'server-time'}};
 return original.call(this,name,...args);
};
const {POST}=require('../app/api/contact/route.ts'); Module._load=original;
const payload=patch=>({name:' Customer ',email:'CUSTOMER@example.com',type:'General Inquiry',message:' Hello ',captchaToken:'valid-token',website:'',...patch});
const request=patch=>new Request('http://localhost/api/contact',{method:'POST',body:JSON.stringify(payload(patch))});
const saved=()=>[...records.entries()].filter(([key])=>key.startsWith('contactMessages/'));
test.beforeEach(()=>{
 records.clear(); calls=0; process.env.RECAPTCHA_SECRET_KEY='unit-test-only-secret'; process.env.NODE_ENV='production'; process.env.RECAPTCHA_ALLOWED_HOSTNAMES='nurnrebel.com,www.nurnrebel.com';
 verdict={success:true,hostname:'nurnrebel.com'};
 global.fetch=async(url,options)=>{assert.equal(url,'https://www.google.com/recaptcha/api/siteverify');assert.equal(options.body.get('secret'),'unit-test-only-secret');calls++;return Response.json(verdict);};
});
test('verified contact messages preserve admin schema without storing tokens or client status',async()=>{
 assert.equal((await POST(request({status:'approved',isArchived:true}))).status,200);
 assert.equal(calls,1); const message=saved()[0][1];
 assert.equal(message.name,'Customer');assert.equal(message.email,'customer@example.com');assert.equal(message.message,'Hello');
 assert.equal(message.status,'new');assert.equal(message.isArchived,false);assert.equal(message.captchaToken,undefined);assert.equal(message.website,undefined);
 assert.equal((await POST(request())).status,429);assert.equal(saved().length,1);
});
test('missing, invalid, expired and wrong-host CAPTCHA checks create no messages',async()=>{
 assert.equal((await POST(request({captchaToken:''}))).status,400);assert.equal(calls,0);
 for(const result of [{success:false,'error-codes':['timeout-or-duplicate']},{success:true,hostname:'attacker.example'},{success:true},{success:false}]){
  verdict=result;assert.equal((await POST(request())).status,400);
 }
 assert.equal(saved().length,0);
});
test('missing server configuration and verification outages fail closed',async()=>{
 delete process.env.RECAPTCHA_SECRET_KEY;assert.equal((await POST(request())).status,503);assert.equal(calls,0);
 process.env.RECAPTCHA_SECRET_KEY='unit-test-only-secret';
 global.fetch=async()=>{throw Error('Offline');};assert.equal((await POST(request())).status,503);
 verdict={success:false,'error-codes':['invalid-input-secret']};global.fetch=async()=>Response.json(verdict);
 assert.equal((await POST(request())).status,503);assert.equal(saved().length,0);
});
test('bot trap, invalid forms and large streamed requests are rejected before verifying',async()=>{
 for(const patch of [{website:'spam.example'},{email:'not-an-email'},{type:'fake'},{message:''},{message:'x'.repeat(10001)}])assert.equal((await POST(request(patch))).status,400);
 assert.equal((await POST(request({message:'x'.repeat(60000)}))).status,413);
 assert.equal(calls,0);assert.equal(saved().length,0);
});
