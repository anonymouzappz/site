"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { initialDesign, jerseyCuts, typefaces, sizes, validateDesign, validateCustomFont, type CustomFont, type JerseyDesign, type JerseyLayer, type Side } from '@/lib/jersey';
import { loadCustomFont } from '@/lib/jersey-fonts';
import JerseyPreview, { previewPng } from './JerseyPreview';

type Submission = { id: string; title: string; status: string; reviewNote: string; design: JerseyDesign; size: string; quantity: number; notes: string; createdAt?: { seconds: number } };
type Draft = { design: JerseyDesign; title: string; size: string; quantity: number; notes: string; parentId: string | null };
const labels: Record<string, string> = { pending: 'Awaiting review', approved: 'Approved', rejected: 'Declined', changes_requested: 'Changes requested', revised: 'Revision submitted' };
export default function JerseyStudio() {
  const { user, loading, isLoggedIn } = useAuth();
  const [history, setHistory] = useState<JerseyDesign[]>([initialDesign]);
  const [cursor, setCursor] = useState(0);
  const design = history[cursor];
  const [side, setSide] = useState<Side>('front');
  const [selected, setSelected] = useState<string | undefined>('team');
  const [title, setTitle] = useState('My custom jersey');
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [listError, setListError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [acknowledge, setAcknowledge] = useState(false);
  const draftRef = useRef<Draft | null>(null);
  const key = `nurnrebel-jersey-v1-${isLoggedIn ? user?.uid : 'guest'}`;
  const initializedKey = useRef('');
  const front = useRef<SVGSVGElement>(null), back = useRef<SVGSVGElement>(null);
  const requestId = useRef<string | null>(null);
  const lastPayload = useRef('');
  const layer = design.layers.find(l => l.id === selected && l.side === side);
  // Keep the current draft in memory. Only explicit save writes browser storage.
  useEffect(() => { draftRef.current = { design, title, size, quantity, notes, parentId }; }, [design, title, size, quantity, notes, parentId]);
  useEffect(() => {
    if (loading || initializedKey.current === key) return;
    initializedKey.current = key;
    try { const found = !!localStorage.getItem(key); requestAnimationFrame(() => setHasDraft(found)); } catch { /* Browser storage can be unavailable. */ }
  }, [key, loading]);
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    return onSnapshot(query(collection(db, 'jerseySubmissions'), where('customerId', '==', user.uid)), snap => {
      setSubmissions(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Submission).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
      setListError('');
    }, () => setListError('Could not load your submissions. Try refreshing once the connection is restored.'));
  }, [user, isLoggedIn]);
  function change(next: JerseyDesign) { setHistory(h => [...h.slice(0, cursor + 1).slice(-49), next]); setCursor(Math.min(cursor + 1, 49)); }
  function patchLayer(patch: Partial<JerseyLayer>) { if (layer) change({ ...design, layers: design.layers.map(l => l.id === layer.id ? { ...l, ...patch } : l) }); }
  function addLayer(kind: 'text' | 'image', content: string) {
    if (design.layers.length >= 16) { setMessage('Use at most 16 layers.'); return; }
    const id = crypto.randomUUID();
    change({ ...design, layers: [...design.layers, { id, side, kind, content, x: 200, y: 210, size: kind === 'image' ? 100 : 28, rotation: 0, color: design.trim, font: 'block' }] });
    setSelected(id);
  }
  const drag = useRef<{ id: string; start: JerseyDesign; cursor: number } | null>(null);
  function dragLayer(id: string, x: number, y: number) {
    if (!drag.current) drag.current = { id, start: design, cursor };
    const activeDrag = drag.current;
    const base = activeDrag.start;
    const next = { ...base, layers: base.layers.map(l => l.id === id ? { ...l, x, y } : l) };
    setHistory(h => [...h.slice(0, activeDrag.cursor + 1).slice(-49), next]);
    setCursor(Math.min(activeDrag.cursor + 1, 49));
  }
  useEffect(() => {
    const end = () => { drag.current = null; };
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    return () => { window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setMessage('Choose a PNG, JPEG, or WebP under 5 MB.'); return; }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url; await image.decode();
      const scale = Math.min(1, 600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
      let data = canvas.toDataURL('image/png');
      if (data.length > 220000) data = canvas.toDataURL('image/webp', .8);
      if (data.length > 220000) throw new Error('Artwork has too much detail. Use a smaller image.');
      addLayer('image', data); setMessage('Artwork added. Drag it into place or use the position controls.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not open this image.'); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(draftRef.current)); setHasDraft(true); setMessage('Draft saved on this device.'); }
    catch { setMessage('Could not save the draft. Browser storage may be full or unavailable.'); }
  }
  async function uploadFont(file?: File) {
    if (!file) return;
    if ((design.customFonts?.length ?? 0) >= 3) { setMessage('Use at most 3 custom fonts. Remove one before adding another.'); return; }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['woff', 'woff2', 'ttf', 'otf'].includes(extension) || file.size > 200 * 1024) { setMessage('Choose a WOFF, WOFF2, TTF or OTF font under 200 KB.'); return; }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
      const font = validateCustomFont({ id: `custom-${crypto.randomUUID()}`, name: file.name.replace(/\.[^.]+$/, '').slice(0, 80), data: `data:font/${extension};base64,${btoa(binary)}` });
      const next = { ...design, customFonts: [...(design.customFonts ?? []), font], layers: design.layers.map(l => l.id === layer?.id && l.kind === 'text' ? { ...l, font: font.id } : l) };
      if (JSON.stringify(next).length > 400000) throw new Error('Your artwork and fonts are too large. Remove unused fonts or use a smaller font file.');
      await loadCustomFont(font); change(next);
      setMessage(layer?.kind === 'text' ? `${font.name} uploaded and applied to your text.` : `${font.name} uploaded. Select a text layer to use it.`);
    } catch (e) { setMessage(e instanceof Error ? `Could not add font: ${e.message}` : 'This font could not load. Try another font file.'); }
    finally { setBusy(false); }
  }
  function removeFont(id: CustomFont['id']) {
    change({ ...design, customFonts: design.customFonts?.filter(f => f.id !== id), layers: design.layers.map(l => l.font === id ? { ...l, font: 'block' } : l) });
    setMessage('Font removed. Text that used it now uses Athletic block.');
  }
  function restore() {
    try {
      const draft = JSON.parse(localStorage.getItem(key) || 'null') as Draft;
      if (!draft) return;
      const d = validateDesign(draft.design); change(d); setTitle(draft.title || 'My custom jersey'); setSize(sizes.includes(draft.size as typeof sizes[number]) ? draft.size : 'M'); setQuantity(Number.isInteger(draft.quantity) ? draft.quantity : 1); setNotes(draft.notes || ''); setParentId(draft.parentId || null); setSelected(undefined); setAcknowledge(false); setMessage('Saved draft restored.');
    } catch { setMessage('This saved draft could not be restored.'); }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!user || !isLoggedIn || busy) return;
    setBusy(true); setMessage('');
    try {
      validateDesign(design);
      const previews = { front: await previewPng(front.current!, design.customFonts), back: await previewPng(back.current!, design.customFonts) };
      const payload = JSON.stringify({ design, title, size, quantity, notes, parentId, previews });
      if (lastPayload.current !== payload || !requestId.current) { requestId.current = crypto.randomUUID(); lastPayload.current = payload; }
      const response = await fetch('/api/jerseys', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify({ ...JSON.parse(payload), requestId: requestId.current }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setParentId(null); setAcknowledge(false); setMessage('Design submitted! Your review status will appear below.');
      try { localStorage.removeItem(key); setHasDraft(false); } catch { /* Submission is already saved remotely. */ }
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not submit your design.'); }
    finally { setBusy(false); }
  }
  async function download() {
    try {
      const uri = await previewPng(side === 'front' ? front.current! : back.current!, design.customFonts);
      const a = document.createElement('a'); a.href = uri; a.download = `jersey-${side}.png`; a.click();
    } catch { setMessage('Could not export the preview.'); }
  }
  return <main className="jersey-studio">
    <header className="studio-header"><div><p className="studio-eyebrow">NURNREBEL / CUSTOM LAB</p><h1>Your jersey.<br/><span>Your rules.</span></h1><p>Build it here. Send it to our team. We’ll review the details with you.</p></div><div className="studio-steps"><span>01 Design</span><span>02 Submit</span><span>03 Team review</span></div></header>
    <div className="studio-toolbar"><div><button type="button" onClick={() => setCursor(cursor - 1)} disabled={!cursor || busy}>↶ Undo</button><button type="button" onClick={() => setCursor(cursor + 1)} disabled={cursor === history.length - 1 || busy}>↷ Redo</button></div><div><button type="button" onClick={save}>Save draft</button>{hasDraft && <button type="button" onClick={restore} disabled={busy}>Restore draft</button>}<button type="button" onClick={download}>Export {side}</button></div></div>
    <fieldset disabled={busy} className="studio-workspace">
      <aside className="studio-panel"><p className="studio-eyebrow">01 / THE FOUNDATION</p><h2>Make it yours</h2>
        <label>Jersey cut<select value={design.style} onChange={e => change({ ...design, style: e.target.value as JerseyDesign['style'] })}>{Object.entries(jerseyCuts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Neckline<select value={design.neck} onChange={e => change({ ...design, neck: e.target.value as JerseyDesign['neck'] })}><option value="round">Round neck</option><option value="v">V-neck</option></select></label>
        <label>Pattern<select value={design.pattern} onChange={e => change({ ...design, pattern: e.target.value as JerseyDesign['pattern'] })}><option value="solid">Solid</option><option value="stripes">Vertical stripes</option><option value="diagonal">Diagonal stripes</option></select></label>
        <div className="studio-colors">{(['base', 'accent', 'trim'] as const).map(c => <label key={c}>{c}<input type="color" value={design[c]} onChange={e => change({ ...design, [c]: e.target.value })}/></label>)}</div>
        <hr/><p className="studio-eyebrow">02 / THE DETAILS</p><div className="studio-add"><button type="button" onClick={() => addLayer('text', 'YOUR TEXT')}>+ Add text</button><label className="studio-upload">+ Artwork<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }}/></label></div>
        <p className="studio-help">PNG, JPEG or WebP, up to 5 MB. Transparent PNG works well for logos. Maximum 16 layers across both sides.</p>
        <label className="studio-upload">+ Upload custom font<input type="file" accept=".woff,.woff2,.ttf,.otf" onChange={e => { void uploadFont(e.target.files?.[0]); e.target.value = ''; }}/></label>
        <p className="studio-help">WOFF, WOFF2, TTF or OTF, up to 200 KB each. Use up to 3 fonts you have permission to use. Fonts are saved with your draft and submission.</p>
        {(design.customFonts ?? []).map(font => <div key={font.id} className="studio-font-item"><span>{font.name}</span><button type="button" aria-label={`Remove font ${font.name}`} onClick={() => removeFont(font.id)}>Remove</button></div>)}
        <div className="studio-layers" aria-label={`${side} layers`}>{design.layers.filter(l => l.side === side).map((l, i) => <button key={l.id} type="button" aria-pressed={l.id === selected} onClick={() => setSelected(l.id)}><span>{l.kind === 'text' ? 'T' : '▧'}</span>{l.kind === 'text' ? l.content : `Artwork ${i + 1}`}</button>)}</div>
        {layer && <div className="studio-layer-controls"><h3>Selected layer</h3>
          {layer.kind === 'text' && <><label>Text<input maxLength={40} value={layer.content} onChange={e => patchLayer({ content: e.target.value })}/></label><label>Typeface<select value={layer.font} onChange={e => patchLayer({ font: e.target.value as JerseyLayer['font'] })}>{Object.entries(typefaces).map(([value, font]) => <option key={value} value={value}>{font.label}</option>)}{(design.customFonts ?? []).map(font => <option key={font.id} value={font.id}>{font.name} (custom)</option>)}</select></label><label>Text color<input type="color" value={layer.color} onChange={e => patchLayer({ color: e.target.value })}/></label></>}
          {([['size', 'Size', 12, 140], ['rotation', 'Rotation', -180, 180], ['x', 'Horizontal position', 75, 325], ['y', 'Vertical position', 110, 410]] as const).map(([property, label, min, max]) => <label key={property}>{label} <span>{layer[property]}</span><input type="range" min={min} max={max} value={layer[property]} onChange={e => patchLayer({ [property]: Number(e.target.value) })}/></label>)}
          <div className="studio-add"><button type="button" onClick={() => { const id = crypto.randomUUID(); if (design.layers.length >= 16) return setMessage('Use at most 16 layers.'); change({ ...design, layers: [...design.layers, { ...layer, id, side: side === 'front' ? 'back' : 'front' }] }); setMessage('Layer copied to the other side.'); }}>Copy to {side === 'front' ? 'back' : 'front'}</button><button type="button" onClick={() => { const layers = design.layers.filter(l => l.id !== layer.id); change({ ...design, layers: [...layers, layer] }); }}>Bring forward</button><button type="button" onClick={() => { change({ ...design, layers: design.layers.filter(l => l.id !== layer.id) }); setSelected(undefined); }}>Delete</button></div>
        </div>}
      </aside>
      <section className="studio-canvas"><div className="studio-view-toggle">{(['front', 'back'] as const).map(s => <button type="button" key={s} aria-pressed={side === s} onClick={() => { setSide(s); setSelected(undefined); }}>{s}</button>)}</div><div className="studio-garment"><JerseyPreview design={design} side={side} selected={selected} onSelect={setSelected} onMove={dragLayer}/></div><p className="studio-help">Drag a layer to move it. Position sliders offer precise placement.</p><div className="studio-miniatures"><button type="button" onClick={() => { setSide('front'); setSelected(undefined); }}><JerseyPreview design={design} side="front" svgRef={front}/><span>Front</span></button><button type="button" onClick={() => { setSide('back'); setSelected(undefined); }}><JerseyPreview design={design} side="back" svgRef={back}/><span>Back</span></button></div><p className="studio-help">Concept preview. Final fit, colors and print placement are confirmed by our team.</p></section>
      <aside className="studio-panel studio-review"><p className="studio-eyebrow">03 / READY FOR REVIEW</p><h2>Send your concept</h2><p className="studio-help">Our team checks artwork and production details. You’ll see approval, a decline, or requested changes below.</p>
        {parentId && <div className="studio-revision">Revising a submitted design.<button type="button" onClick={() => setParentId(null)}>Submit as a new design instead</button></div>}
        <form onSubmit={submit}><label>Design name<input required maxLength={80} value={title} onChange={e => setTitle(e.target.value)}/></label><div className="studio-order-fields"><label>Size<select value={size} onChange={e => setSize(e.target.value)}>{sizes.map(s => <option key={s}>{s}</option>)}</select></label><label>Quantity<input type="number" required min={1} max={200} step={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))}/></label></div><label>Notes for the team<textarea rows={4} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Team details, print preferences or questions…"/></label><label className="studio-consent"><input type="checkbox" required checked={acknowledge} onChange={e => setAcknowledge(e.target.checked)}/><span>I have permission to use this artwork and understand this is a design review request.</span></label>
          {loading ? <p>Loading account…</p> : isLoggedIn ? <button className="studio-primary" type="submit" disabled={busy || !acknowledge}>{busy ? 'Submitting…' : parentId ? 'Submit revised design →' : 'Submit for review →'}</button> : <Link className="studio-primary" href="/auth">Sign in to submit →</Link>}
        </form><p className="studio-help">No payment is collected here. Approval does not place an order.</p><div className="studio-review-tag">CUSTOM MADE.<br/>TEAM APPROVED.</div>
      </aside>
    </fieldset>
    {message && <p className="studio-message" role="status">{message}</p>}
    <section className="studio-submissions"><p className="studio-eyebrow">YOUR DESIGN JOURNEY</p><h2>My submissions</h2>{listError && <p role="alert">{listError}</p>}{!isLoggedIn ? <p>Sign in to track your designs. Your saved draft stays on this device.</p> : <><p className="studio-help">Decisions and notes update here as our team reviews your designs.</p>{submissions.length === 0 && !listError && <p>No designs submitted yet.</p>}<div className="studio-submission-grid">{submissions.map(s => <article key={s.id} className="studio-submission"><div className="studio-submission-previews"><JerseyPreview design={s.design} side="front"/><JerseyPreview design={s.design} side="back"/></div><span className={`studio-status ${s.status}`}>{labels[s.status] || s.status}</span><h3>{s.title}</h3><p>{s.size} · {s.quantity} {s.quantity === 1 ? 'jersey' : 'jerseys'}{s.createdAt && ` · ${new Date(s.createdAt.seconds * 1000).toLocaleDateString()}`}</p>{s.reviewNote && <blockquote>{s.reviewNote}</blockquote>}<button type="button" disabled={busy} onClick={() => { change(s.design); setTitle(s.title); setSize(s.size); setQuantity(s.quantity); setNotes(s.notes); setParentId(s.status === 'changes_requested' ? s.id : null); setSelected(undefined); setAcknowledge(false); setMessage(s.status === 'changes_requested' ? 'Design loaded for revision. Make your changes and submit again.' : 'Design copied into the editor.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{s.status === 'changes_requested' ? 'Revise design' : 'Use as a starting point'}</button></article>)}</div></>}</section>
  </main>;
}
