"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Eye,
  Flame,
  Layers,
  Palette,
  Shirt,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

const looks = [
  {
    id: "mindset-uniform",
    title: "Mindset Uniform",
    tag: "Look 001",
    type: "Editorial Streetwear",
    size: "lg:row-span-2",
    description:
      "A daily uniform built around confidence, discipline, and clean statement energy.",
  },
  {
    id: "silent-statement",
    title: "Silent Statement",
    tag: "Look 002",
    type: "Minimal Identity",
    size: "",
    description:
      "A quiet but bold look for people who let presence speak louder than explanation.",
  },
  {
    id: "awareness-layer",
    title: "Awareness Layer",
    tag: "Look 003",
    type: "Oversized Fit",
    size: "",
    description:
      "Layered streetwear styling built around comfort, protection, and personal expression.",
  },
  {
    id: "off-black-mood",
    title: "Off-Black Mood",
    tag: "Look 004",
    type: "Drop Styling",
    size: "",
    description:
      "Dark tones, clean contrast, and bold structure for a strong visual identity.",
  },
  {
    id: "the-message-fit",
    title: "The Message Fit",
    tag: "Look 005",
    type: "XNX Campaign",
    size: "lg:col-span-2",
    description:
      "A campaign-ready outfit concept made to carry the Nurnrebel aka XNX message.",
  },
];

const styleRules = [
  {
    icon: Palette,
    title: "Off-Black Foundation",
    text: "Dark tones give the lookbook its base. Black, charcoal, washed gray, and muted neutrals help the red accent and brand message stand out.",
  },
  {
    icon: Layers,
    title: "Oversized Silhouettes",
    text: "Oversized fits create comfort, movement, and presence. Hoodies, tees, and layered outfits help the clothing feel bold without needing too much noise.",
  },
  {
    icon: Eye,
    title: "Muted Contrast",
    text: "Nurnrebel styling is built around contrast: light against dark, silence against statement, simple shapes against strong messaging.",
  },
  {
    icon: Tag,
    title: "Message-First Styling",
    text: "The clothing should lead with meaning. Each look is styled to support the phrase: wear your mindset.",
  },
];

const campaignNotes = [
  {
    title: "Streetwear With Meaning",
    text: "Every outfit concept in the lookbook is connected to awareness, identity, culture, confidence, and self-expression.",
  },
  {
    title: "Built For Real Movement",
    text: "The looks are made to feel wearable in daily life — from casual days to photoshoots, events, content creation, and brand moments.",
  },
  {
    title: "Visual Storytelling",
    text: "The lookbook gives the brand a visual language. It helps customers understand the mood, fit, tone, and purpose behind the clothing.",
  },
];

const faqs = [
  {
    q: "What is the Nurnrebel lookbook?",
    a: "The lookbook is a visual guide for the brand. It shows outfit concepts, campaign direction, styling ideas, and the mood behind Nurnrebel aka XNX drops.",
  },
  {
    q: "Are these real product photos?",
    a: "These panels can work as placeholders until real product photography is added. Later, each look can be connected to Firebase Storage images or admin-managed content.",
  },
  {
    q: "Can customers shop these looks?",
    a: "Yes. The lookbook links customers back to the Shop page so they can find current products and build outfits around the Nurnrebel message.",
  },
  {
    q: "Why does a clothing brand need a lookbook?",
    a: "A lookbook helps customers understand the brand’s visual identity. It gives context to the products and shows how pieces can be styled together.",
  },
];

