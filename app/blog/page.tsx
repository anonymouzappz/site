"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Eye,
  Flame,
  Megaphone,
  Palette,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

const posts = [
  {
    title: "Why Clothing Should Say Something",
    slug: "why-clothing-should-say-something",
    category: "Mindset",
    date: "Drop Journal",
    readTime: "4 min read",
    excerpt:
      "Fashion is more than appearance. It can be identity, awareness, resistance, and a language of its own.",
  },
  {
    title: "The Meaning Behind Wear Your Mindset",
    slug: "the-meaning-behind-wear-your-mindset",
    category: "Brand Story",
    date: "Manifesto",
    readTime: "5 min read",
    excerpt:
      "Nurnrebel aka XNX was built around the idea that customers should be able to wear what they think, feel, and stand for.",
  },
  {
    title: "Social Awareness In Streetwear",
    slug: "social-awareness-in-streetwear",
    category: "Culture",
    date: "Editorial",
    readTime: "6 min read",
    excerpt:
      "Streetwear has always carried messages. Nurnrebel continues that energy through clean, intentional statement pieces.",
  },
  {
    title: "How Statement Clothing Builds Confidence",
    slug: "how-statement-clothing-builds-confidence",
    category: "Mindset",
    date: "Style Notes",
    readTime: "4 min read",
    excerpt:
      "The right piece can change how a person shows up. Statement clothing can become part of confidence, posture, and personal identity.",
  },
  {
    title: "The Role Of Culture In Streetwear",
    slug: "the-role-of-culture-in-streetwear",
    category: "Culture",
    date: "Perspective",
    readTime: "6 min read",
    excerpt:
      "Streetwear is shaped by music, neighborhoods, art, struggle, creativity, and the way people communicate without asking permission.",
  },
  {
    title: "What Makes A Drop Feel Meaningful",
    slug: "what-makes-a-drop-feel-meaningful",
    category: "Drops",
    date: "Drop Notes",
    readTime: "5 min read",
    excerpt:
      "A drop is more than a product release when the clothing connects to a message, a moment, and a reason for people to wear it.",
  },
];

const categories = ["All", "Mindset", "Culture", "Brand Story", "Drops"];

const editorialTopics = [
  {
    icon: Eye,
    title: "Awareness",
    text: "Articles about identity, pressure, silence, culture, and the truths people carry into the world.",
  },
  {
    icon: Shield,
    title: "Mindset",
    text: "Writing focused on confidence, discipline, personal growth, resilience, and wearing what you stand for.",
  },
  {
    icon: Palette,
    title: "Style Language",
    text: "Thoughts on graphics, color, silhouettes, outfit energy, and how clothing becomes visual communication.",
  },
];

const featuredNotes = [
  {
    title: "Fashion As A Message",
    text: "Before someone speaks, their clothing can already communicate energy, identity, confidence, resistance, or creativity.",
  },
  {
    title: "The Power Of A Uniform",
    text: "A personal style can become a daily uniform that reminds someone who they are and what they are building.",
  },
  {
    title: "Why Streetwear Carries Culture",
    text: "Streetwear is not only about clothing. It is tied to neighborhoods, music, art, struggle, movement, and voice.",
  },
];

const faqs = [
  {
    q: "What is the Nurnrebel Journal?",
    a: "The Nurnrebel Journal is where the brand shares thoughts about streetwear, mindset, social awareness, culture, and the meaning behind future drops.",
  },
  {
    q: "Will the blog connect to the admin CMS?",
    a: "Yes. This page is ready to become a full CMS-powered blog later, where posts can be added from the admin side and displayed automatically.",
  },
  {
    q: "Why add editorial content to a clothing brand?",
    a: "Editorial content helps explain the meaning behind the brand. It gives customers more context and helps search engines understand the purpose of the site.",
  },
  {
    q: "What topics will be covered?",
    a: "Topics include brand story, streetwear culture, social awareness, product drops, mindset, confidence, and the message behind Nurnrebel aka XNX.",
  },
];

