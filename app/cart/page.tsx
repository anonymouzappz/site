"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

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
  street2: string;
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

type CheckoutResponse = {
  url?: string;
  error?: string;
  checkoutId?: string;
  subtotal?: number;
  fulfillmentFee?: number;
  processingFee?: number;
  total?: number;
};

type DeliveryEstimateResponse = DeliveryEstimate & {
  error?: string;
};

type ShippingRatesResponse = {
  rates?: ShippingRate[];
  error?: string;
};

const CART_KEY = "nurnrebel_cart";
const CHECKOUT_PREFS_KEY = "nurnrebel_checkout_preferences";

const emptyAddress: Address = {
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
};

type CheckoutPreferences = {
  fulfillmentType?: FulfillmentType;
  deliveryAddress?: Address;
  shippingAddress?: Address;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCartItem(item: unknown): item is CartItem {
  if (!isRecord(item)) return false;

  return (
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

function normalizeOptions(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  const result: Record<string, string> = {};

  Object.entries(value).forEach(([key, optionValue]) => {
    result[String(key)] = String(optionValue || "");
  });

  return result;
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    productId: String(item.productId || ""),
    name: String(item.name || "Nurnrebel Product"),
    slug: String(item.slug || ""),
    price: safeNumber(item.price),
    imageUrl: String(item.imageUrl || ""),
    quantity: Math.max(1, Math.floor(safeNumber(item.quantity, 1))),
    options: normalizeOptions(item.options),
    shippingWeight: safeNumber(item.shippingWeight),
    shippingWeightUnit: String(item.shippingWeightUnit || "oz"),
  };
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem).map(normalizeCartItem);
  } catch {
    return [];
  }
}

function loadCheckoutPreferences(): CheckoutPreferences {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(CHECKOUT_PREFS_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);

    if (!isRecord(parsed)) return {};

    return {
      fulfillmentType:
        parsed.fulfillmentType === "pickup" ||
        parsed.fulfillmentType === "delivery" ||
        parsed.fulfillmentType === "shipping"
          ? parsed.fulfillmentType
          : undefined,

      deliveryAddress: isRecord(parsed.deliveryAddress)
        ? {
            street1: String(parsed.deliveryAddress.street1 || ""),
            street2: String(parsed.deliveryAddress.street2 || ""),
            city: String(parsed.deliveryAddress.city || ""),
            state: String(parsed.deliveryAddress.state || ""),
            zip: String(parsed.deliveryAddress.zip || ""),
          }
        : undefined,

      shippingAddress: isRecord(parsed.shippingAddress)
        ? {
            street1: String(parsed.shippingAddress.street1 || ""),
            street2: String(parsed.shippingAddress.street2 || ""),
            city: String(parsed.shippingAddress.city || ""),
            state: String(parsed.shippingAddress.state || ""),
            zip: String(parsed.shippingAddress.zip || ""),
          }
        : undefined,
    };
  } catch {
    return {};
  }
}

function saveCheckoutPreferences(preferences: CheckoutPreferences) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CHECKOUT_PREFS_KEY, JSON.stringify(preferences));
}

function convertToOunces(weight: number, unit = "oz") {
  const cleanUnit = unit.toLowerCase();

  if (cleanUnit === "lb" || cleanUnit === "lbs" || cleanUnit === "pound") {
    return weight * 16;
  }

  if (cleanUnit === "kg") return weight * 35.274;
  if (cleanUnit === "g" || cleanUnit === "gram") return weight * 0.035274;

  return weight;
}

function getTotalCartWeightOz(cart: CartItem[]) {
  return cart.reduce((total, item) => {
    const itemWeightOz = convertToOunces(
      safeNumber(item.shippingWeight),
      item.shippingWeightUnit || "oz",
    );

    return total + itemWeightOz * item.quantity;
  }, 0);
}

function addressIsComplete(address: Address) {
  return Boolean(
    address.street1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.zip.trim(),
  );
}

function calculateProcessingFee(baseAmount: number) {
  const percent = 0.029;
  const fixed = 0.3;

  if (baseAmount <= 0) return 0;

  const gross = (baseAmount + fixed) / (1 - percent);
  return Math.max(0, gross - baseAmount);
}

