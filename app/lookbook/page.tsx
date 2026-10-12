"use client";
import Link from 'next/link';
import { useContent } from '@/lib/useContent';
export default function LookbookPage() {
  const { items, loading, error } = useContent('lookbook');
  return <main className="mx-auto max-w-7xl px-5 py-20 text-foreground">
    <p className="text-xs font-black uppercase tracking-widest text-accent">Nurnrebel / XNX</p>
    <h1 className="my-6 text-5xl font-black uppercase md:text-7xl">The Lookbook</h1>
    <p className="mb-10 text-muted">Explore the latest campaigns, collections, and ways to wear your mindset.</p>
    {(loading || error || !items.length) && <p role="status">{error || (loading ? 'Loading looks...' : 'New looks are on the way.')}</p>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map(look => <article key={look.id} className="overflow-hidden rounded-2xl border border-border bg-card">
      {look.imageUrl && <picture>
        {look.mobileImageUrl && <source media="(max-width: 600px)" srcSet={look.mobileImageUrl} />}
        <img src={look.imageUrl} alt={look.title} className="aspect-[3/4] w-full object-cover" />
      </picture>}
      <div className="p-6"><p className="text-xs uppercase text-accent">{look.season} - {look.collection}</p>
        <h2 className="my-3 text-2xl font-black uppercase">{look.title}</h2>
        <p className="mb-5 text-sm text-muted">{look.description}</p>
        <Link href="/shop" className="font-bold text-accent">Shop the looks</Link>
      </div>
    </article>)}</div>
  </main>;
}
