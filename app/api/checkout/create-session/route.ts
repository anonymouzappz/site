import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { reserveCart, finishCheckout, CartError } from "@/functions/src/commerce";
import { POST as estimateDelivery } from "@/app/api/delivery/estimate/route";
import type { CartItem } from "@/functions/src/types/cart";

export const runtime = "nodejs";


type FulfillmentType = "pickup" | "delivery" | "shipping";

type Address = {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
};

type DeliveryEstimate = {
  available: boolean;
  fee: number;
  reason: string;
  miles: number;
  minutes: number;
  originLabel: string;
  destination: string;
};

type ShippingRate = {
  objectId: string;
  provider: string;
  servicelevel: string;
  amount: string;
  currency: string;
  estimatedDays?: number;
  durationTerms?: string;
};

type CheckoutPayload = {
  items?: CartItem[];
  subtotal?: number;
  fulfillmentType?: FulfillmentType;
  fulfillmentFee?: number;
  total?: number;
  deliveryAddress?: Address | null;
  deliveryEstimate?: DeliveryEstimate | null;
  shippingAddress?: Address | null;
  selectedShippingRate?: ShippingRate | null;
  totalWeightOz?: number;
};

type CheckoutLineItem = {
  quantity: number;
  price_data: {
    currency: "usd";
    unit_amount: number;
    product_data: {
      name: string;
      description?: string;
      images?: string[];
      metadata?: Record<string, string>;
    };
  };
};

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toCents(value: unknown) {
  return Math.round(safeNumber(value) * 100);
}

function fromCents(value: number) {
  return Math.round(value) / 100;
}

function calculateProcessingFeeCents(baseAmountCents: number) {
  const percent = safeNumber(process.env.STRIPE_PROCESSING_PERCENT, 0.029);
  const fixedCents = safeNumber(
    process.env.STRIPE_PROCESSING_FIXED_CENTS,
    30,
  );

  if (baseAmountCents <= 0) return 0;

  const grossCents = Math.ceil(
    (baseAmountCents + fixedCents) / (1 - percent),
  );

  return Math.max(0, grossCents - baseAmountCents);
}

function getSiteUrl(req: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin
  );
}

