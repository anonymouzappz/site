"use client";
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DocumentData[]>([]);
  const [message, setMessage] = useState('Loading orders…');
  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, 'orders'), where('customerId', '==', user.uid)), snapshot => {
      setOrders(snapshot.docs.map((doc): DocumentData => ({ ...doc.data(), id: doc.id })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setMessage(snapshot.empty ? 'Your orders will appear here after payment.' : '');
    }, () => setMessage('Unable to load your orders. Please try again.'));
  }, [user]);
  return <section className="mx-auto max-w-7xl px-5 pb-16">
    <h2 className="mb-6 text-3xl font-black uppercase">Your Orders</h2>
    {message && <p className="text-muted" role="status">{message}</p>}
    <div className="grid gap-4 md:grid-cols-2">{orders.map(order => <article key={order.id} className="rounded-2xl border border-border bg-card p-6">
      <p className="break-all text-xs text-muted">{order.id}</p>
      <p className="mt-2 font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'usd' }).format(order.total || 0)}</p>
      <p className="my-3 capitalize">{String(order.fulfillmentType || '').replaceAll('_', ' ')} · {String(order.fulfillmentStatus || '').replaceAll('_', ' ')}</p>
      {(order.items || []).map((item: DocumentData, index: number) => <p key={index} className="text-sm text-muted">{item.quantity} × {item.name} {Object.values(item.options || {}).join(' / ')}</p>)}
    </article>)}</div>
  </section>;
}
