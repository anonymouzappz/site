const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, file);
const {initialDesign, validateDesign, validateSubmission, validateCustomFont} = require('../lib/jersey.ts');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const body = () => ({requestId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: ' Team jersey ', size: 'M', quantity: 2, notes: '', design: structuredClone(initialDesign), previews: {front: png, back: png}});
test('submissions retain editable source and both previews, stripping privileged fields', () => {
  const input = {...body(), status: 'approved', customerId: 'another-user', reviewedBy: 'fake-admin'};
  const result = validateSubmission(input);
  assert.equal(result.title, 'Team jersey'); assert.deepEqual(result.design, initialDesign);
  assert.equal(result.status, undefined); assert.equal(result.customerId, undefined); assert.equal(result.reviewedBy, undefined);
  assert.equal(result.previews.front, png);
});
test('design validation rejects scripts, remote images, invalid geometry and duplicate IDs', () => {
  for (const content of ['https://example.com/logo.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'javascript:alert(1)']) {
    const d = structuredClone(initialDesign); d.layers[0].kind = 'image'; d.layers[0].content = content;
    assert.throws(() => validateDesign(d));
  }
  for (const x of [NaN, Infinity, -1, 500]) { const d = structuredClone(initialDesign); d.layers[0].x = x; assert.throws(() => validateDesign(d)); }
  const d = structuredClone(initialDesign); d.layers[1].id = d.layers[0].id; assert.throws(() => validateDesign(d));
});
test('submission constraints protect document size and revision paths', () => {
  for (const patch of [{quantity: 1.5}, {quantity: 201}, {quantity: 0}, {size: 'XXS'}, {title: '  '}, {notes: 'x'.repeat(2001)}, {parentId: '../other'}, {requestId: 'short'}]) assert.throws(() => validateSubmission({...body(), ...patch}));
  const d = structuredClone(initialDesign); d.layers = Array.from({length: 17}, (_, i) => ({...d.layers[0], id: `layer-${i}`}));
  assert.throws(() => validateDesign(d));
  assert.throws(() => validateSubmission({...body(), previews: {front: 'data:image/png;base64,' + 'A'.repeat(220000), back: png}}));
});
test('custom font bytes and layer references survive submission and draft validation', () => {
  const font = {id: 'custom-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'My font', data: 'data:font/woff2;base64,' + fs.readFileSync(require('node:path').join(__dirname, '../app/fonts/geist-latin.woff2')).toString('base64')};
  const design = structuredClone(initialDesign); design.customFonts = [font]; design.layers[0].font = font.id;
  assert.deepEqual(validateDesign(design), design);
  assert.deepEqual(validateSubmission({...body(), design}).design.customFonts, [font]);
  const orphan = structuredClone(design); delete orphan.customFonts;
  assert.throws(() => validateDesign(orphan), /option/);
  assert.throws(() => validateDesign({...design, customFonts: [font, font]}), /Duplicate/);
});
test('font uploads reject unsupported sources, invalid signatures, oversized files and unsafe IDs', () => {
  const font = {id: 'custom-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'My font', data: 'data:font/woff2;base64,' + Buffer.from('wOF2' + 'x'.repeat(20)).toString('base64')};
  for (const patch of [{data: 'https://example.com/font.woff2'}, {data: 'data:font/woff2;base64,' + Buffer.from('<script>bad</script>').toString('base64')}, {id: 'custom-../../other'}, {name: ''}, {data: 'data:font/woff2;base64,A'}, {data: 'data:font/woff2;base64,' + Buffer.from('wOF2' + 'x'.repeat(205000)).toString('base64')}]) {
    assert.throws(() => validateCustomFont({...font, ...patch}));
  }
  assert.throws(() => validateDesign({...initialDesign, customFonts: Array.from({length:4}, (_,i) => ({...font, id: `custom-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa${i}`}))}), /at most 3/);
});
