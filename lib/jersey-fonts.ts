import { customFontFamily, type CustomFont } from './jersey';
const loadedFonts = new Map<string, Promise<FontFace>>();
export function loadCustomFont(font: CustomFont): Promise<FontFace> {
  // Including the source prevents stale font bytes if a saved design reuses an ID.
  const key = `${font.id}:${font.data}`;
  let pending = loadedFonts.get(key);
  if (!pending) {
    pending = new FontFace(customFontFamily(font.id), `url(${font.data})`, { weight: '400' }).load().then(face => {
      document.fonts.add(face); return face;
    }).catch(error => { loadedFonts.delete(key); throw error; });
    loadedFonts.set(key, pending);
  }
  return pending;
}
