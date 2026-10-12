"use client";
import Link from 'next/link';
import { useContent } from '@/lib/useContent';
export default function CollectionGrid() {
  const { items, error } = useContent('collections');
  if (error) return <p className="px-5 text-muted" role="status">{error}</p>;
  if (!items.length) return null;
  return <section className="mx-auto max-w-7xl px-5 py-12">
    <h2 className="mb-6 text-3xl font-black uppercase">Explore Collections</h2>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <Link key={item.id} href={`/shop?collection=${encodeURIComponent(item.slug)}`} className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="aspect-video w-full object-cover" />}
      <div className="p-6"><h3 className="text-xl font-black uppercase">{item.name}</h3><p className="mt-2 text-sm text-muted">{item.description}</p></div>
    </Link>)}</div>
  </section>;
}
