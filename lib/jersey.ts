export type Side = 'front' | 'back';
export const jerseyCuts = { basketball: 'Basketball / sleeveless', soccer: 'Soccer / short sleeve', football: 'Football / athletic sleeve', baseball: 'Baseball / button front', hockey: 'Hockey / loose long sleeve', long_sleeve: 'Training / fitted long sleeve' } as const;
export const typefaces = {
  block: { label: 'Athletic block', family: 'Arial, sans-serif', weight: 900 },
  condensed: { label: 'Heavy condensed', family: 'Impact, Haettenschweiler, Arial Narrow, sans-serif', weight: 900 },
  varsity: { label: 'Varsity outline', family: 'Georgia, Times New Roman, serif', weight: 900 },
  serif: { label: 'Classic serif', family: 'Georgia, Times New Roman, serif', weight: 700 },
  script: { label: 'Signature script', family: 'Segoe Script, Brush Script MT, cursive', weight: 600 },
  rounded: { label: 'Rounded sport', family: 'Trebuchet MS, Arial, sans-serif', weight: 700 },
  mono: { label: 'Retro monospace', family: 'Courier New, monospace', weight: 700 },
  modern: { label: 'Modern geometric', family: 'Verdana, Geneva, sans-serif', weight: 700 },
} as const;
export type CustomFont = { id: `custom-${string}`; name: string; data: string };
export type JerseyLayer = { id: string; side: Side; kind: 'text' | 'image'; content: string; x: number; y: number; size: number; rotation: number; color: string; font: keyof typeof typefaces | CustomFont['id'] };
export type JerseyDesign = { version: 1; style: keyof typeof jerseyCuts; neck: 'round' | 'v'; pattern: 'solid' | 'stripes' | 'diagonal'; base: string; accent: string; trim: string; layers: JerseyLayer[]; customFonts?: CustomFont[] };
export function customFontFamily(id: string) { return `Jersey_${id.replace(/-/g, '_')}`; }
export const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export const initialDesign: JerseyDesign = {
  version: 1, style: 'basketball', neck: 'round', pattern: 'solid', base: '#19241c', accent: '#667a45', trim: '#e9e7d9',
  layers: [
    { id: 'team', side: 'front', kind: 'text', content: 'NURNREBEL', x: 200, y: 185, size: 25, rotation: 0, color: '#e9e7d9', font: 'block' },
    { id: 'number-front', side: 'front', kind: 'text', content: '23', x: 200, y: 270, size: 80, rotation: 0, color: '#e9e7d9', font: 'block' },
    { id: 'name', side: 'back', kind: 'text', content: 'YOUR NAME', x: 200, y: 155, size: 24, rotation: 0, color: '#e9e7d9', font: 'block' },
    { id: 'number-back', side: 'back', kind: 'text', content: '23', x: 200, y: 260, size: 100, rotation: 0, color: '#e9e7d9', font: 'block' },
  ],
};
export class DesignError extends Error {}
const record = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new DesignError('Invalid design.');
  return v as Record<string, unknown>;
};
function choice<T extends string>(v: unknown, values: readonly T[]): T {
  if (!values.includes(v as T)) throw new DesignError('Invalid design option.');
  return v as T;
}
function string(v: unknown, max: number, required = false) {
  if (typeof v !== 'string' || v.length > max || (required && !v.trim())) throw new DesignError('Check the text fields and their length.');
  return v.trim();
}
function number(v: unknown, min: number, max: number) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new DesignError('A layer is outside the allowed bounds.');
  return v;
}
function color(v: unknown) {
  if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) throw new DesignError('Invalid color.');
  return v;
}
export function raster(v: unknown, max = 220000) {
  if (typeof v !== 'string' || v.length > max || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v)) throw new DesignError('Use a small PNG, JPEG, or WebP image.');
  return v;
}
export function validateCustomFont(value: unknown): CustomFont {
  const f = record(value);
  if (typeof f.id !== 'string' || !/^custom-[a-zA-Z0-9-]{16,80}$/.test(f.id)) throw new DesignError('Invalid custom font ID.');
  if (typeof f.data !== 'string' || f.data.length > 280000 || !/^data:font\/(woff2?|ttf|otf);base64,[A-Za-z0-9+/]+={0,2}$/.test(f.data)) throw new DesignError('Choose a WOFF, WOFF2, TTF or OTF font under 200 KB.');
  let binary: string;
  try { binary = atob(f.data.split(',')[1]); }
  catch { throw new DesignError('The font file contains invalid data.'); }
  const format = f.data.slice(10, f.data.indexOf(';'));
  const signature = binary.slice(0, 4);
  const expected = { woff: 'wOFF', woff2: 'wOF2', otf: 'OTTO', ttf: '\u0000\u0001\u0000\u0000' };
  if (binary.length > 200 * 1024 || binary.length < 12 || signature !== expected[format as keyof typeof expected]) throw new DesignError('This file is not a supported font.');
  return { id: f.id as CustomFont['id'], name: string(f.name, 80, true), data: f.data };
}
export function validateDesign(value: unknown): JerseyDesign {
  const d = record(value);
  if (d.version !== 1 || !Array.isArray(d.layers) || d.layers.length > 16) throw new DesignError('Use at most 16 layers.');
  const ids = new Set<string>();
  if (d.customFonts !== undefined && (!Array.isArray(d.customFonts) || d.customFonts.length > 3)) throw new DesignError('Use at most 3 custom fonts.');
  const customFonts = ((d.customFonts ?? []) as unknown[]).map(validateCustomFont);
  if (new Set(customFonts.map(f => f.id)).size !== customFonts.length) throw new DesignError('Duplicate custom font.');
  const allowedFonts = [...Object.keys(typefaces), ...customFonts.map(f => f.id)] as JerseyLayer['font'][];
  const layers = d.layers.map(value => {
    const l = record(value), id = string(l.id, 80, true);
    if (ids.has(id)) throw new DesignError('Duplicate layer.');
    ids.add(id);
    const kind = choice(l.kind, ['text', 'image']);
    return { id, kind, side: choice(l.side, ['front', 'back']), content: kind === 'text' ? string(l.content, 40, true) : raster(l.content),
      x: number(l.x, 75, 325), y: number(l.y, 110, 410), size: number(l.size, 12, 140), rotation: number(l.rotation, -180, 180), color: color(l.color), font: choice(l.font, allowedFonts) };
  });
  return { version: 1, style: choice(d.style, Object.keys(jerseyCuts) as JerseyDesign['style'][]), neck: choice(d.neck, ['round', 'v']), pattern: choice(d.pattern, ['solid', 'stripes', 'diagonal']), base: color(d.base), accent: color(d.accent), trim: color(d.trim), layers, ...(customFonts.length ? { customFonts } : {}) };
}
export function validateSubmission(value: unknown) {
  const b = record(value), previews = record(b.previews);
  if (typeof b.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(b.requestId)) throw new DesignError('Invalid submission ID.');
  const design = validateDesign(b.design);
  const quantity = number(b.quantity, 1, 200);
  if (!Number.isInteger(quantity)) throw new DesignError('Quantity must be a whole number.');
  if (b.parentId != null && (typeof b.parentId !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(b.parentId))) throw new DesignError('Invalid revision ID.');
  if (JSON.stringify(design).length > 400000) throw new DesignError('Your artwork and fonts are too large. Remove unused fonts or reduce image sizes.');
  return { requestId: b.requestId, design, title: string(b.title, 80, true), size: choice(b.size, sizes), quantity, notes: string(b.notes, 2000),
    parentId: b.parentId ? string(b.parentId, 200, true) : null,
    previews: { front: raster(previews.front, 220000), back: raster(previews.back, 220000) } };
}
