import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DeliveryEstimatePayload = {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function buildAddress(parts: Array<string | undefined>) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateDeliveryFee(miles: number) {
  const baseFee = Number(process.env.LOCAL_DELIVERY_BASE_FEE || 5);
  const perMileFee = Number(process.env.LOCAL_DELIVERY_PER_MILE_FEE || 1.25);
  const maxMiles = Number(process.env.LOCAL_DELIVERY_MAX_MILES || 25);

  if (miles > maxMiles) {
    return {
      available: false,
      fee: 0,
      reason: `Local delivery is only available within ${maxMiles} miles.`,
    };
  }

  return {
    available: true,
    fee: roundMoney(baseFee + miles * perMileFee),
    reason: "",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DeliveryEstimatePayload;

    const googleApiKey = requiredEnv("GOOGLE_MAPS_SERVER_API_KEY");

    const origin = buildAddress([
      process.env.SHIP_FROM_STREET1,
      process.env.SHIP_FROM_CITY,
      process.env.SHIP_FROM_STATE,
      process.env.SHIP_FROM_ZIP,
      process.env.SHIP_FROM_COUNTRY || "US",
    ]);

    const destination = buildAddress([
      body.street1,
      body.street2,
      body.city,
      body.state,
      body.zip,
      "US",
    ]);

    if (!origin) {
      return NextResponse.json(
        { error: "Missing store ship-from address." },
        { status: 500 },
      );
    }

    if (!body.street1 || !body.city || !body.state || !body.zip) {
      return NextResponse.json(
        { error: "Enter a complete delivery address." },
        { status: 400 },
      );
    }

    const url = new URL(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
    );

    url.searchParams.set("origins", origin);
    url.searchParams.set("destinations", destination);
    url.searchParams.set("mode", "driving");
    url.searchParams.set("units", "imperial");
    url.searchParams.set("key", googleApiKey);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    const element = data?.rows?.[0]?.elements?.[0];

    if (!response.ok || data.status !== "OK" || element?.status !== "OK") {
      return NextResponse.json(
        {
          error:
            element?.status === "ZERO_RESULTS"
              ? "No driving route found for this address."
              : "Unable to calculate delivery distance.",
        },
        { status: 400 },
      );
    }

    const meters = Number(element.distance?.value || 0);
    const seconds = Number(element.duration?.value || 0);

    const miles = meters / 1609.344;
    const minutes = Math.round(seconds / 60);

    const delivery = calculateDeliveryFee(miles);

    return NextResponse.json({
      available: delivery.available,
      fee: delivery.fee,
      reason: delivery.reason,
      miles: roundMoney(miles),
      minutes,
      originLabel: process.env.SHIP_FROM_CITY
        ? `${process.env.SHIP_FROM_CITY}, ${process.env.SHIP_FROM_STATE}`
        : "Store",
      destination,
    });
  } catch (error) {
    console.error("Delivery estimate error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to estimate delivery.",
      },
      { status: 500 },
    );
  }
}