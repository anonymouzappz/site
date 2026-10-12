"use client";

import CollectionGrid from "@/components/shop/CollectionGrid";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Eye,
  Flame,
  HeartHandshake,
  Megaphone,
  PackageCheck,
  Palette,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import "./styles.css";

const values = [
  {
    icon: Megaphone,
    title: "Speak Without Speaking",
    text: "Every piece is designed to communicate confidence, identity, and mindset before you say a word.",
  },
  {
    icon: Eye,
    title: "Social Awareness",
    text: "Nurnrebel aka XNX is built around culture, pressure, identity, silence, truth, and the message behind what people wear.",
  },
  {
    icon: Shield,
    title: "Mindset Armor",
    text: "Our clothing is made for people who refuse to blend into the background and want their wardrobe to carry purpose.",
  },
];

const featured = [
  {
    title: "Statement Tees",
    text: "Graphic pieces designed for daily wear, creative expression, and bold streetwear styling.",
  },
  {
    title: "Oversized Hoodies",
    text: "Comfort-focused layers built for movement, confidence, and standout cold-weather looks.",
  },
  {
    title: "Mindset Essentials",
    text: "Core pieces made to pair with your everyday wardrobe while keeping the message visible.",
  },
];

const guides = [
  {
    icon: Palette,
    title: "Choose Your Message",
    text: "Start with the design that matches your energy. Some pieces are loud and direct, while others carry a more subtle meaning.",
  },
  {
    icon: PackageCheck,
    title: "Check Fit And Options",
    text: "Review size, color, and available product options before checkout. Product pages include details to help you choose the right piece.",
  },
  {
    icon: Truck,
    title: "Track Fulfillment",
    text: "Orders are processed through the store system, with shipping and fulfillment handled after successful checkout.",
  },
];

const faqs = [
  {
    q: "What does Nurnrebel aka XNX stand for?",
    a: "Nurnrebel aka XNX is a social awareness streetwear brand focused on identity, rebellion, truth, awareness, and self-expression through clothing.",
  },
  {
    q: "What type of clothing does the brand sell?",
    a: "The shop focuses on statement streetwear such as graphic tees, hoodies, sets, and mindset-driven essentials.",
  },
  {
    q: "Is this only a clothing store?",
    a: "No. The clothing is the product, but the larger idea is the movement behind it. The brand is built around awareness, conversation, and personal expression.",
  },
  {
    q: "Where can I find new drops?",
    a: "New products and featured pieces are added to the Shop page. The Latest Drop button in the navigation also takes customers directly to current products.",
  },
];

