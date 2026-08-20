"use client";

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
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const principles = [
  {
    icon: Eye,
    title: "Awareness",
    text: "Designs built around culture, pressure, silence, identity, and the truths people carry daily.",
  },
  {
    icon: Shield,
    title: "Identity",
    text: "Clothing that feels like armor — a way to represent your mindset without explaining yourself.",
  },
  {
    icon: Sparkles,
    title: "Expression",
    text: "Minimal streetwear with meaning. Every piece is made to speak before you do.",
  },
];

const storyPoints = [
  {
    title: "Built From Real Life",
    text: "Nurnrebel aka XNX is inspired by real pressure, real identity, and the need for people to express what they carry inside. The brand is for those who have lived through silence, growth, struggle, and transformation.",
  },
  {
    title: "Streetwear With Purpose",
    text: "Every graphic, color choice, and product direction is connected to the message of awareness. The goal is not just to create clothing that looks good, but clothing that feels connected to a mindset.",
  },
  {
    title: "A Voice You Can Wear",
    text: "Some people speak through music, art, movement, or action. Nurnrebel gives people another way to speak — through what they wear and how they present themselves to the world.",
  },
];

const timeline = [
  {
    number: "01",
    title: "The Idea",
    text: "A brand built around social awareness, self-expression, and the belief that clothing can carry a personal message.",
  },
  {
    number: "02",
    title: "The Message",
    text: "The message became clear: wear your mindset, stand in your truth, and let the clothes speak.",
  },
  {
    number: "03",
    title: "The Movement",
    text: "Nurnrebel aka XNX continues to grow as a movement for people who value identity, culture, awareness, and bold expression.",
  },
];

const commitments = [
  {
    icon: BadgeCheck,
    title: "Original Direction",
    text: "The brand is built around its own identity, message, and creative language.",
  },
  {
    icon: PackageCheck,
    title: "Clear Product Details",
    text: "Product pages are designed to show images, options, descriptions, and shopping information clearly.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Focus",
    text: "The shopping experience is built for real customers who want meaningful clothing and easy navigation.",
  },
  {
    icon: Users,
    title: "Community Mindset",
    text: "Nurnrebel is for people who connect with awareness, personal growth, and expression.",
  },
];

const faqs = [
  {
    q: "What is Nurnrebel aka XNX?",
    a: "Nurnrebel aka XNX is a social awareness streetwear brand focused on identity, rebellion, truth, awareness, and self-expression through clothing.",
  },
  {
    q: "What does “wear your mindset” mean?",
    a: "It means choosing clothing that represents how you think, what you stand for, and the message you want to carry into the world.",
  },
  {
    q: "What kind of products does the brand sell?",
    a: "The shop focuses on statement streetwear, including graphic pieces, hoodies, sets, and clothing designed around message-driven fashion.",
  },
  {
    q: "Is Nurnrebel only about fashion?",
    a: "Fashion is the product, but the larger idea is the movement behind it. The brand is about awareness, confidence, identity, and expression.",
  },
];

