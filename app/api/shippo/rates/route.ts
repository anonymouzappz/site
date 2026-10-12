import { NextResponse } from "next/server";
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = "nodejs";

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

type Address = {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
};

type ShippoRatesPayload = {
  items?: CartItem[];
  address?: Address;
  totalWeightOz?: number;
};

type ShippoRate = {
  object_id?: string;
  provider?: string;
  servicelevel?: {
    name?: string;
    token?: string;
  };
  amount?: string;
  currency?: string;
  estimated_days?: number;
  duration_terms?: string;
};

type ShippoShipmentResponse = {
  object_id?: string;
  rates?: ShippoRate[];
  messages?: Array<{
    source?: string;
    code?: string;
    text?: string;
  }>;
  detail?: string;
};

function getEnv(name: string, fallback = "") {
  return process.env[name] || fallback;
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function convertToOunces(weight: number, unit = "oz") {
  const cleanUnit = unit.toLowerCase();

  if (cleanUnit === "lb" || cleanUnit === "lbs" || cleanUnit === "pound") {
    return weight * 16;
  }

  if (cleanUnit === "kg") {
    return weight * 35.274;
  }

  if (cleanUnit === "g" || cleanUnit === "gram") {
    return weight * 0.035274;
  }

  return weight;
}

function calculateCartWeightOz(items: CartItem[]) {
  return items.reduce((total, item) => {
    const itemWeightOz = convertToOunces(
      toNumber(item.shippingWeight),
      item.shippingWeightUnit || "oz",
    );

    return total + itemWeightOz * Math.max(1, toNumber(item.quantity, 1));
  }, 0);
}

function cleanAddress(address?: Address) {
  return {
    street1: String(address?.street1 || "").trim(),
    street2: String(address?.street2 || "").trim(),
    city: String(address?.city || "").trim(),
    state: String(address?.state || "").trim().toUpperCase(),
    zip: String(address?.zip || "").trim(),
  };
}

function addressIsComplete(address: ReturnType<typeof cleanAddress>) {
  return Boolean(
    address.street1 &&
      address.city &&
      address.state &&
      address.zip,
  );
}

function getShipFromAddress() {
  return {
    name: requiredEnv("SHIP_FROM_NAME"),
    company: getEnv("SHIP_FROM_COMPANY", getEnv("SHIP_FROM_NAME")),
    street1: requiredEnv("SHIP_FROM_STREET1"),
    street2: getEnv("SHIP_FROM_STREET2"),
    city: requiredEnv("SHIP_FROM_CITY"),
    state: requiredEnv("SHIP_FROM_STATE"),
    zip: requiredEnv("SHIP_FROM_ZIP"),
    country: getEnv("SHIP_FROM_COUNTRY", "US"),
    phone: requiredEnv("SHIP_FROM_PHONE"),
    email: requiredEnv("SHIP_FROM_EMAIL"),
  };
}

function getDefaultParcel(weightOz: number) {
  return {
    length: getEnv("SHIP_DEFAULT_LENGTH", "12"),
    width: getEnv("SHIP_DEFAULT_WIDTH", "9"),
    height: getEnv("SHIP_DEFAULT_HEIGHT", "2"),
    distance_unit: getEnv("SHIP_DEFAULT_DISTANCE_UNIT", "in"),
    weight: Math.max(1, weightOz).toFixed(2),
    mass_unit: "oz",
  };
}

function normalizeRates(rates: ShippoRate[] = []) {
  return rates
    .filter((rate) => {
      return rate.object_id && rate.amount && rate.currency;
    })
    .map((rate) => {
      return {
        objectId: String(rate.object_id),
        provider: String(rate.provider || "Carrier"),
        servicelevel: String(
          rate.servicelevel?.name ||
            rate.servicelevel?.token ||
            "Shipping",
        ),
        amount: String(rate.amount || "0"),
        currency: String(rate.currency || "USD"),
        estimatedDays:
          typeof rate.estimated_days === "number"
            ? rate.estimated_days
            : undefined,
        durationTerms: rate.duration_terms || "",
      };
    })
    .sort((a, b) => Number(a.amount) - Number(b.amount));
}

export async function POST(req: Request) {
  try {
    const token = requiredEnv("SHIPPO_TOKEN");
    const body = (await req.json()) as ShippoRatesPayload;

    const items = Array.isArray(body.items) ? body.items : [];
    const address = cleanAddress(body.address);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 },
      );
    }

    if (!addressIsComplete(address)) {
      return NextResponse.json(
        { error: "Enter a complete shipping address." },
        { status: 400 },
      );
    }

    const calculatedWeightOz = calculateCartWeightOz(items);
    const totalWeightOz =
      toNumber(body.totalWeightOz) > 0
        ? toNumber(body.totalWeightOz)
        : calculatedWeightOz;

    if (totalWeightOz <= 0) {
      return NextResponse.json(
        { error: "Missing product shipping weight." },
        { status: 400 },
      );
    }

    const shipmentPayload = {
      address_from: getShipFromAddress(),

      address_to: {
        name: "Nurnrebel Customer",
        street1: address.street1,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: "US",
        phone: getEnv("SHIP_TO_DEFAULT_PHONE", getEnv("SHIP_FROM_PHONE")),
        email: getEnv("SHIP_TO_DEFAULT_EMAIL", getEnv("SHIP_FROM_EMAIL")),
      },

      parcels: [getDefaultParcel(totalWeightOz)],

      // false = return rates immediately in the response.
      async: false,

      metadata: JSON.stringify({
        source: "nurnrebel_cart",
        itemCount: items.length,
        totalWeightOz: totalWeightOz.toFixed(2),
      }),
    };

    const response = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentPayload),
      cache: "no-store",
    });

    const data = (await response.json()) as ShippoShipmentResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.detail ||
            data.messages?.[0]?.text ||
            "Unable to create Shippo shipment.",
        },
        { status: response.status },
      );
    }

    const rates = normalizeRates(data.rates || []);
    const batch = adminDb.batch();
    for (const rate of rates) batch.set(adminDb.collection('shipping_quotes').doc(rate.objectId), {
      rate, address, weight: totalWeightOz, currency: rate.currency.toUpperCase(),
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 60 * 1000),
    });
    await batch.commit();

    if (rates.length === 0) {
      return NextResponse.json(
        {
          error:
            data.messages?.[0]?.text ||
            "No shipping rates were returned for this address.",
          rates: [],
          shipmentId: data.object_id || "",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      shipmentId: data.object_id || "",
      totalWeightOz: Number(totalWeightOz.toFixed(2)),
      parcel: getDefaultParcel(totalWeightOz),
      rates,
    });
  } catch (error) {
    console.error("Shippo rates error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate shipping rates.",
      },
      { status: 500 },
    );
  }
}
