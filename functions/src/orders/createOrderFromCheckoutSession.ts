import * as admin from "firebase-admin";
import { finishCheckout } from "../commerce";

import type { CartItem } from "../types/cart";
import { centsToDollars, toNumber } from "../utils/stripeMetadata";

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

type CheckoutSessionDoc = {
  checkoutId?: string;
  status?: string;
  items?: CartItem[];
  fulfillmentType?: string;
  deliveryAddress?: Record<string, unknown> | null;
  deliveryEstimate?: Record<string, unknown> | null;
  shippingAddress?: Record<string, unknown> | null;
  selectedShippingRate?: Record<string, unknown> | null;
  subtotalCents?: number;
  fulfillmentFeeCents?: number;
  processingFeeCents?: number;
  totalCents?: number;
  totalWeightOz?: number;
};

function getFulfillmentStatus(fulfillmentType: string) {
  if (fulfillmentType === "pickup") return "ready_for_pickup_review";
  if (fulfillmentType === "delivery") return "needs_local_delivery";
  return "needs_shipping_label";
}

export async function createOrderFromCheckoutSession(
  session: StripeCheckoutSession,
) {
  if (session.payment_status !== "paid") return;
  const db = admin.firestore();

  const sessionId = session.id;
  const metadata = session.metadata || {};
  const checkoutId = metadata.checkoutId || "";

  if (!checkoutId) {
    throw new Error("Missing checkoutId in Stripe metadata.");
  }

  const checkoutRef = db.collection("checkout_sessions").doc(checkoutId);
  const checkoutSnap = await checkoutRef.get();

  if (!checkoutSnap.exists) {
    throw new Error(`Checkout session doc not found: ${checkoutId}`);
  }

  const checkout = checkoutSnap.data() as CheckoutSessionDoc;

  const orderRef = db.collection("orders").doc(sessionId);
  const existingOrder = await orderRef.get();

  if (existingOrder.exists) {
    console.log(`Order already exists for session ${sessionId}`);

    await checkoutRef.set(
      {
        status: "paid",
        orderId: sessionId,
        stripeCheckoutSessionId: sessionId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return;
  }

  const items = Array.isArray(checkout.items) ? checkout.items : [];

  if (items.length === 0) {
    throw new Error(`Checkout ${checkoutId} has no cart items.`);
  }

  const fulfillmentType = String(checkout.fulfillmentType || "shipping");

  const subtotalCents = toNumber(checkout.subtotalCents);
  const fulfillmentFeeCents = toNumber(checkout.fulfillmentFeeCents);
  const processingFeeCents = toNumber(checkout.processingFeeCents);

  const amountTotalCents = toNumber(session.amount_total);
  const amountSubtotalCents = toNumber(session.amount_subtotal);

  const customerEmail =
    session.customer_details?.email || session.customer_email || "";

  const customerName = session.customer_details?.name || "";

  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || "";

  const orderData = {
    checkoutId,

    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId,

    status: "paid",
    paymentStatus: session.payment_status || "paid",
    currency: session.currency || "usd",

    customerEmail,
    customerName,

    items,

    fulfillmentType,
    fulfillmentStatus: getFulfillmentStatus(fulfillmentType),

    deliveryAddress: checkout.deliveryAddress || null,
    deliveryEstimate: checkout.deliveryEstimate || null,
    shippingAddress: checkout.shippingAddress || null,
    selectedShippingRate: checkout.selectedShippingRate || null,

    subtotalCents,
    fulfillmentFeeCents,
    processingFeeCents,
    amountSubtotalCents,
    amountTotalCents,

    subtotal: centsToDollars(subtotalCents),
    fulfillmentFee: centsToDollars(fulfillmentFeeCents),
    processingFee: centsToDollars(processingFeeCents),
    total: centsToDollars(amountTotalCents),

    totalWeightOz: toNumber(checkout.totalWeightOz),

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),

    source: "stripe_webhook",
  };

  if (amountTotalCents !== toNumber(checkout.totalCents)) throw new Error("Payment total does not match checkout.");
  await finishCheckout(db, checkoutId, { id: sessionId, data: orderData });

  console.log(`Created order ${sessionId} from checkout ${checkoutId}`);
}