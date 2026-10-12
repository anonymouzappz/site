import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import * as admin from 'firebase-admin';
import { finishCheckout } from './commerce';

import { createOrderFromCheckoutSession } from "./orders/createOrderFromCheckoutSession";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

type StripeCheckoutSession = {
  id: string;
  amount_total?: number | null;
  amount_subtotal?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  payment_intent?:
    | string
    | {
        id?: string;
      }
    | null;
  metadata?: Record<string, string> | null;
};

export const stripeWebhook = onRequest(
  {
    region: "us-east1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = new Stripe(stripeSecretKey.value());

    const signature = req.headers["stripe-signature"];

    if (!signature || Array.isArray(signature)) {
      res.status(400).send("Missing stripe-signature header.");
      return;
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value(),
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      res.status(400).send("Webhook signature verification failed.");
      return;
    }

    try {
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object as StripeCheckoutSession;

        await createOrderFromCheckoutSession(session);
      }
      if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object as StripeCheckoutSession;
        if (session.metadata?.checkoutId) await finishCheckout(admin.firestore(), session.metadata.checkoutId);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook handler error:", error);
      res.status(500).send("Webhook handler failed.");
    }
  },
);
