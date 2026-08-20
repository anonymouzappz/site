"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Eye,
  Flame,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  Palette,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { subscribeEmail } from "@/lib/subscribe";

const pillars = [
  {
    icon: Eye,
    title: "See Clearly",
    text: "Awareness starts with noticing what most people are trained to ignore. The movement is about paying attention to identity, pressure, culture, silence, and the truth behind what people carry.",
  },
  {
    icon: Megaphone,
    title: "Speak Boldly",
    text: "The message does not always need words. Sometimes the outfit speaks first. Nurnrebel uses clothing as a visual language for confidence, resistance, and self-expression.",
  },
  {
    icon: Shield,
    title: "Stand Firm",
    text: "Nurnrebel is for people who refuse to water down who they are. The brand represents strength, discipline, awareness, and the courage to stand in your identity.",
  },
];

const movementValues = [
  {
    icon: Target,
    title: "Purpose",
    text: "Every drop is connected to the larger idea of wearing something that means more than a trend.",
  },
  {
    icon: Palette,
    title: "Creative Identity",
    text: "Style becomes a personal signal. Colors, graphics, and silhouettes help customers represent their mindset.",
  },
  {
    icon: HeartHandshake,
    title: "Community",
    text: "The movement is for people who connect through awareness, personal growth, culture, and expression.",
  },
  {
    icon: BadgeCheck,
    title: "Original Message",
    text: "Nurnrebel aka XNX is built around its own brand language: wear your mindset and let the clothes speak.",
  },
];

const manifestoLines = [
  {
    title: "Identity",
    text: "Know who you are before the world tries to rename you.",
  },
  {
    title: "Awareness",
    text: "See the pressure, the silence, the culture, and the message behind the surface.",
  },
  {
    title: "Resistance",
    text: "Refuse to become smaller just to make other people comfortable.",
  },
  {
    title: "Expression",
    text: "Use style, voice, movement, art, and action to represent what you carry.",
  },
];

const movementFaqs = [
  {
    q: "What is the Nurnrebel movement?",
    a: "The movement is the message behind the clothing. It is about identity, awareness, truth, rebellion against silence, and using fashion as a form of self-expression.",
  },
  {
    q: "Is this only about streetwear?",
    a: "Streetwear is the product, but the purpose is deeper. Nurnrebel aka XNX uses clothing to help people communicate confidence, culture, mindset, and personal truth.",
  },
  {
    q: "Who is Nurnrebel for?",
    a: "Nurnrebel is for thinkers, creators, rebels, quiet fighters, culture builders, and anyone who wants their clothing to carry meaning.",
  },
  {
    q: "How do I join the movement?",
    a: "You can join by subscribing to the list, shopping the drops, sharing the message, and wearing pieces that represent your mindset.",
  },
];

const movementSteps = [
  {
    number: "01",
    title: "Choose Awareness",
    text: "Start by recognizing what your story, mindset, and daily experiences have shaped in you.",
  },
  {
    number: "02",
    title: "Wear Intention",
    text: "Choose clothing that represents your energy instead of simply following what everyone else is wearing.",
  },
  {
    number: "03",
    title: "Carry The Message",
    text: "Let the message move with you — in public, online, in your work, and in the way you show up.",
  },
];

