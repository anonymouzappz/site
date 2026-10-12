"use client";
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';

export function useContent(collectionName: string, flag = 'isActive') {
  const [items, setItems] = useState<(DocumentData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => onSnapshot(query(collection(db, collectionName), where(flag, '==', true)), snapshot => {
    setItems(snapshot.docs.map((doc): DocumentData & { id: string } => ({ ...doc.data(), id: doc.id })).sort((a, b) =>
      Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(b.isFeatured || 0) - Number(a.isFeatured || 0)));
    setLoading(false); setError('');
  }, () => { setError('Unable to load content. Please try again.'); setLoading(false); }), [collectionName, flag]);
  return { items, loading, error };
}
