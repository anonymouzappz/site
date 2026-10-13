"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { subscribeEmail } from "@/lib/subscribe";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus("");

      await subscribeEmail(email, "footer");

      setEmail("");
      setStatus("You’re on the list.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-1">
  <motion.div
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="flex items-center gap-1"
  >
    {/* LIGHT MODE ICON */}
    <Image
      src="/logo-black.png"
      alt="Nurnrebel icon"
      width={54}
      height={54}
      priority
      className="h-auto w-[54px] object-contain dark:hidden"
    />

    {/* DARK MODE ICON */}
    <Image
      src="/logo-white.png"
      alt="Nurnrebel icon"
      width={54}
      height={54}
      priority
      className="hidden h-auto w-[54px] object-contain dark:block"
    />

    {/* LIGHT MODE WORDMARK */}
    <Image
      src="/nurnrebel-black.png"
      alt="Nurnrebel wordmark"
      width={135}
      height={50}
      priority
      className="h-auto w-[135px] object-contain dark:hidden"
    />

    {/* DARK MODE WORDMARK */}
    <Image
      src="/nurnrebel.png"
      alt="Nurnrebel wordmark"
      width={135}
      height={50}
      priority
      className="hidden h-auto w-[135px] object-contain dark:block"
    />
  </motion.div>
</Link>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Nurnrebel aka XNX is a social awareness clothing brand built for
            people who wear their mindset. Let the clothes speak for you.
          </p>

          <div className="mt-6 flex gap-3">
            {["IG", "X"].map((item) => (
              <motion.a
                key={item}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full border border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-muted hover:bg-foreground hover:text-background"
              >
                {item}
              </motion.a>
            ))}

            <motion.a
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-border p-3 text-muted hover:bg-foreground hover:text-background"
            >
              <Mail size={18} />
            </motion.a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em]">
            Explore
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted">
            {[
              ["Shop", "/shop"],
              ["Jersey Studio", "/jersey-studio"],
              ["About Us", "/about"],
              ["The Movement", "/movement"],
              ["Blog", "/blog"],
              ["Lookbook", "/lookbook"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em]">
            Join The List
          </h3>

          <p className="mt-5 text-sm leading-6 text-muted">
            Get early access to drops, stories, and movement updates.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-5 flex overflow-hidden rounded-full border border-border bg-card"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50"
            />

            <button
              disabled={loading}
              className="bg-foreground px-5 text-xs font-black uppercase tracking-widest text-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "Join"}
            </button>
          </form>

          {status && (
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
              {status}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs uppercase tracking-[0.25em] text-muted">
        © {new Date().getFullYear()} Nurnrebel / XNX. Wear Your Mindset.
      </div>
    </footer>
  );
}
