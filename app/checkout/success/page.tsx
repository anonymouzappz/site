"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Package,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    localStorage.removeItem("nurnrebel_cart");
  }, []);

  return (
    <div className="min-h-screen bg-background px-5 py-20 text-foreground">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-2xl shadow-black/20"
        >
          <div className="relative overflow-hidden border-b border-border px-6 py-12 text-center md:px-12 md:py-16">
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                <CheckCircle2 className="text-accent" size={48} />
              </div>

              <p className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-accent">
                Payment Successful
              </p>

              <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-black uppercase leading-none md:text-7xl">
                Order Received
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted">
                Thank you for supporting Nurnrebel / XNX. Your payment was
                completed through Stripe, and your order is now being processed.
              </p>

              {sessionId && (
                <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                    Stripe Session
                  </p>
                  <p className="mt-2 break-all text-xs font-bold text-foreground">
                    {sessionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            <InfoCard
              icon={<ReceiptText size={22} />}
              title="Order Created"
              description="Your order will be saved after Stripe confirms payment through the webhook."
            />

            <InfoCard
              icon={<Package size={22} />}
              title="Fulfillment"
              description="Pickup, local delivery, or shipping details will be handled from the order system."
            />

            <InfoCard
              icon={<ShoppingBag size={22} />}
              title="Cart Cleared"
              description="Your cart has been cleared so you can continue shopping fresh."
            />
          </div>

          <div className="border-t border-border p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-background transition hover:bg-muted"
              >
                Keep Shopping
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted transition hover:border-foreground hover:text-foreground"
              >
                <Home size={16} />
                Back Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-accent">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black uppercase tracking-widest">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-5 py-24 text-foreground">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-card p-10 text-center text-sm font-black uppercase tracking-[0.3em] text-muted">
            Loading order...
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}