export default function MovementPage() {
  const [movementEmail, setMovementEmail] = useState("");
  const [movementStatus, setMovementStatus] = useState("");
  const [movementLoading, setMovementLoading] = useState(false);

  async function handleMovementSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setMovementLoading(true);
      setMovementStatus("");

      await subscribeEmail(movementEmail, "movement_page");

      setMovementEmail("");
      setMovementStatus("You’re part of the movement.");
    } catch (error) {
      setMovementStatus(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setMovementLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[560px] w-[560px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-28">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-accent"
          >
            The Movement
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-6xl text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            This Is More Than
            <span className="block text-accent">Clothing</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-8 text-muted"
          >
            Nurnrebel aka XNX is a movement for thinkers, rebels, creators, and
            people who carry a message. We design clothing that turns mindset
            into a visible statement and gives people another way to express
            identity, awareness, resistance, and personal truth.
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
              Wear The Message <ArrowRight size={18} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground hover:border-foreground"
            >
              About The Brand
            </Link>
          </motion.div>
        </div>
      </section>

      {/* INTRO STORY */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-28 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Why It Matters
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            A Voice
            <br />
            You Can Wear
          </h2>
        </div>

        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            Clothing has always been connected to identity. What people wear can
            show where they come from, what they believe, how they feel, and how
            they want to be seen. Nurnrebel aka XNX builds on that idea by
            creating statement wear for people who want their clothing to carry
            a message.
          </p>

          <p>
            The movement is about people who refuse to be invisible. It is about
            quiet strength, bold energy, personal growth, and the pressure that
            shapes a person before the world ever sees the final version.
          </p>

          <p>
            Nurnrebel does not treat fashion like empty decoration. The clothing
            is part of a larger language built around awareness, rebellion,
            discipline, culture, and self-expression.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="mb-14">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Movement Pillars
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            What We
            <br />
            Stand On
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                whileHover={{ y: -5 }}
                className="rounded-[2rem] border border-border bg-card p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <Icon size={22} className="text-accent" />
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

      {/* MANIFESTO */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-28 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Manifesto
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Let Your
              <span className="block text-accent">Mindset Speak.</span>
            </h2>

            <p className="mt-8 max-w-xl text-sm leading-8 text-muted">
              This manifesto is the foundation of the movement. It speaks to the
              people who carry pressure, but still show up with purpose. It is
              for people who turn their story into strength.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-border bg-card p-8 md:p-10"
          >
            <p className="text-lg leading-9 text-muted">
              We are not building clothes just to be worn. We are building
              statements. Every piece is a reminder that silence does not mean
              weakness, style does not mean emptiness, and awareness does not
              have to be loud to be powerful.
            </p>

            <p className="mt-6 text-lg leading-9 text-muted">
              The world tries to label people before it understands them.
              Nurnrebel exists for those who choose to define themselves.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {manifestoLines.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted">
                    0{index + 1}
                  </p>
                  <h3 className="mt-6 text-xl font-black uppercase">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* BUILT FOR */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-border bg-card p-8 lg:col-span-2"
          >
            <Flame className="text-accent" size={34} />

            <h2 className="mt-8 text-5xl font-black uppercase leading-none md:text-7xl">
              Built For Those Who Refuse To Blend In.
            </h2>

            <p className="mt-8 max-w-3xl text-sm leading-8 text-muted">
              Nurnrebel exists for the ones who question, create, observe,
              resist, and evolve. The ones who know that fashion can be more
              than appearance — it can be a language. It is for people who have
              learned to keep moving even when they were misunderstood.
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-8 text-muted">
              The movement is not about being loud for attention. It is about
              being intentional with what you wear, how you show up, and what you
              represent. Every piece is a reminder that identity can be visible,
              powerful, and personal.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-background"
              >
                Shop The Movement <ArrowRight size={16} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-foreground"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="rounded-[2rem] border border-border bg-surface/70 p-8 backdrop-blur-xl"
          >
            <Users className="text-accent" size={34} />

            <p className="mt-8 text-xs font-black uppercase tracking-[0.35em] text-muted">
              Join The List
            </p>

            <h3 className="mt-4 text-3xl font-black uppercase">
              Be Part Of The Movement.
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted">
              Subscribe for drop updates, brand messages, product news, and
              future Nurnrebel aka XNX releases.
            </p>

            <form onSubmit={handleMovementSubscribe} className="mt-8 space-y-3">
              <input
                value={movementEmail}
                onChange={(e) => setMovementEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted/50"
              />

              <button
                disabled={movementLoading}
                className="w-full rounded-full bg-foreground px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {movementLoading ? "Joining..." : "Join XNX"}
              </button>
            </form>

            {movementStatus && (
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted">
                {movementStatus}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-28">
          <div className="mb-14">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Movement Values
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              What The
              <br />
              Brand Carries
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {movementValues.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-border bg-card p-7"
                >
                  <Icon size={25} className="text-accent" />
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
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            How To Join
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Carry The
            <br />
            Message Forward
          </h2>

          <p className="mt-6 text-base leading-8 text-muted">
            Joining the movement does not require perfection. It starts with
            intention. Choose what represents you, understand the message, and
            wear it with confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {movementSteps.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-border bg-card p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-sm font-black text-accent">
                {item.number}
              </div>

              <h3 className="mt-7 text-3xl font-black uppercase">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREATIVE LANGUAGE */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-28 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-card p-8">
            <Lightbulb size={32} className="text-accent" />
            <h2 className="mt-6 text-4xl font-black uppercase leading-none">
              The Meaning Behind The Message
            </h2>
            <p className="mt-6 text-sm leading-8 text-muted">
              The phrase “wear your mindset” is about choosing clothing that
              lines up with your inner voice. It is for people who use fashion
              as a form of presence — not just to be seen, but to be understood.
            </p>
            <p className="mt-5 text-sm leading-8 text-muted">
              Nurnrebel aka XNX turns pressure, discipline, awareness, and
              resilience into a visual identity customers can connect with.
            </p>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8">
            <BookOpen size={32} className="text-accent" />
            <h2 className="mt-6 text-4xl font-black uppercase leading-none">
              A Language Of Culture And Truth
            </h2>
            <p className="mt-6 text-sm leading-8 text-muted">
              The movement is influenced by the way culture communicates through
              music, streetwear, symbols, conversation, struggle, and personal
              style. A single outfit can represent confidence, memory,
              resistance, and growth.
            </p>
            <p className="mt-5 text-sm leading-8 text-muted">
              That is why Nurnrebel treats clothing as a message system — every
              piece should feel connected to something real.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Movement FAQ
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Questions
            <br />
            About XNX
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {movementFaqs.map((item) => (
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

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-10 text-center md:p-16">
          <Sparkles size={34} className="mx-auto text-accent" />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-accent">
            Wear Your Mindset
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            The Movement Starts With What You Carry
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Explore the shop, learn the brand story, and join the list for
            updates as Nurnrebel aka XNX continues building social awareness
            streetwear with purpose.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
            >
              Shop Now <ArrowRight size={18} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}