export default function AboutPage() {
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
            About Nurnrebel / XNX
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-5xl text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            Let The Clothes
            <span className="block text-accent">Speak For You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-8 text-muted"
          >
            Nurnrebel, also known as XNX, is a social awareness clothing brand
            created for people who think differently, move boldly, and refuse to
            stay silent. The brand allows the consumer to wear their mindset and
            express identity, awareness, rebellion, truth, and self-respect
            through fashion.
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
              Shop The Drop <ArrowRight size={17} />
            </Link>

            <Link
              href="/movement"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              The Movement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* MISSION + PRINCIPLES */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-28 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2.5rem] border border-border bg-card p-8"
        >
          <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
            The Mission
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase leading-none md:text-6xl">
            Wear What You Stand For.
          </h2>

          <p className="mt-7 text-sm leading-8 text-muted">
            We believe clothing should do more than complete an outfit. It
            should carry meaning. It should represent the mindset, pressure,
            questions, lessons, and values of the person wearing it. Nurnrebel
            aka XNX was built for people who want their style to hold a message,
            not just a logo.
          </p>

          <p className="mt-5 text-sm leading-8 text-muted">
            The mission is to create statement clothing that helps people feel
            seen, confident, and connected to something deeper than a trend. This
            brand is for those who believe fashion can be personal, cultural,
            and expressive at the same time.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-background"
          >
            Shop The Drop <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="space-y-6">
          {principles.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="rounded-[2rem] border border-border bg-surface/70 p-7 backdrop-blur-xl"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <Icon size={22} className="text-accent" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ORIGIN STORY */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-28 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Origin Story
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Built From
              <br />
              The Inside Out
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-muted">
            <p>
              Nurnrebel aka XNX was created from the idea that people carry
              stories the world does not always see. Some people carry pressure.
              Some carry silence. Some carry resilience, loss, discipline,
              ambition, pain, creativity, and growth. The brand turns that
              internal experience into something visible.
            </p>

            <p>
              Streetwear has always been connected to identity and culture. It
              has been shaped by music, neighborhoods, personal confidence,
              community, and resistance. Nurnrebel builds on that foundation by
              creating clothing that speaks to awareness and expression.
            </p>

            <p>
              The brand is not about chasing every trend. It is about creating a
              consistent message: wear your mindset, represent your truth, and
              move like your story matters.
            </p>
          </div>
        </div>
      </section>

      {/* STORY CARDS */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Brand Foundation
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Why It Exists
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {storyPoints.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="rounded-[2rem] border border-border bg-card p-8"
            >
              <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                0{index + 1}
              </p>

              <h3 className="mt-12 text-3xl font-black uppercase leading-none">
                {item.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-muted">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MESSAGE IN MOTION */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-28">
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl text-5xl font-black uppercase leading-[0.95] md:text-7xl"
          >
            Not Just Clothing.
            <span className="block text-accent">A Message In Motion.</span>
          </motion.h2>

          <p className="mt-8 max-w-4xl text-base leading-8 text-muted">
            Nurnrebel aka XNX is built on the idea that clothing can move with a
            person’s story. A shirt can represent confidence. A hoodie can feel
            like armor. A full outfit can become a statement of discipline,
            creativity, awareness, and identity. When people choose Nurnrebel,
            they are not just choosing fabric — they are choosing a message that
            travels with them.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {["Mindset", "Culture", "Movement"].map((word, index) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="rounded-[2rem] border border-border bg-card p-8"
              >
                <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                  0{index + 1}
                </p>
                <h3 className="mt-20 text-4xl font-black uppercase">{word}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {word === "Mindset" &&
                    "The thoughts, lessons, discipline, and self-belief a person carries into the world."}
                  {word === "Culture" &&
                    "The style, language, music, community, and daily experiences that shape expression."}
                  {word === "Movement" &&
                    "The ongoing push to live with awareness, confidence, and purpose."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Brand Path
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            From Idea
            <br />
            To Movement
          </h2>

          <p className="mt-6 text-base leading-8 text-muted">
            The brand continues to grow through product drops, storytelling,
            visuals, and a clear message. Every step is about building something
            that customers can connect with beyond the checkout page.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {timeline.map((item) => (
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

      {/* COMMITMENT */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-28">
          <div className="mb-14">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Customer Promise
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Built With
              <br />
              Intention
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {commitments.map((item) => {
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

      {/* SHOPPING CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-28 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Palette size={32} className="text-accent" />
          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            Designed For Daily Expression
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            The clothing is designed to work in real life: casual days, creative
            spaces, streetwear outfits, photoshoots, brand events, and daily
            movement. Customers can build outfits around statement graphics,
            bold colors, and pieces that carry meaning.
          </p>
          <p className="mt-5 text-sm leading-8 text-muted">
            Each product page gives customers a closer look at available images,
            price, options, product description, and checkout details.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8">
          <BookOpen size={32} className="text-accent" />
          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            A Brand Language With Meaning
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            The brand language is built around contrast: silence and expression,
            pressure and confidence, rebellion and discipline, awareness and
            action. That contrast gives the clothing its voice.
          </p>
          <p className="mt-5 text-sm leading-8 text-muted">
            XNX is not just a name on a garment. It is part of a visual and
            cultural identity that represents people who move with intention.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Common Questions
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            About The Brand
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
          <Flame size={34} className="mx-auto text-accent" />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-accent">
            Wear Your Mindset
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            Find A Piece That Says What You Mean
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Explore the current Nurnrebel aka XNX shop, view product details,
            and choose statement wear built around awareness, identity,
            rebellion, and expression.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
            >
              Shop Now <ArrowRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}