export default function BlogPage() {
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
            Nurnrebel Journal
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-6xl text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            Stories Behind
            <span className="block text-accent">The Message</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-8 text-muted"
          >
            Editorials, movement updates, drop notes, and thoughts behind the
            mindset. The Nurnrebel Journal gives context to the brand, the
            clothing, the culture, and the message behind every piece.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-4"
          >
            <Search size={18} className="text-muted" />
            <input
              placeholder="Search journal..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted/50"
            />
          </motion.div>
        </div>
      </section>

      {/* CATEGORY BAR */}
      <section className="border-b border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 py-6">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`rounded-full border px-5 py-2 text-xs font-black uppercase tracking-widest ${
                index === 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* INTRO CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Editorial Purpose
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Why The
            <br />
            Journal Exists
          </h2>
        </div>

        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            Nurnrebel aka XNX is not only a clothing store. It is a brand built
            around awareness, identity, rebellion, and expression. The journal
            gives the brand a place to explain the ideas behind the clothing,
            the message behind each drop, and the culture that shapes the
            movement.
          </p>

          <p>
            Streetwear has always been connected to voice. It can speak through
            graphics, color, fit, symbols, and attitude. The Nurnrebel Journal
            explores how clothing can become part of confidence, community,
            discipline, and personal storytelling.
          </p>

          <p>
            These articles are made for customers who want more than a product
            image. They want meaning, context, and a reason to connect with what
            they wear.
          </p>
        </div>
      </section>

      {/* TOP ARTICLES */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.article
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-border bg-card p-8 md:p-10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background">
              <BookOpen size={26} className="text-accent" />
            </div>

            <p className="mt-14 text-xs font-black uppercase tracking-[0.35em] text-accent">
              Featured Editorial
            </p>

            <h2 className="mt-5 max-w-3xl text-5xl font-black uppercase leading-none md:text-7xl">
              The Clothes Speak Before You Do.
            </h2>

            <p className="mt-8 max-w-3xl text-base leading-8 text-muted">
              The first piece of Nurnrebel philosophy is simple: fashion can be
              a language. Before words, before explanation, before permission —
              the message can already be present. What a person wears can
              communicate confidence, resistance, creativity, memory, identity,
              and purpose.
            </p>

            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              Nurnrebel aka XNX was created for people who want their clothing
              to hold meaning. It is for those who know that style can say
              something honest before the world asks for an explanation.
            </p>

            <Link
              href="/blog/the-clothes-speak-before-you-do"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-background"
            >
              Read Featured <ArrowRight size={16} />
            </Link>
          </motion.article>

          <div className="space-y-6">
            {posts.slice(0, 2).map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[2rem] border border-border bg-surface/70 p-7 backdrop-blur-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
                  {post.category}
                </p>

                <h3 className="mt-5 text-3xl font-black uppercase leading-tight">
                  {post.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted">
                  {post.excerpt}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted">
                    <Clock size={14} />
                    {post.readTime}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-black uppercase tracking-widest text-foreground"
                  >
                    Read
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Journal Topics
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              What We
              <br />
              Write About
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {editorialTopics.map((topic, index) => {
              const Icon = topic.icon;

              return (
                <motion.div
                  key={topic.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-[2rem] border border-border bg-card p-8"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                    <Icon size={22} className="text-accent" />
                  </div>

                  <h3 className="mt-7 text-2xl font-black uppercase">
                    {topic.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-muted">
                    {topic.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ALL POSTS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Recent Articles
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Read The
              <br />
              Journal
            </h2>
          </div>

          <Link
            href="/movement"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
          >
            Explore Movement <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group rounded-[2rem] border border-border bg-card p-7 hover:border-foreground"
            >
              <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                {post.date}
              </p>

              <h3 className="mt-10 text-3xl font-black uppercase leading-tight">
                {post.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-muted">
                {post.excerpt}
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <span className="text-xs font-black uppercase tracking-widest text-accent">
                  {post.category}
                </span>

                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`Read ${post.title}`}
                >
                  <ArrowRight
                    size={18}
                    className="text-muted transition group-hover:translate-x-1 group-hover:text-foreground"
                  />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* EDITORIAL NOTES */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              Brand Notes
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Ideas Behind
              <br />
              The Clothing
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredNotes.map((note, index) => (
              <motion.div
                key={note.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LONG-FORM SECTION */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-24 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Flame size={32} className="text-accent" />

          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            Why Storytelling Matters In Streetwear
          </h2>

          <p className="mt-6 text-sm leading-8 text-muted">
            Streetwear has always been connected to story. A graphic can point
            to a memory. A phrase can represent a mindset. A color palette can
            create a mood. A drop can become a moment for people who connect
            with the message. That is why the Nurnrebel Journal matters.
          </p>

          <p className="mt-5 text-sm leading-8 text-muted">
            The writing gives customers a way to understand the brand beyond the
            shop page. It gives the products more context and helps the movement
            grow with purpose.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8">
          <Megaphone size={32} className="text-accent" />

          <h2 className="mt-6 text-4xl font-black uppercase leading-none">
            The Message Behind Each Drop
          </h2>

          <p className="mt-6 text-sm leading-8 text-muted">
            A strong drop should feel connected to a message. It should give
            customers a reason to care, a reason to wear it, and a reason to
            remember it. Nurnrebel aka XNX is building toward drops that feel
            intentional from the product image to the product description.
          </p>

          <p className="mt-5 text-sm leading-8 text-muted">
            The blog will become the place where future drops are explained,
            documented, and connected to the larger brand story.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Journal FAQ
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
          <Tag size={34} className="mx-auto text-accent" />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-accent">
            From Journal To Drop
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            Read The Message. Wear The Mindset.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Explore Nurnrebel aka XNX articles, learn the movement, and shop
            statement streetwear created around awareness, identity, and
            self-expression.
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
              About Nurnrebel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}