const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, file);
const jersey = require('../lib/jersey.ts');
const records = new Map();
const doc = (name, id) => ({key: `${name}/${id}`});
const db = {
  collection: name => ({doc: id => doc(name, id)}),
  async runTransaction(fn) {
    const pending = [];
    await fn({
      get: async ref => ({exists: records.has(ref.key), data: () => records.get(ref.key)}),
      set: (ref, value) => pending.push(() => records.set(ref.key, value)),
      update: (ref, value) => pending.push(() => records.set(ref.key, {...records.get(ref.key), ...value})),
    });
    pending.forEach(write => write());
  },
};
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === '@/lib/firebaseAdmin') return {adminDb: db, adminAuth: {verifyIdToken: async token => {
    if (token === 'invalid') throw Error('Bad token');
    return {uid: token, email: `${token}@example.com`, name: 'Customer', firebase: {sign_in_provider: token === 'guest' ? 'anonymous' : 'password'}};
  }}};
  if (name === '@/lib/jersey') return jersey;
  if (name === 'firebase-admin/firestore') return {FieldValue: {serverTimestamp: () => 'server-timestamp'}};
  return original.call(this, name, ...args);
};
const {POST} = require('../app/api/jerseys/route.ts');
Module._load = original;
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const input = patch => ({requestId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'Team kit', size: 'M', quantity: 2, notes: '', design: jersey.initialDesign, previews: {front: png, back: png}, ...patch});
const request = (uid, body = input()) => new Request('http://localhost/api/jerseys', {method: 'POST', headers: uid ? {authorization: `Bearer ${uid}`} : {}, body: JSON.stringify(body)});
test.beforeEach(() => {records.clear(); records.set('users/customer', {role: 'customer', isDisabled: false});});
test('submission API authenticates and rejects disabled/anonymous accounts', async () => {
  assert.equal((await POST(request(null))).status, 401);
  assert.equal((await POST(request('invalid'))).status, 401);
  assert.equal((await POST(request('guest'))).status, 401);
  records.set('users/customer', {isDisabled: true});
  assert.equal((await POST(request('customer'))).status, 400);
  assert.equal(records.size, 1);
});
test('submission identity and pending status are server-owned; retries create one record', async () => {
  const body = input({customerId: 'victim', status: 'approved', reviewNote: 'Fake approval'});
  const first = await POST(request('customer', body)); assert.equal(first.status, 200);
  const {id} = await first.json(); const saved = records.get(`jerseySubmissions/${id}`);
  assert.equal(saved.customerId, 'customer'); assert.equal(saved.customerEmail, 'customer@example.com');
  assert.equal(saved.status, 'pending'); assert.equal(saved.reviewNote, ''); assert.equal(saved.createdAt, 'server-timestamp');
  assert.equal((await POST(request('customer', body))).status, 200);
  assert.equal([...records.keys()].filter(k => k.startsWith('jerseySubmissions/')).length, 1);
  assert.equal((await POST(request('customer', input({requestId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'})))).status, 400);
});
test('revisions require ownership and a requested change; originals stay linked', async () => {
  const parentId = 'previous-submission';
  records.set(`jerseySubmissions/${parentId}`, {customerId: 'other', status: 'changes_requested'});
  assert.equal((await POST(request('customer', input({parentId})))).status, 400);
  records.set(`jerseySubmissions/${parentId}`, {customerId: 'customer', status: 'approved'});
  assert.equal((await POST(request('customer', input({parentId})))).status, 400);
  records.set(`jerseySubmissions/${parentId}`, {customerId: 'customer', status: 'changes_requested'});
  const response = await POST(request('customer', input({parentId}))); assert.equal(response.status, 200);
  const {id} = await response.json();
  assert.equal(records.get(`jerseySubmissions/${parentId}`).status, 'revised');
  assert.equal(records.get(`jerseySubmissions/${parentId}`).revisedBy, id);
  assert.equal(records.get(`jerseySubmissions/${id}`).parentId, parentId);
  assert.equal((await POST(request('customer', input({parentId})))).status, 200);
});
test('oversized and invalid requests fail without writing data', async () => {
  assert.equal((await POST(request('customer', input({notes: 'x'.repeat(900000)})))).status, 400);
  assert.equal((await POST(request('customer', input({design: {version: 1}})))).status, 400);
  assert.equal(records.size, 1);
});
