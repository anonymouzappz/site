import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  options: Record<string, string>;
  shippingWeight?: number;
  shippingWeightUnit?: string;
};

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
    req.headers.get("origin") ||
    "http://localhost:3000"
  );
}

function isValidCartItem(item: CartItem) {
  return Boolean(
    item.productId &&
      item.name &&
      safeNumber(item.price) > 0 &&
      safeNumber(item.quantity) > 0,
  );
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    productId: String(item.productId || ""),
    name: String(item.name || "Nurnrebel Product"),
    slug: String(item.slug || ""),
    price: safeNumber(item.price),
    imageUrl: String(item.imageUrl || ""),
    quantity: Math.max(1, Math.floor(safeNumber(item.quantity, 1))),
    options: item.options || {},
    shippingWeight: safeNumber(item.shippingWeight),
    shippingWeightUnit: String(item.shippingWeightUnit || "oz"),
  };
}

export async function POST(req: Request) {
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

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const validItems = rawItems
      .map(normalizeCartItem)
      .filter(isValidCartItem);

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 },
      );
    }

    const fulfillmentType: FulfillmentType =
      body.fulfillmentType || "shipping";

    if (!["pickup", "delivery", "shipping"].includes(fulfillmentType)) {
      return NextResponse.json(
        { error: "Invalid fulfillment type." },
        { status: 400 },
      );
    }

    const fulfillmentFee = safeNumber(body.fulfillmentFee);

    if (fulfillmentType === "delivery") {
      if (!body.deliveryEstimate?.available) {
        return NextResponse.json(
          { error: "Calculate delivery before checkout." },
          { status: 400 },
        );
      }
    }

    if (fulfillmentType === "shipping") {
      if (!body.selectedShippingRate?.objectId) {
        return NextResponse.json(
          { error: "Select a shipping rate before checkout." },
          { status: 400 },
        );
      }
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

    checkoutRef = adminDb.collection("checkout_sessions").doc();

    await checkoutRef.set({
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

      totalWeightOz: safeNumber(body.totalWeightOz),

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),

      source: "next_checkout_api",
    });

    const siteUrl = getSiteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: lineItems,

      billing_address_collection: "auto",

      metadata: {
        source: "nurnrebel_cart",
        checkoutId: checkoutRef.id,
      },

      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });

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

    if (checkoutRef) {
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
      { status: 500 },
    );
  }
}