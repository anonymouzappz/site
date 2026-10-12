import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';
import { finishCheckout } from './commerce';
import { createOrderFromCheckoutSession } from './orders/createOrderFromCheckoutSession';

const stripeKey = defineSecret('STRIPE_SECRET_KEY');
export const cleanupCheckouts = onSchedule({ schedule: 'every 30 minutes', region: 'us-east1', secrets: [stripeKey] }, async () => {
  const db = admin.firestore();
  const stripe = new Stripe(stripeKey.value());
  const pending = await db.collection('checkout_sessions').where('inventoryState', '==', 'reserved').get();
  for (const checkout of pending.docs) {
    const data = checkout.data();
    const created = data.createdAt?.toMillis();
    if (!created || created > Date.now() - 60 * 60 * 1000) continue;
    try {
      let session: Omit<Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>, 'lastResponse'> | null = data.stripeCheckoutSessionId ? await stripe.checkout.sessions.retrieve(data.stripeCheckoutSessionId) : null;
      // Recover a payment URL created just before a process crash, using its metadata.
      if (!session) {
        for await (const candidate of stripe.checkout.sessions.list({ created: { gte: Math.floor(created / 1000), lte: Math.floor(created / 1000) + 3600 }, limit: 100 })) {
          if (candidate.metadata?.checkoutId === checkout.id) { session = candidate; break; }
        }
      }
      if (session?.payment_status === 'paid') await createOrderFromCheckoutSession(session);
      else {
        if (session?.status === 'open') session = await stripe.checkout.sessions.expire(session.id);
        if (!session || session.status === 'expired') await finishCheckout(db, checkout.id);
      }
    } catch (error) { console.error(`Checkout recovery failed: ${checkout.id}`, error); }
  }
});
