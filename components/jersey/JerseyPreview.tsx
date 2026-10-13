"use client";
import { useEffect, useId, useState } from 'react';
import { customFontFamily, typefaces, type CustomFont, type JerseyDesign, type JerseyLayer, type Side } from '@/lib/jersey';
import { loadCustomFont } from '@/lib/jersey-fonts';
const cuts: Record<JerseyDesign['style'], { outline: string; cuffs?: string }> = {
  basketball: { outline: 'M145 65 L116 76 Q119 137 96 164 Q101 282 89 434 Q200 449 311 434 Q299 282 304 164 Q281 137 284 76 L255 65' },
  soccer: { outline: 'M145 65 L108 78 Q88 89 70 108 L36 145 L72 182 L99 159 Q102 288 90 434 Q200 449 310 434 Q298 288 301 159 L328 182 L364 145 L330 108 Q312 89 292 78 L255 65', cuffs: 'M39 143 L74 178 M326 178 L361 143' },
  football: { outline: 'M145 65 L104 76 Q80 79 62 103 L26 148 L72 193 L98 169 Q105 274 88 428 Q200 442 312 428 Q295 274 302 169 L328 193 L374 148 L338 103 Q320 79 296 76 L255 65', cuffs: 'M30 146 L74 189 M326 189 L370 146' },
  baseball: { outline: 'M145 65 L111 78 Q88 89 70 114 L38 163 L80 189 L103 160 Q100 286 88 431 Q125 451 177 449 L200 443 L223 449 Q275 451 312 431 Q300 286 297 160 L320 189 L362 163 L330 114 Q312 89 289 78 L255 65', cuffs: 'M42 160 L81 184 M319 184 L358 160' },
  hockey: { outline: 'M145 65 L110 77 Q81 81 67 113 L17 348 L71 363 L105 231 L91 435 Q200 452 309 435 L295 231 L329 363 L383 348 L333 113 Q319 81 290 77 L255 65', cuffs: 'M20 340 L73 354 M327 354 L380 340' },
  long_sleeve: { outline: 'M145 65 L114 78 Q92 85 77 112 L28 353 L66 365 L106 200 Q105 312 94 433 Q200 449 306 433 Q295 312 294 200 L334 365 L372 353 L323 112 Q308 85 286 78 L255 65', cuffs: 'M30 344 L68 355 M332 355 L370 344' },
};
export default function JerseyPreview({ design, side, selected, onSelect, onMove, svgRef }: {
  design: JerseyDesign; side: Side; selected?: string; onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void; svgRef?: React.Ref<SVGSVGElement>;
}) {
  const id = useId().replace(/:/g, '');
  const [fontError, setFontError] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all((design.customFonts ?? []).map(loadCustomFont)).then(() => {
      if (active) setFontError(false);
    }).catch(() => { if (active) setFontError(true); });
    return () => { active = false; };
  }, [design.customFonts]);
  const cut = cuts[design.style];
  const neckline = side === 'back' ? 'M145 65 Q200 92 255 65' : design.neck === 'v' ? 'M145 65 L200 120 L255 65' : 'M145 65 Q200 127 255 65';
  const closingNeck = side === 'back' ? 'Q200 92 145 65' : design.neck === 'v' ? 'L200 120 L145 65' : 'Q200 127 145 65';
  const path = `${cut.outline} ${closingNeck} Z`;
  function move(e: React.PointerEvent<SVGGElement>, layer: JerseyLayer) {
    if (!onMove) return;
    const svg = e.currentTarget.ownerSVGElement!;
    const matrix = svg.getScreenCTM(); if (!matrix) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const offsetX = point.x - layer.x, offsetY = point.y - layer.y;
    e.currentTarget.setPointerCapture(e.pointerId);
    onSelect?.(layer.id);
    const el = e.currentTarget;
    const dragging = (ev: PointerEvent) => {
      const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
      onMove(layer.id, Math.round(Math.max(75, Math.min(325, p.x - offsetX))), Math.round(Math.max(110, Math.min(410, p.y - offsetY))));
    };
    const stop = () => { el.removeEventListener('pointermove', dragging); el.removeEventListener('pointerup', stop); el.removeEventListener('pointercancel', stop); };
    el.addEventListener('pointermove', dragging); el.addEventListener('pointerup', stop); el.addEventListener('pointercancel', stop);
  }
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img" aria-label={`${side} jersey preview`} className="jersey-svg">
    {fontError && <text x="200" y="490" textAnchor="middle" fontSize="11" fill="#dc8787">Custom font could not load. Please upload it again.</text>}
    <defs>
      <clipPath id={`clip-${id}`}><path d={path}/></clipPath>
      <pattern id={`stripe-${id}`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform={design.pattern === 'diagonal' ? 'rotate(-35)' : undefined}><rect width="18" height="40" fill={design.accent}/></pattern>
      <linearGradient id={`shade-${id}`}><stop stopColor="#000000" stopOpacity=".32"/><stop offset=".24" stopColor="#ffffff" stopOpacity=".12"/><stop offset=".48" stopColor="#ffffff" stopOpacity=".02"/><stop offset=".76" stopColor="#000000" stopOpacity=".06"/><stop offset="1" stopColor="#000000" stopOpacity=".32"/></linearGradient>
      <linearGradient id={`vertical-${id}`} x2="0" y2="1"><stop stopColor="#ffffff" stopOpacity=".12"/><stop offset=".35" stopColor="#ffffff" stopOpacity="0"/><stop offset="1" stopColor="#000000" stopOpacity=".15"/></linearGradient>
      <pattern id={`fabric-${id}`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1 H4 M1 0 V4" stroke="#ffffff" strokeWidth=".45" opacity=".08"/></pattern>
      <radialGradient id={`shadow-${id}`}><stop stopColor="#000000" stopOpacity=".28"/><stop offset="1" stopColor="#000000" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="200" cy="466" rx="145" ry="19" fill={`url(#shadow-${id})`}/>
    <path d={path} fill={design.base} stroke="#000000" strokeOpacity=".3" strokeWidth="1.5" strokeLinejoin="round"/>
    <g clipPath={`url(#clip-${id})`}>
      {design.pattern !== 'solid' && <rect width="400" height="500" fill={`url(#stripe-${id})`}/>}
      <path d={path} fill={`url(#shade-${id})`}/>
      <path d={path} fill={`url(#vertical-${id})`}/>
      <path d={path} fill={`url(#fabric-${id})`}/>
      {cut.cuffs && <path d={cut.cuffs} fill="none" stroke={design.trim} strokeWidth="7"/>}
      {design.style === 'basketball' && <path d="M116 76 Q119 137 96 164 M284 76 Q281 137 304 164" fill="none" stroke={design.trim} strokeWidth="7"/>}
      {design.style === 'football' && <path d="M73 104 Q111 109 131 139 M327 104 Q289 109 269 139" fill="none" stroke="#000000" strokeWidth="1.5" opacity=".18"/>}
      {design.style === 'baseball' && side === 'front' && <g>
        <path d={`M200 ${design.neck === 'v' ? 120 : 96} V445`} stroke={design.trim} strokeWidth="7" opacity=".45"/>
        <path d="M196 130 V441 M204 130 V441" stroke="#000000" strokeWidth=".6" opacity=".3" strokeDasharray="2 3"/>
        {[147, 191, 235, 279, 323, 367, 411].map(y => <g key={y}><circle cx="200" cy={y} r="3" fill={design.trim} stroke="#000000" strokeOpacity=".25" strokeWidth=".8"/><path d={`M199 ${y} h2`} stroke="#000000" strokeOpacity=".4" strokeWidth=".6"/></g>)}
      </g>}
      {design.layers.filter(l => l.side === side).map(l => <g key={l.id} transform={`translate(${l.x} ${l.y}) rotate(${l.rotation})`} onPointerDown={e => move(e, l)} onClick={() => onSelect?.(l.id)} style={{ cursor: onMove ? 'move' : undefined, touchAction: 'none' }}>
        {l.kind === 'text' ? <text data-custom-font={l.font.startsWith('custom-') ? l.font : undefined} textAnchor="middle" dominantBaseline="central" fontSize={l.size} fontFamily={l.font.startsWith('custom-') ? customFontFamily(l.font) : typefaces[l.font as keyof typeof typefaces].family} fontWeight={l.font.startsWith('custom-') ? 400 : typefaces[l.font as keyof typeof typefaces].weight} fill={l.font === 'varsity' ? design.base : l.color} stroke={l.font === 'varsity' ? l.color : undefined} strokeWidth={l.font === 'varsity' ? Math.max(1, l.size * .025) : undefined} paintOrder="stroke fill" strokeLinejoin="round">{l.content}</text> : <image href={l.content} x={-l.size / 2} y={-l.size / 2} width={l.size} height={l.size} preserveAspectRatio="xMidYMid meet"/>}
        {selected === l.id && <rect x={-Math.max(l.size / 2, l.kind === 'text' ? l.content.length * l.size * .31 : 0) - 6} y={-l.size / 2 - 6} width={Math.max(l.size, l.kind === 'text' ? l.content.length * l.size * .62 : 0) + 12} height={l.size + 12} fill="none" stroke="#bce885" strokeDasharray="4 4" strokeWidth="2"/>}
      </g>)}
    </g>
    <path d={neckline} stroke={design.trim} strokeWidth="8" fill="none" strokeLinejoin="round"/>
    <path d={neckline} stroke="#000000" strokeWidth=".8" strokeOpacity=".18" fill="none" strokeDasharray="2 3"/>
    <path d="M87 427 Q200 443 313 427" stroke="#ffffff" strokeWidth=".8" fill="none" opacity=".22" strokeDasharray="2 2" clipPath={`url(#clip-${id})`}/>
  </svg>;
}

export async function previewPng(svg: SVGSVGElement, customFonts: CustomFont[] = []) {
  await Promise.all(customFonts.map(loadCustomFont));
  await Promise.all(customFonts.map(font => document.fonts.load(`400 25px ${customFontFamily(font.id)}`)));
  await document.fonts.ready;
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('width', '400'); copy.setAttribute('height', '500');
  // SVG images cannot reliably use fonts registered on the page. Embed the
  // custom lettering as pixels so exported and admin previews match the editor.
  const originalText = svg.querySelectorAll<SVGTextElement>('text[data-custom-font]');
  const clonedText = copy.querySelectorAll<SVGTextElement>('text[data-custom-font]');
  originalText.forEach((text, index) => {
    const fontId = text.getAttribute('data-custom-font')!;
    if (!customFonts.some(f => f.id === fontId)) throw new Error('The custom font is missing from this design.');
    const bounds = text.getBBox(), padding = 4;
    const canvas = document.createElement('canvas');
    const width = Math.max(1, bounds.width + padding * 2), height = Math.max(1, bounds.height + padding * 2);
    canvas.width = Math.ceil(width * 2); canvas.height = Math.ceil(height * 2);
    const context = canvas.getContext('2d')!;
    context.scale(2, 2); context.translate(-bounds.x + padding, -bounds.y + padding);
    context.font = `400 ${text.getAttribute('font-size')}px ${customFontFamily(fontId)}`;
    context.textAlign = 'center'; context.textBaseline = 'alphabetic';
    context.fillStyle = text.getAttribute('fill') || '#ffffff';
    const metrics = context.measureText(text.textContent || '');
    context.fillText(text.textContent || '', 0, bounds.y + metrics.actualBoundingBoxAscent);
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('x', String(bounds.x - padding)); image.setAttribute('y', String(bounds.y - padding));
    image.setAttribute('width', String(width)); image.setAttribute('height', String(height));
    image.setAttribute('href', canvas.toDataURL('image/png'));
    clonedText[index].replaceWith(image);
  });
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    const img = new Image(); img.src = url; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 500;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
