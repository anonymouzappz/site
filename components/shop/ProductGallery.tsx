"use client";
import Image from 'next/image';
import { ChevronLeft, ChevronRight, RotateCcw, ShoppingBag, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

type View = { zoom: number; x: number; y: number };
const initialView: View = { zoom: 1, x: 0, y: 0 };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export default function ProductGallery({ images: source, name, featured, discount }: { images: string[]; name: string; featured?: boolean; discount?: number }) {
  const images = [...new Set(source.filter(Boolean))];
  const [selected, setSelected] = useState(0), [open, setOpen] = useState(false), [view, setView] = useState<View>(initialView);
  const index = Math.min(selected, Math.max(0, images.length - 1)), image = images[index];
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null), frame = useRef<HTMLDivElement>(null);
  const currentView = useRef(view);
  const imageDimensions = useRef<{ width: number; height: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const origin = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ distance: number; x: number; y: number; view: View } | null>(null);
  const hadPinch = useRef(false), lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const updateView = useCallback((next: View) => {
    const bounds = frame.current?.getBoundingClientRect();
    const zoom = clamp(next.zoom, 1, 4);
    const width = bounds?.width ?? 0, height = bounds?.height ?? 0;
    const natural = imageDimensions.current;
    const fit = natural ? Math.min(width / natural.width, height / natural.height) : 1;
    const imageWidth = natural ? natural.width * fit : width, imageHeight = natural ? natural.height * fit : height;
    const maxX = Math.max(0, (imageWidth * zoom - width) / 2), maxY = Math.max(0, (imageHeight * zoom - height) / 2);
    const value = { zoom, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
    currentView.current = value; setView(value);
  }, []);
  const zoomTo = useCallback((zoom: number, clientX?: number, clientY?: number) => {
    const bounds = frame.current?.getBoundingClientRect(), previous = currentView.current;
    const x = bounds && clientX !== undefined ? clientX - bounds.left - bounds.width / 2 : 0;
    const y = bounds && clientY !== undefined ? clientY - bounds.top - bounds.height / 2 : 0;
    const ratio = clamp(zoom, 1, 4) / previous.zoom;
    updateView({ zoom, x: x - (x - previous.x) * ratio, y: y - (y - previous.y) * ratio });
  }, [updateView]);
  function navigate(delta: number) {
    setSelected((index + delta + images.length) % images.length);
    imageDimensions.current = null;
    updateView(initialView); pointers.current.clear(); pinch.current = null; lastTap.current = null;
  }
  function choose(index: number) { setSelected(index); imageDimensions.current = null; updateView(initialView); }
  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    if (!element.open) element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.setProperty('overflow', 'hidden');
    const activePointers = pointers.current;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomTo(currentView.current.zoom * Math.exp(-event.deltaY * .002), event.clientX, event.clientY);
    };
    const canvas = frame.current!;
    const resize = () => updateView(currentView.current);
    canvas.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('resize', resize);
    return () => {
      canvas.removeEventListener('wheel', wheel); window.removeEventListener('resize', resize);
      document.body.style.setProperty('overflow', previous); element.close(); activePointers.clear(); pinch.current = null;
    };
  }, [open, zoomTo, updateView]);
  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (pointers.current.size >= 2) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!pointers.current.size) { origin.current = { x: event.clientX, y: event.clientY }; hadPinch.current = false; }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, view: currentView.current };
      hadPinch.current = true;
      lastTap.current = null;
    }
  }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId); if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()], start = pinch.current, bounds = frame.current!.getBoundingClientRect();
      const zoom = clamp(start.view.zoom * Math.hypot(a.x - b.x, a.y - b.y) / start.distance, 1, 4), ratio = zoom / start.view.zoom;
      const centerX = bounds.left + bounds.width / 2, centerY = bounds.top + bounds.height / 2;
      updateView({ zoom, x: (a.x + b.x) / 2 - centerX - (start.x - centerX - start.view.x) * ratio, y: (a.y + b.y) / 2 - centerY - (start.y - centerY - start.view.y) * ratio });
    } else if (currentView.current.zoom > 1) updateView({ ...currentView.current, x: currentView.current.x + event.clientX - previous.x, y: currentView.current.y + event.clientY - previous.y });
  }
  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId); pinch.current = null;
    if (event.type === 'pointercancel') { origin.current = null; lastTap.current = null; return; }
    if (pointers.current.size || hadPinch.current || !origin.current) return;
    const dx = event.clientX - origin.current.x, dy = event.clientY - origin.current.y;
    if (currentView.current.zoom === 1 && images.length > 1 && Math.abs(dx) > 50 && Math.abs(dy) < 75) navigate(dx < 0 ? 1 : -1);
    else if (event.pointerType !== 'mouse' && Math.hypot(dx, dy) < 8) {
      const previous = lastTap.current, time = event.timeStamp;
      if (previous && time - previous.time < 320 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 25) {
        zoomTo(currentView.current.zoom > 1 ? 1 : 2.5, event.clientX, event.clientY); lastTap.current = null;
      } else lastTap.current = { time, x: event.clientX, y: event.clientY };
    }
    origin.current = null;
  }
  return <div className="space-y-4">
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
      {featured && <span className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">Featured</span>}
      {!!discount && <span className="pointer-events-none absolute right-5 top-5 z-10 rounded-full bg-foreground px-4 py-2 text-[10px] font-black text-background">Save {discount}%</span>}
      {image ? <button type="button" className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-background focus-visible:outline-2 focus-visible:outline-accent" aria-label={`Zoom image ${index + 1} of ${name}`} aria-haspopup="dialog" onClick={() => { updateView(initialView); setOpen(true); }}>
        <Image src={image} alt={`${name}, view ${index + 1}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" priority draggable={false}/>
        <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-bold text-foreground"><ZoomIn size={16}/>Tap to zoom</span>
      </button> : <div className="flex aspect-square items-center justify-center rounded-[1.5rem] bg-background"><ShoppingBag size={72} className="text-muted"/></div>}
      {images.length > 1 && <div className="mt-3 flex items-center justify-between"><button type="button" aria-label="Previous product image" onClick={() => navigate(-1)} className="rounded-full border border-border p-2"><ChevronLeft size={18}/></button><span className="text-xs text-muted">{index + 1} / {images.length}</span><button type="button" aria-label="Next product image" onClick={() => navigate(1)} className="rounded-full border border-border p-2"><ChevronRight size={18}/></button></div>}
    </div>
    {images.length > 1 && <div className="flex gap-3 overflow-x-auto pb-2" aria-label="Product image thumbnails">{images.map((url, i) => <button key={url} type="button" aria-label={`Show product image ${i + 1}`} aria-pressed={i === index} onClick={() => choose(i)} className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-card ${i === index ? 'border-accent' : 'border-border'}`}><Image src={url} alt={`${name}, view ${i + 1}`} fill sizes="80px" className="object-contain" draggable={false}/></button>)}</div>}
    <dialog ref={dialog} aria-labelledby={titleId} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-background p-0 text-foreground backdrop:bg-black/80" onCancel={event => { event.preventDefault(); setOpen(false); }} onClose={() => setOpen(false)} onKeyDown={event => {
      if (event.key === 'ArrowLeft' && images.length > 1) { event.preventDefault(); navigate(-1); }
      if (event.key === 'ArrowRight' && images.length > 1) { event.preventDefault(); navigate(1); }
    }}>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border p-4"><div><h2 id={titleId} className="text-sm font-bold">{name}</h2><p className="text-xs text-muted">Image {index + 1} of {images.length}</p></div><button type="button" aria-label="Close product viewer" onClick={() => setOpen(false)} className="rounded-full border border-border p-3"><X size={20}/></button></header>
        <div className="flex flex-wrap items-center justify-center gap-3 p-3"><button type="button" aria-label="Zoom out" disabled={view.zoom <= 1} onClick={() => zoomTo(view.zoom - .5)} className="rounded-full border border-border p-3 disabled:opacity-40"><ZoomOut size={20}/></button><span className="w-14 text-center text-sm tabular-nums" aria-live="polite">{Math.round(view.zoom * 100)}%</span><button type="button" aria-label="Zoom in" disabled={view.zoom >= 4} onClick={() => zoomTo(view.zoom + .5)} className="rounded-full border border-border p-3 disabled:opacity-40"><ZoomIn size={20}/></button><button type="button" aria-label="Reset image zoom" onClick={() => updateView(initialView)} className="rounded-full border border-border p-3"><RotateCcw size={18}/></button>{images.length > 1 && <><button type="button" aria-label="Previous image in viewer" onClick={() => navigate(-1)} className="rounded-full border border-border p-3"><ChevronLeft size={20}/></button><button type="button" aria-label="Next image in viewer" onClick={() => navigate(1)} className="rounded-full border border-border p-3"><ChevronRight size={20}/></button></>}</div>
        <div ref={frame} className="relative min-h-0 flex-1 overflow-hidden" style={{ touchAction: 'none', cursor: view.zoom > 1 ? 'grab' : 'zoom-in' }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onDoubleClick={event => zoomTo(view.zoom > 1 ? 1 : 2.5, event.clientX, event.clientY)}>
          {image && <div className="pointer-events-none absolute inset-0 select-none" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: 'center' }}><Image key={image} src={image} alt={`${name}, enlarged view ${index + 1}`} fill sizes="100vw" className="object-contain" draggable={false} onLoad={event => { const element = event.currentTarget; if (element.naturalWidth && element.naturalHeight) { imageDimensions.current = { width: element.naturalWidth, height: element.naturalHeight }; updateView(currentView.current); } }}/></div>}
        </div>
        <footer className="shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted">Pinch or double-tap to zoom. Drag to inspect. Swipe at 100% to change images. On desktop, use the scroll wheel or double-click.</footer>
      </div>
    </dialog>
  </div>;
}
