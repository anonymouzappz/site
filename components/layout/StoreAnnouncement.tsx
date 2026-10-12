"use client";
import { useStoreSettings } from '@/lib/useStoreSettings';
export default function StoreAnnouncement() {
  const settings = useStoreSettings();
  return settings.announcement ? <div className="bg-accent px-5 py-3 text-center text-sm font-bold text-white">{settings.announcement}</div> : null;
}