function resetRatesOnCartChange(
  setDeliveryEstimate: (value: DeliveryEstimate | null) => void,
  setShippingRates: (value: ShippingRate[]) => void,
  setSelectedShippingRate: (value: ShippingRate | null) => void,
) {
  setDeliveryEstimate(null);
  setShippingRates([]);
  setSelectedShippingRate(null);
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("shipping");

  const [deliveryAddress, setDeliveryAddress] =
    useState<Address>(emptyAddress);

  const [shippingAddress, setShippingAddress] =
    useState<Address>(emptyAddress);

  const [deliveryEstimate, setDeliveryEstimate] =
    useState<DeliveryEstimate | null>(null);

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] =
    useState<ShippingRate | null>(null);

  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const preferences = loadCheckoutPreferences();

    setCart(loadCartFromStorage());

    if (preferences.fulfillmentType) {
      setFulfillmentType(preferences.fulfillmentType);
    }

    if (preferences.deliveryAddress) {
      setDeliveryAddress(preferences.deliveryAddress);
    }

    if (preferences.shippingAddress) {
      setShippingAddress(preferences.shippingAddress);
    }

    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    saveCheckoutPreferences({
      fulfillmentType,
      deliveryAddress,
      shippingAddress,
    });
  }, [deliveryAddress, fulfillmentType, hasMounted, shippingAddress]);

  function saveCart(nextCart: CartItem[]) {
    const normalized = nextCart.map(normalizeCartItem);

    setCart(normalized);

    if (typeof window !== "undefined") {
      localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    }
  }

  function selectFulfillment(type: FulfillmentType) {
    setFulfillmentType(type);
    setError("");

    if (type !== "delivery") {
      setDeliveryEstimate(null);
    }

    if (type !== "shipping") {
      setShippingRates([]);
      setSelectedShippingRate(null);
    }
  }

  function increaseQuantity(index: number) {
    const next = [...cart];

    next[index] = {
      ...next[index],
      quantity: next[index].quantity + 1,
    };

    saveCart(next);

    resetRatesOnCartChange(
      setDeliveryEstimate,
      setShippingRates,
      setSelectedShippingRate,
    );
  }

  function decreaseQuantity(index: number) {
    const next = [...cart];

    next[index] = {
      ...next[index],
      quantity: Math.max(1, next[index].quantity - 1),
    };

    saveCart(next);

    resetRatesOnCartChange(
      setDeliveryEstimate,
      setShippingRates,
      setSelectedShippingRate,
    );
  }

  function removeItem(index: number) {
    const next = cart.filter((_, i) => i !== index);

    saveCart(next);

    resetRatesOnCartChange(
      setDeliveryEstimate,
      setShippingRates,
      setSelectedShippingRate,
    );
  }

  function clearCart() {
    saveCart([]);
    setError("");
    setDeliveryEstimate(null);
    setShippingRates([]);
    setSelectedShippingRate(null);
  }

  function updateDeliveryAddress(field: keyof Address, value: string) {
    setDeliveryAddress((prev) => ({
      ...prev,
      [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value,
    }));

    setError("");
    setDeliveryEstimate(null);
  }

  function updateShippingAddress(field: keyof Address, value: string) {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value,
    }));

    setError("");
    setShippingRates([]);
    setSelectedShippingRate(null);
  }

  const itemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [cart]);

  const totalWeightOz = useMemo(() => {
    return getTotalCartWeightOz(cart);
  }, [cart]);

  const fulfillmentFee = useMemo(() => {
    if (cart.length === 0) return 0;

    if (fulfillmentType === "pickup") return 0;

    if (fulfillmentType === "delivery") {
      return deliveryEstimate?.available ? deliveryEstimate.fee : 0;
    }

    if (fulfillmentType === "shipping") {
      return selectedShippingRate ? safeNumber(selectedShippingRate.amount) : 0;
    }

    return 0;
  }, [
    cart.length,
    deliveryEstimate,
    fulfillmentType,
    selectedShippingRate,
  ]);

  const processingFee = useMemo(() => {
    return calculateProcessingFee(subtotal + fulfillmentFee);
  }, [fulfillmentFee, subtotal]);

  const total = subtotal + fulfillmentFee + processingFee;

  const checkoutBlockedReason = useMemo(() => {
    if (cart.length === 0) return "Your cart is empty.";

    if (fulfillmentType === "delivery") {
      if (!deliveryEstimate) return "Calculate delivery before checkout.";
      if (!deliveryEstimate.available) {
        return deliveryEstimate.reason || "Delivery is not available.";
      }
    }

    if (fulfillmentType === "shipping") {
      if (!selectedShippingRate) {
        return "Calculate and select a shipping rate before checkout.";
      }
    }

    return "";
  }, [cart.length, deliveryEstimate, fulfillmentType, selectedShippingRate]);

  async function calculateDeliveryEstimate() {
    try {
      setDeliveryLoading(true);
      setError("");
      setDeliveryEstimate(null);

      if (!addressIsComplete(deliveryAddress)) {
        setError("Enter a complete delivery address.");
        return;
      }

      const res = await fetch("/api/delivery/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryAddress),
      });

      const data = (await res.json()) as DeliveryEstimateResponse;

      if (!res.ok) {
        setError(data.error || "Unable to calculate delivery.");
        return;
      }

      setDeliveryEstimate({
        available: Boolean(data.available),
        fee: safeNumber(data.fee),
        reason: String(data.reason || ""),
        miles: safeNumber(data.miles),
        minutes: safeNumber(data.minutes),
        originLabel: String(data.originLabel || "Store"),
        destination: String(data.destination || ""),
      });
    } catch (error) {
      console.error("Delivery estimate error:", error);
      setError("Unable to calculate delivery.");
    } finally {
      setDeliveryLoading(false);
    }
  }

  async function calculateShippingRates() {
    try {
      setShippingLoading(true);
      setError("");
      setShippingRates([]);
      setSelectedShippingRate(null);

      if (!addressIsComplete(shippingAddress)) {
        setError("Enter a complete shipping address.");
        return;
      }

      if (cart.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      if (totalWeightOz <= 0) {
        setError("Missing product weight. Add shipping weight in admin.");
        return;
      }

      const res = await fetch("/api/shippo/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          address: shippingAddress,
          totalWeightOz,
        }),
      });

      const data = (await res.json()) as ShippingRatesResponse;

      if (!res.ok) {
        setError(data.error || "Unable to calculate shipping.");
        return;
      }

      const rates = Array.isArray(data.rates) ? data.rates : [];

      setShippingRates(rates);
      setSelectedShippingRate(rates[0] || null);

      if (rates.length === 0) {
        setError("No shipping rates found for this address.");
      }
    } catch (error) {
      console.error("Shipping rates error:", error);
      setError("Unable to calculate shipping.");
    } finally {
      setShippingLoading(false);
    }
  }

  async function startCheckout() {
    try {
      setCheckoutLoading(true);
      setError("");

      if (checkoutBlockedReason) {
        setError(checkoutBlockedReason);
        return;
      }

      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          subtotal,
          fulfillmentType,
          fulfillmentFee,
          processingFee,
          total,
          deliveryAddress:
            fulfillmentType === "delivery" ? deliveryAddress : null,
          deliveryEstimate:
            fulfillmentType === "delivery" ? deliveryEstimate : null,
          shippingAddress:
            fulfillmentType === "shipping" ? shippingAddress : null,
          selectedShippingRate:
            fulfillmentType === "shipping" ? selectedShippingRate : null,
          totalWeightOz,
        }),
      });

      const data = (await res.json()) as CheckoutResponse;

      if (!res.ok) {
        setError(data.error || "Unable to start checkout.");
        return;
      }

      if (!data.url) {
        setError("Missing Stripe checkout URL.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Something went wrong starting checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-background px-5 py-24 text-foreground">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card p-10 text-center text-sm font-black uppercase tracking-[0.3em] text-muted">
          Loading cart...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back To Shop
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-accent">
                Nurnrebel Checkout
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
                Your Cart
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
                Choose pickup, mileage-based local delivery, or Shippo
                weight-based shipping before secure Stripe checkout.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Items" value={String(itemCount)} />
              <StatCard label="Weight" value={`${totalWeightOz.toFixed(1)} oz`} />
              <StatCard label="Total" value={money(total)} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_450px]">
        <div className="space-y-5">
          {cart.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card p-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background">
                <ShoppingBag className="text-accent" size={34} />
              </div>

              <h2 className="mt-6 text-3xl font-black uppercase">
                Your Cart Is Empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                Add clothing from the shop before choosing pickup, delivery, or
                shipping.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-background"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <motion.div
                key={`${item.productId}-${JSON.stringify(item.options)}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[2rem] border border-border bg-card p-4 shadow-xl shadow-black/10 md:p-5"
              >
                <div className="flex gap-4">
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-background md:h-36 md:w-32">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="140px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="text-accent" size={28} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-lg font-black uppercase leading-tight hover:text-accent"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-sm font-black text-muted">
                          {money(item.price)} each
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="rounded-full border border-border p-3 text-muted hover:border-red-500/50 hover:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {Object.keys(item.options || {}).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(item.options).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-muted">
                      Weight: {safeNumber(item.shippingWeight).toFixed(1)}{" "}
                      {item.shippingWeightUnit || "oz"}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex h-12 items-center rounded-full border border-border bg-background">
                        <button
                          onClick={() => decreaseQuantity(index)}
                          className="flex h-12 w-12 items-center justify-center text-muted hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-10 text-center text-sm font-black">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQuantity(index)}
                          className="flex h-12 w-12 items-center justify-center text-muted hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <p className="text-lg font-black">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {cart.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/shop"
                className="rounded-full border border-border px-5 py-3 text-center text-xs font-black uppercase tracking-[0.2em] text-muted hover:border-foreground hover:text-foreground"
              >
                Continue Shopping
              </Link>

              <button
                onClick={clearCart}
                className="rounded-full border border-border px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-muted hover:border-red-500/50 hover:text-red-400"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-black/20">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Fulfillment
            </p>

            <h2 className="mt-3 text-3xl font-black uppercase">
              How Do You Want It?
            </h2>

            <div className="mt-6 space-y-3">
              <FulfillmentOption
                active={fulfillmentType === "pickup"}
                icon={<Store size={20} />}
                title="Pickup"
                description="No delivery fee. Pickup details will be shared after payment."
                price="Free"
                onClick={() => selectFulfillment("pickup")}
              />

              <FulfillmentOption
                active={fulfillmentType === "delivery"}
                icon={<Truck size={20} />}
                title="Local Delivery"
                description="Calculated by mileage from your Fort Myers store address."
                price={
                  deliveryEstimate?.available
                    ? money(deliveryEstimate.fee)
                    : "Calculate"
                }
                onClick={() => selectFulfillment("delivery")}
              />

              <FulfillmentOption
                active={fulfillmentType === "shipping"}
                icon={<Package size={20} />}
                title="Shipping"
                description="Calculated with Shippo using package weight and address."
                price={
                  selectedShippingRate
                    ? money(safeNumber(selectedShippingRate.amount))
                    : "Rates"
                }
                onClick={() => selectFulfillment("shipping")}
              />
            </div>

            {fulfillmentType === "delivery" && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
                  Delivery Address
                </p>

                <AddressForm
                  address={deliveryAddress}
                  onChange={updateDeliveryAddress}
                />

                <button
                  onClick={calculateDeliveryEstimate}
                  disabled={deliveryLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deliveryLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {deliveryLoading ? "Calculating..." : "Calculate Delivery"}
                </button>

                {deliveryEstimate && (
                  <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                    {deliveryEstimate.available ? (
                      <>
                        <p className="text-sm font-black uppercase">
                          Delivery Available
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted">
                          From {deliveryEstimate.originLabel} to{" "}
                          {deliveryEstimate.destination}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted">
                          {deliveryEstimate.miles} miles / about{" "}
                          {deliveryEstimate.minutes} minutes
                        </p>

                        <p className="mt-3 text-2xl font-black">
                          {money(deliveryEstimate.fee)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-red-400">
                        {deliveryEstimate.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {fulfillmentType === "shipping" && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
                  Shipping Address
                </p>

                <AddressForm
                  address={shippingAddress}
                  onChange={updateShippingAddress}
                />

                <button
                  onClick={calculateShippingRates}
                  disabled={shippingLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {shippingLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {shippingLoading ? "Getting Rates..." : "Get Shipping Rates"}
                </button>

                {shippingRates.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {shippingRates.map((rate) => {
                      const active =
                        selectedShippingRate?.objectId === rate.objectId;

                      return (
                        <button
                          key={rate.objectId}
                          onClick={() => {
                            setSelectedShippingRate(rate);
                            setError("");
                          }}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background text-foreground hover:border-foreground"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-black uppercase">
                                {rate.provider}
                              </p>

                              <p
                                className={`mt-1 text-xs ${
                                  active ? "text-background/70" : "text-muted"
                                }`}
                              >
                                {rate.servicelevel}
                                {rate.estimatedDays
                                  ? ` • Est. ${rate.estimatedDays} days`
                                  : ""}
                              </p>

                              {rate.durationTerms && (
                                <p
                                  className={`mt-1 text-[10px] ${
                                    active ? "text-background/60" : "text-muted"
                                  }`}
                                >
                                  {rate.durationTerms}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black">
                                {money(safeNumber(rate.amount))}
                              </span>

                              {active && <Check size={16} />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mt-7 border-t border-border pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted">
                  <span>
                    {fulfillmentType === "pickup"
                      ? "Pickup"
                      : fulfillmentType === "delivery"
                        ? "Delivery"
                        : "Shipping"}
                  </span>

                  <span>
                    {fulfillmentFee === 0 ? "Free" : money(fulfillmentFee)}
                  </span>
                </div>

                <div className="flex justify-between text-muted">
                  <span>Processing Fee</span>
                  <span>{money(processingFee)}</span>
                </div>

                <div className="flex justify-between border-t border-border pt-4 text-xl font-black">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  <ShieldCheck size={19} className="shrink-0 text-accent" />
                  <p className="text-xs leading-5 text-muted">
                    Your payment is handled securely by Stripe. Your order is
                    created only after Stripe confirms payment through the
                    webhook.
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-bold uppercase tracking-widest text-red-300">
                  {error}
                </p>
              )}

              {!error && checkoutBlockedReason && cart.length > 0 && (
                <p className="mt-4 rounded-2xl border border-border bg-card p-3 text-center text-xs font-bold uppercase tracking-widest text-muted">
                  {checkoutBlockedReason}
                </p>
              )}

              <button
                disabled={
                  cart.length === 0 ||
                  checkoutLoading ||
                  Boolean(checkoutBlockedReason)
                }
                onClick={startCheckout}
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 text-xs font-black uppercase tracking-[0.25em] text-background transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkoutLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                {checkoutLoading ? "Starting..." : "Continue To Checkout"}
              </button>

              <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-muted">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}

function AddressForm({
  address,
  onChange,
}: {
  address: Address;
  onChange: (field: keyof Address, value: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="relative">
        <MapPin
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />

        <input
          value={address.street1}
          onChange={(e) => onChange("street1", e.target.value)}
          placeholder="Street address"
          autoComplete="address-line1"
          className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>

      <input
        value={address.street2}
        onChange={(e) => onChange("street2", e.target.value)}
        placeholder="Apt, suite, optional"
        autoComplete="address-line2"
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={address.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="City"
          autoComplete="address-level2"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted"
        />

        <input
          value={address.state}
          onChange={(e) => onChange("state", e.target.value)}
          placeholder="State"
          autoComplete="address-level1"
          maxLength={2}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm uppercase text-foreground outline-none placeholder:text-muted"
        />

        <input
          value={address.zip}
          onChange={(e) => onChange("zip", e.target.value)}
          placeholder="ZIP"
          autoComplete="postal-code"
          inputMode="numeric"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}

function FulfillmentOption({
  active,
  icon,
  title,
  description,
  price,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  price: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground"
      }`}
    >
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
            active
              ? "border-background/20 bg-background/10"
              : "border-border bg-background text-accent"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                {title}
              </p>

              <p
                className={`mt-2 text-xs leading-5 ${
                  active ? "text-background/70" : "text-muted"
                }`}
              >
                {description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest">
                {price}
              </span>

              {active && <Check size={17} />}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}