export default function HomePage() {
  return (
    <div className="text-foreground">
      <CollectionGrid />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-3xl" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
          <div className="h-full w-full bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:8px_8px]" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto grid min-h-[95vh] max-w-7xl items-center gap-24 px-5 py-24 lg:grid-cols-[1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-accent"
            >
              <Sparkles size={12} />
              Nurnrebel aka XNX
            </motion.div>

            <h1 className="max-w-[720px] text-7xl font-black uppercase leading-[0.85] tracking-tight md:text-[9rem]">
              Wear Your
              <span className="block text-accent">Mindset</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
              Nurnrebel aka XNX is a social awareness clothing brand built for
              individuals who express identity, rebellion, awareness, and truth
              through fashion. Every drop is designed to feel like more than an
              outfit — it is a message you can wear.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/shop"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
                >
                  Shop The Drop
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/movement"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground hover:border-foreground"
                >
                  The Movement
                </Link>
              </motion.div>
            </div>

            <div className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["001", "First Drop"],
                ["24/7", "Mindset"],
                ["XNX", "Movement"],
              ].map(([number, label]) => (
                <div key={label}>
                  <div className="text-3xl font-black">{number}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="flex justify-end lg:translate-x-10 xl:translate-x-16"
          >
            <div className="home-card-float relative w-full max-w-[500px] overflow-hidden rounded-[2.7rem] border border-border bg-surface/70 p-6 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

              <div className="relative aspect-[4/5] rounded-[2rem] border border-border bg-gradient-to-br from-[#181818] via-[#111111] to-[#202020] p-8">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
                      <ShoppingBag size={24} className="text-accent" />
                    </div>

                    <div className="text-right text-xs font-black uppercase tracking-[0.4em] text-muted">
                      Drop 001
                    </div>
                  </div>

                  <div>
                    <h2 className="max-w-md text-6xl font-black uppercase leading-[0.9] tracking-tight">
                      Let The
                      <br />
                      Clothes Speak
                    </h2>

                    <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
                      Statement garments built from awareness, identity,
                      individuality, rebellion, and expression.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="h-[1px] w-full bg-border" />

                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                        XNX Social Awareness Wear
                      </div>

                      <ArrowRight size={18} className="text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="overflow-hidden border-b border-border bg-surface/70 py-5 backdrop-blur-xl">
        <div className="home-marquee whitespace-nowrap text-sm font-black uppercase tracking-[0.4em] text-muted">
          WEAR YOUR MINDSET • NURNREBEL • XNX • SOCIAL AWARENESS •
          STATEMENT CLOTHING • REBELLION • IDENTITY • CULTURE • TRUTH •
          WEAR YOUR MINDSET • NURNREBEL • XNX •
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-28 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Brand Story
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            More Than
            <br />
            A Logo
          </h2>
        </div>

        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            Nurnrebel aka XNX was created for people who understand that clothing
            can carry a message. Streetwear has always been connected to culture,
            community, music, struggle, confidence, and identity. This brand
            builds on that idea by creating pieces that help people express what
            they believe, what they have lived through, and how they choose to
            move through the world.
          </p>

          <p>
            The goal is not to make clothing that fades into the background. The
            goal is to create statement wear that starts conversations. Some
            customers wear Nurnrebel for style. Some wear it for confidence. Some
            wear it because they connect with the message of awareness,
            individuality, and rebellion against silence.
          </p>

          <p>
            Every collection is connected to the larger movement: wear your
            mindset, stand in your truth, and let your clothes speak when words
            are not enough.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Philosophy
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Built For
            <br />
            The Aware
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                whileHover={{ y: -5 }}
                className="group rounded-[2rem] border border-border bg-card p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="text-accent" size={22} />
                </div>

                <h3 className="mt-7 text-2xl font-black uppercase">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
                Featured Categories
              </p>

              <h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
                Statement Pieces
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
            >
              View Shop <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {featured.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href="/shop"
                  className="group relative block overflow-hidden rounded-[2rem] border border-border bg-card p-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />

                  <div className="relative flex min-h-72 flex-col justify-end">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                      Nurnrebel
                    </p>

                    <h3 className="mt-4 text-4xl font-black uppercase leading-none">
                      {item.title}
                    </h3>

                    <p className="mt-5 text-sm leading-7 text-muted">
                      {item.text}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOPPING GUIDE */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Shopping Guide
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            How To Shop
            <br />
            The Drop
          </h2>

          <p className="mt-6 text-base leading-8 text-muted">
            The store is designed to make each product easy to understand before
            checkout. Review the product images, available options, description,
            sizing choices, and shipping details before placing your order.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guides.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="rounded-[2rem] border border-border bg-card p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="text-accent" size={22} />
                </div>

                <h3 className="mt-7 text-2xl font-black uppercase">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TRUST / QUALITY */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-24 md:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              title: "Original Brand",
              text: "Built around Nurnrebel aka XNX identity and message.",
            },
            {
              icon: PackageCheck,
              title: "Product Details",
              text: "Each listing includes product info, options, and images.",
            },
            {
              icon: Truck,
              title: "Shipping Workflow",
              text: "Orders move through checkout, shipping, and fulfillment.",
            },
            {
              icon: HeartHandshake,
              title: "Customer Focus",
              text: "The brand is built for real people and real expression.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[2rem] border border-border bg-card p-7"
              >
                <Icon size={24} className="text-accent" />
                <h3 className="mt-5 text-lg font-black uppercase">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MOVEMENT CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-28 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Flame size={32} className="text-accent" />
          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            The Movement Behind The Clothes
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            The movement is about people who refuse to be invisible. It is about
            turning clothing into a signal of resilience, identity, and
            awareness. Nurnrebel aka XNX is for those who carry stories,
            pressure, growth, and purpose — and want their style to reflect that.
          </p>

          <Link
            href="/movement"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-white"
          >
            Read The Movement <ArrowRight size={16} />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8">
          <BookOpen size={32} className="text-accent" />
          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            Learn The Brand Language
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            XNX represents a mindset that does not depend on fitting into
            traditional boxes. The brand language is built from contrast:
            silence and expression, pressure and growth, rebellion and
            discipline, awareness and action. That tension is what gives the
            clothing its voice.
          </p>

          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-foreground"
          >
            About The Brand <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Questions
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Brand FAQ
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-[2rem] border border-border bg-card p-8"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                <Star size={18} className="text-accent" />
              </div>

              <h3 className="text-xl font-black uppercase">{item.q}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-10 text-center md:p-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Latest Drop
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            Find The Piece That Speaks For You
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Explore the current Nurnrebel aka XNX shop, view product details,
            and choose statement wear built around awareness, identity, and
            self-expression.
          </p>

          <Link
            href="/shop"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
          >
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}