export default function LookbookPage() {
  return (
    <div className="min-h-screen text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-28">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-accent"
          >
            Nurnrebel Lookbook
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-6xl text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            The Visual
            <span className="block text-accent">Language</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-8 text-muted"
          >
            Campaign visuals, outfit concepts, and editorial styling for the
            Nurnrebel aka XNX movement. Built for off-black tones, oversized
            silhouettes, muted contrast, and statement energy that lets the
            clothes speak before you do.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
            >
              Shop The Looks <ArrowRight size={18} />
            </Link>

            <Link
              href="/movement"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground hover:border-foreground"
            >
              The Movement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="overflow-hidden border-b border-border bg-surface/70 py-5 backdrop-blur-xl">
        <div className="whitespace-nowrap text-sm font-black uppercase tracking-[0.4em] text-muted [animation:lookbookMarquee_28s_linear_infinite]">
          LOOKBOOK • CAMPAIGN • XNX • WEAR YOUR MINDSET • OFF BLACK • OFF WHITE •
          STATEMENT FITS • LOOKBOOK • CAMPAIGN • XNX • WEAR YOUR MINDSET •
        </div>
      </section>

      {/* INTRO CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Visual Direction
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Style With
            <br />
            A Message
          </h2>
        </div>

        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            The Nurnrebel aka XNX lookbook is built to show how the brand should
            feel when it is worn. It is not only about product photos. It is
            about mood, presence, posture, color, texture, and the message behind
            the clothing.
          </p>

          <p>
            Streetwear becomes stronger when customers can see how pieces work
            together. A hoodie can feel like armor. A graphic tee can become a
            statement. A layered outfit can show discipline, awareness, and
            identity without needing a long explanation.
          </p>

          <p>
            As new products are added, this lookbook can become the home for
            campaign photography, outfit guides, drop styling, and visual
            storytelling connected to the Nurnrebel movement.
          </p>
        </div>
      </section>

      {/* CAMPAIGN SET */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Campaign Set
            </p>

            <h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
              Drop 001
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-muted">
            These visual blocks are ready for real product photos later. Replace
            each panel with Firebase Storage images or admin-managed lookbook
            content when your campaign photos are ready.
          </p>
        </div>

        <div className="grid auto-rows-[360px] gap-6 md:grid-cols-2 lg:grid-cols-3">
          {looks.map((look, index) => (
            <motion.a
              id={look.id}
              href={`#${look.id}-details`}
              key={look.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className={`${look.size} group relative overflow-hidden rounded-[2rem] border border-border bg-card`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#202020] via-[#111111] to-[#181818]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_55%)] opacity-70" />
              <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:8px_8px]" />

              <div className="absolute left-5 top-5 z-10 rounded-full border border-border bg-background/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted backdrop-blur">
                {look.tag}
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted opacity-0 transition group-hover:opacity-100">
                <Camera size={18} />
              </div>

              <div className="relative flex h-full flex-col justify-between p-7">
                <div />

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border bg-white/[0.04] transition duration-500 group-hover:scale-110">
                  <Eye size={34} className="text-accent" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                    {look.type}
                  </p>

                  <h3 className="mt-3 text-4xl font-black uppercase leading-none">
                    {look.title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-muted">
                    {look.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <span className="text-xs font-black uppercase tracking-widest text-muted">
                      View Look
                    </span>

                    <ArrowRight
                      size={18}
                      className="text-muted transition group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* STYLE RULES */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-28 lg:grid-cols-[1fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-border bg-card p-8 md:p-10"
          >
            <Sparkles className="text-accent" size={34} />

            <h2 className="mt-8 text-5xl font-black uppercase leading-none md:text-7xl">
              Style As A Statement.
            </h2>

            <p className="mt-8 text-sm leading-8 text-muted">
              The lookbook is where the message becomes visual. Each drop can
              tell a story through silhouette, contrast, texture, and posture.
              Nurnrebel styling is designed to feel bold, grounded, and
              intentional.
            </p>

            <p className="mt-5 text-sm leading-8 text-muted">
              The goal is to help customers imagine how the clothing can be worn
              in real life — as a daily uniform, a photoshoot look, a brand
              moment, or a personal statement.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {styleRules.map((rule, index) => {
              const Icon = rule.icon;

              return (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-[2rem] border border-border bg-card p-7"
                >
                  <Icon size={26} className="text-accent" />

                  <p className="mt-7 text-xs font-black uppercase tracking-[0.35em] text-muted">
                    0{index + 1}
                  </p>

                  <h3 className="mt-5 text-2xl font-black uppercase leading-tight">
                    {rule.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-muted">
                    {rule.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOOK DETAILS */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Look Details
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            How Each
            <br />
            Look Speaks
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {looks.map((look, index) => (
            <div
              id={`${look.id}-details`}
              key={look.id}
              className="rounded-[2rem] border border-border bg-card p-8"
            >
              <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
                {look.tag}
              </p>

              <h3 className="mt-4 text-3xl font-black uppercase">
                {look.title}
              </h3>

              <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-muted">
                {look.type}
              </p>

              <p className="mt-5 text-sm leading-8 text-muted">
                {look.description} This look is designed to support the
                Nurnrebel aka XNX message by combining clean streetwear energy
                with a strong sense of identity. It can be styled with neutral
                bottoms, layered pieces, bold accessories, or simple everyday
                essentials.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-background"
                >
                  Shop Pieces <ArrowRight size={15} />
                </Link>

                <Link
                  href="/movement"
                  className="inline-flex items-center rounded-full border border-border bg-background px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-foreground"
                >
                  Meaning
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAMPAIGN NOTES */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-28">
          <div className="mb-14">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Campaign Notes
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              More Than
              <br />
              Outfit Photos
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {campaignNotes.map((note, index) => (
              <div
                key={note.title}
                className="rounded-[2rem] border border-border bg-card p-8"
              >
                <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                  0{index + 1}
                </p>

                <h3 className="mt-12 text-3xl font-black uppercase leading-none">
                  {note.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-muted">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOPPING/STYLING GUIDE */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-28 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Shirt size={32} className="text-accent" />

          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            How To Style Nurnrebel
          </h2>

          <p className="mt-6 text-sm leading-8 text-muted">
            Start with one statement piece and build around it. A graphic tee
            can sit under an oversized hoodie. A hoodie can be paired with
            relaxed pants or denim. Dark neutral colors help the message stand
            out while keeping the outfit easy to wear.
          </p>

          <p className="mt-5 text-sm leading-8 text-muted">
            The best Nurnrebel looks feel intentional. They do not need to be
            overcomplicated. A clean fit, strong posture, and message-driven
            piece can carry the whole look.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Flame size={32} className="text-accent" />

          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            From Product To Presence
          </h2>

          <p className="mt-6 text-sm leading-8 text-muted">
            A product becomes stronger when customers can picture how it fits
            into their life. The lookbook helps connect the product image to the
            feeling of wearing it: confidence, identity, awareness, and
            expression.
          </p>

          <p className="mt-5 text-sm leading-8 text-muted">
            As the brand grows, this page can become a full campaign archive
            with real photography, collection notes, product links, and seasonal
            styling guides.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Lookbook FAQ
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Questions
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
          <BadgeCheck size={34} className="mx-auto text-accent" />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-accent">
            Build Your Fit
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            Turn The Message Into A Look
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Explore the current Nurnrebel aka XNX shop and build a look around
            statement streetwear, identity, awareness, and self-expression.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
            >
              Shop The Drop <ArrowRight size={18} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              About The Brand
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes lookbookMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}