import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('session_id');
  if (!id || !/^cs_[a-zA-Z0-9_]+$/.test(id)) return NextResponse.json({ error: 'Invalid checkout session.' }, { status: 400 });
  try {
    const session = await new Stripe(process.env.STRIPE_SECRET_KEY!).checkout.sessions.retrieve(id);
    const order = await adminDb.collection('orders').doc(id).get();
    return NextResponse.json({ paid: session.payment_status === 'paid', orderCreated: order.exists,
      fulfillmentStatus: order.data()?.fulfillmentStatus || '' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to verify payment. Please try again.' }, { status: 503 });
  }
}
