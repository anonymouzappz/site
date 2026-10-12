import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const source = String(body.source || 'website').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'website';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
    const id = createHash('sha256').update(email).digest('hex');
    const legacy = await adminDb.collection('emailSubscribers').where('email', '==', email).limit(1).get();
    const ref = legacy.empty ? adminDb.collection('emailSubscribers').doc(id) : legacy.docs[0].ref;
    await adminDb.runTransaction(async tx => {
      const existing = await tx.get(ref);
      tx.set(ref, { email, isActive: true, source, sources: { [source]: true },
        lastSignupAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        ...(!existing.exists ? { createdAt: FieldValue.serverTimestamp(), subscribedAt: FieldValue.serverTimestamp() } : {}) }, { merge: true });
      if (!existing.exists) tx.set(adminDb.collection('mail').doc(`welcome_${id}`), {
        to: [email], message: { subject: 'Welcome to Nurnrebel / XNX', text: 'You are on the list. Explore the latest drops at https://nurnrebel.com/shop' },
        metadata: { type: 'welcome_email', source, subscriberId: id }, createdAt: FieldValue.serverTimestamp(),
      });
    });
    return NextResponse.json({ subscribed: true });
  } catch { return NextResponse.json({ error: 'Unable to subscribe. Please try again.' }, { status: 500 }); }
}