export async function POST(req: Request) {
  let stripe: Stripe | null = null;
  let stripeSessionId = "";
  let stripeAttempted = false;
  let reserved = false;
  let checkoutRef:
    | FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
    | null = null;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as CheckoutPayload;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let customerId = "";
    const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
    if (token) {
      try { customerId = (await adminAuth.verifyIdToken(token)).uid; }
      catch { return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 }); }
      const profile = (await adminDb.collection('users').doc(customerId).get()).data();
      if (profile?.isDisabled === true) return NextResponse.json({ error: 'This account is disabled.' }, { status: 403 });
    }

    const fulfillmentType: FulfillmentType =
      body.fulfillmentType || "shipping";

    if (!["pickup", "delivery", "shipping"].includes(fulfillmentType)) {
      return NextResponse.json(
        { error: "Invalid fulfillment type." },
        { status: 400 },
      );
    }
    const settings = (await adminDb.collection('storeSettings').doc('public').get()).data();
    if (settings?.[`${fulfillmentType}Enabled`] === false) throw new CartError('This fulfillment method is currently unavailable.');

    checkoutRef = adminDb.collection("checkout_sessions").doc();
    const validItems = await reserveCart(adminDb, checkoutRef, body.items || [], customerId);
    reserved = true;
    let fulfillmentFee = 0;

    if (fulfillmentType === "delivery") {
      const response = await estimateDelivery(new Request(req.url, { method: 'POST', body: JSON.stringify(body.deliveryAddress) }));
      const estimate = await response.json();
      if (!response.ok || !estimate.available) throw new CartError(estimate.error || estimate.reason || 'Delivery unavailable.');
      body.deliveryEstimate = estimate;
      fulfillmentFee = safeNumber(estimate.fee);
    }

    if (fulfillmentType === "shipping") {
      const quoteId = body.selectedShippingRate?.objectId;
      if (!quoteId || quoteId.includes('/')) throw new CartError('Select a shipping rate before checkout.');
      const quote = (await adminDb.collection('shipping_quotes').doc(quoteId).get()).data();
      const weight = validItems.reduce((sum, item) => sum + safeNumber(item.shippingWeight) *
        ({ oz: 1, lb: 16, lbs: 16, kg: 35.274, g: 0.035274 }[item.shippingWeightUnit || 'oz'] || 1) * item.quantity, 0);
      const cleanAddress = (address: Address | null | undefined) => JSON.stringify(['street1','street2','city','state','zip'].map(key => String(address?.[key as keyof Address] || '').trim().toLowerCase()));
      if (!quote || quote.expiresAt.toMillis() < Date.now() || quote.currency !== 'USD' ||
          cleanAddress(quote.address) !== cleanAddress(body.shippingAddress) || Math.abs(quote.weight - weight) > 0.01) {
        throw new CartError('Your shipping quote expired or the cart changed. Calculate shipping again.');
      }
      body.selectedShippingRate = quote.rate;
      fulfillmentFee = safeNumber(quote.rate.amount);
    }

    const subtotalCents = validItems.reduce((total, item) => {
      const priceCents = toCents(item.price);
      const quantity = Math.max(1, Math.floor(safeNumber(item.quantity, 1)));

      return total + priceCents * quantity;
    }, 0);

    const fulfillmentFeeCents = toCents(fulfillmentFee);
    const baseBeforeProcessingFeeCents =
      subtotalCents + fulfillmentFeeCents;

    const processingFeeCents = calculateProcessingFeeCents(
      baseBeforeProcessingFeeCents,
    );

    const totalCents =
      baseBeforeProcessingFeeCents + processingFeeCents;

    const productLineItems: CheckoutLineItem[] = validItems.map((item) => {
      const quantity = Math.max(
        1,
        Math.floor(safeNumber(item.quantity, 1)),
      );

      return {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: toCents(item.price),
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : undefined,
            metadata: {
              productId: item.productId,
              slug: item.slug || "",
              shippingWeight: String(item.shippingWeight || 0),
              shippingWeightUnit: item.shippingWeightUnit || "oz",
            },
          },
        },
      };
    });

    const lineItems: CheckoutLineItem[] = [...productLineItems];

    if (fulfillmentFeeCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: fulfillmentFeeCents,
          product_data: {
            name:
              fulfillmentType === "delivery"
                ? "Local Delivery"
                : fulfillmentType === "shipping"
                  ? "Shipping"
                  : "Pickup",
            metadata: {
              fulfillmentType,
              shippingRateId: body.selectedShippingRate?.objectId || "",
              shippingProvider: body.selectedShippingRate?.provider || "",
              shippingService:
                body.selectedShippingRate?.servicelevel || "",
            },
          },
        },
      });
    }

    if (processingFeeCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: processingFeeCents,
          product_data: {
            name: "Processing Fee",
            description: "Card processing fee",
            metadata: {
              type: "processing_fee",
            },
          },
        },
      });
    }

    await checkoutRef.update({
      checkoutId: checkoutRef.id,
      status: "pending",

      items: validItems,

      fulfillmentType,
      deliveryAddress:
        fulfillmentType === "delivery" ? body.deliveryAddress || null : null,
      deliveryEstimate:
        fulfillmentType === "delivery" ? body.deliveryEstimate || null : null,
      shippingAddress:
        fulfillmentType === "shipping" ? body.shippingAddress || null : null,
      selectedShippingRate:
        fulfillmentType === "shipping"
          ? body.selectedShippingRate || null
          : null,

      subtotalCents,
      fulfillmentFeeCents,
      processingFeeCents,
      totalCents,

      subtotal: fromCents(subtotalCents),
      fulfillmentFee: fromCents(fulfillmentFeeCents),
      processingFee: fromCents(processingFeeCents),
      total: fromCents(totalCents),

      totalWeightOz: validItems.reduce((sum, item) => sum + safeNumber(item.shippingWeight) *
        ({ oz: 1, lb: 16, lbs: 16, kg: 35.274, g: 0.035274 }[item.shippingWeightUnit || 'oz'] || 1) * item.quantity, 0),

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),

      source: "next_checkout_api",
    });

    const siteUrl = getSiteUrl(req);

    stripeAttempted = true;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: Math.floor(Date.now() / 1000) + 1800,

      line_items: lineItems,

      billing_address_collection: "auto",

      metadata: {
        source: "nurnrebel_cart",
        checkoutId: checkoutRef.id,
      },

      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    }, { idempotencyKey: checkoutRef.id });
    stripeSessionId = session.id;

    await checkoutRef.update({
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: session.url,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      url: session.url,
      checkoutId: checkoutRef.id,
      subtotal: fromCents(subtotalCents),
      fulfillmentFee: fromCents(fulfillmentFeeCents),
      processingFee: fromCents(processingFeeCents),
      total: fromCents(totalCents),
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (checkoutRef && reserved) {
      // Never release units while a live payment URL can still accept money.
      let safeToRelease = !stripeAttempted;
      if (stripeSessionId && stripe) {
        try { safeToRelease = (await stripe.checkout.sessions.expire(stripeSessionId)).status === 'expired'; }
        catch (cleanupError) { console.error('Checkout cleanup deferred to recovery job', cleanupError); }
      }
      if (safeToRelease) await finishCheckout(adminDb, checkoutRef.id);
      await checkoutRef.set(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Unable to create checkout session.",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: error instanceof CartError ? 409 : 500 },
    );
  }
}
