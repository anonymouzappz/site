import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  Flame,
  Megaphone,
  Shield,
  Sparkles,
  Tag,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const siteUrl = "https://nurnrebel.com";

type BlogPost = {
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  description: string;
  excerpt?: string;
  icon: typeof BookOpen;
  sections: {
    heading: string;
    body: string[];
  }[];
};

const posts: BlogPost[] = [
  {
    title: "The Clothes Speak Before You Do",
    slug: "the-clothes-speak-before-you-do",
    category: "Featured Editorial",
    date: "Nurnrebel Journal",
    readTime: "5 min read",
    description:
      "Before words, before explanation, before permission — clothing can already carry a message.",
    icon: BookOpen,
    sections: [
      {
        heading: "Fashion Is A Language",
        body: [
          "Before someone says a word, what they wear can already communicate energy, identity, confidence, resistance, creativity, memory, and purpose. Clothing is often the first signal people see.",
          "Nurnrebel aka XNX was created around that idea. The brand believes that a piece of clothing can hold meaning, not just style. It can represent what a person has lived through, what they believe, and how they choose to move.",
        ],
      },
      {
        heading: "The Message Behind The Look",
        body: [
          "A statement piece does more than complete an outfit. It gives the wearer a way to show what they carry. Some pieces speak loudly. Others speak quietly. Either way, the message is still present.",
          "The Nurnrebel message is simple: wear your mindset. Let your clothing reflect your discipline, awareness, pressure, identity, and truth.",
        ],
      },
      {
        heading: "Why It Matters",
        body: [
          "For many people, style is personal. It is connected to confidence, culture, and self-expression. Nurnrebel uses streetwear as a way to turn those feelings into something visible.",
          "The clothes speak before you do because sometimes the message is already there.",
        ],
      },
    ],
  },
  {
    title: "Why Clothing Should Say Something",
    slug: "why-clothing-should-say-something",
    category: "Mindset",
    date: "Drop Journal",
    readTime: "4 min read",
    description:
      "Fashion is more than appearance. It can be identity, awareness, resistance, and a language of its own.",
    icon: Megaphone,
    sections: [
      {
        heading: "More Than Appearance",
        body: [
          "Clothing can be more than fabric, color, and fit. It can carry personal meaning. It can represent where a person is from, what they believe, what they have survived, and what they are becoming.",
          "Nurnrebel aka XNX exists because fashion should be able to say something. It should be able to carry identity, awareness, confidence, and truth.",
        ],
      },
      {
        heading: "Statement Wear With Purpose",
        body: [
          "Statement clothing gives people a way to express themselves without needing to explain every detail. A graphic, phrase, color, or silhouette can create a message before a conversation even begins.",
          "This is why Nurnrebel focuses on message-driven streetwear. The goal is not just to make clothing that looks good. The goal is to create clothing that feels connected to the person wearing it.",
        ],
      },
    ],
  },
  {
    title: "The Meaning Behind Wear Your Mindset",
    slug: "the-meaning-behind-wear-your-mindset",
    category: "Brand Story",
    date: "Manifesto",
    readTime: "5 min read",
    description:
      "Nurnrebel aka XNX was built around the idea that customers should be able to wear what they think, feel, and stand for.",
    icon: Sparkles,
    sections: [
      {
        heading: "A Mindset You Can Wear",
        body: [
          "Wear Your Mindset means choosing clothing that represents the way you think, the way you move, and the truth you carry. It is about turning inner identity into outer expression.",
          "For Nurnrebel aka XNX, this phrase is the foundation of the brand. It connects the clothing to awareness, rebellion, confidence, and self-respect.",
        ],
      },
      {
        heading: "The Brand Message",
        body: [
          "Some people wear clothing for comfort. Some wear it for style. Some wear it because it helps them feel seen. Nurnrebel is built for all of that, but especially for the person who wants clothing with a message.",
          "The mindset is the meaning. The clothing is the signal.",
        ],
      },
    ],
  },
  {
    title: "Social Awareness In Streetwear",
    slug: "social-awareness-in-streetwear",
    category: "Culture",
    date: "Editorial",
    readTime: "6 min read",
    description:
      "Streetwear has always carried messages. Nurnrebel continues that energy through clean, intentional statement pieces.",
    icon: Eye,
    sections: [
      {
        heading: "Streetwear Has Always Had A Voice",
        body: [
          "Streetwear is connected to culture. It has always carried messages from music, neighborhoods, struggle, creativity, and identity. It is more than clothing. It is a way people communicate where they stand.",
          "Social awareness in streetwear means recognizing that clothing can reflect what is happening around us and inside us.",
        ],
      },
      {
        heading: "Nurnrebel And Awareness",
        body: [
          "Nurnrebel aka XNX uses streetwear as a vehicle for awareness. The brand is built around the idea that people carry pressure, silence, truth, and identity every day.",
          "The clothing becomes a way to make those invisible things visible.",
        ],
      },
    ],
  },
  {
    title: "How Statement Clothing Builds Confidence",
    slug: "how-statement-clothing-builds-confidence",
    category: "Mindset",
    date: "Style Notes",
    readTime: "4 min read",
    description:
      "The right piece can change how a person shows up. Statement clothing can become part of confidence, posture, and personal identity.",
    icon: Shield,
    sections: [
      {
        heading: "Confidence Starts With Alignment",
        body: [
          "When clothing matches how a person feels inside, it can change how they carry themselves. Statement clothing can give someone a sense of presence, confidence, and identity.",
          "Nurnrebel aka XNX creates pieces for people who want their style to line up with their mindset.",
        ],
      },
      {
        heading: "Clothing As Armor",
        body: [
          "A strong outfit can feel like armor. It can help a person enter the world with more intention. It can remind them who they are and what they stand for.",
          "That is why the brand treats clothing as more than product. It is part of the wearer’s personal language.",
        ],
      },
    ],
  },
  {
    title: "The Role Of Culture In Streetwear",
    slug: "the-role-of-culture-in-streetwear",
    category: "Culture",
    date: "Perspective",
    readTime: "6 min read",
    description:
      "Streetwear is shaped by music, neighborhoods, art, struggle, creativity, and the way people communicate without asking permission.",
    icon: Flame,
    sections: [
      {
        heading: "Culture Shapes The Clothing",
        body: [
          "Streetwear does not exist in a vacuum. It is shaped by music, neighborhoods, family, work, art, pressure, and the way people survive and create.",
          "Nurnrebel aka XNX respects that connection. The brand uses streetwear as a way to speak through culture and identity.",
        ],
      },
      {
        heading: "Style Without Permission",
        body: [
          "Streetwear has always had an independent spirit. It gives people room to create their own language and define their own presence.",
          "The Nurnrebel movement is connected to that same energy: stand in your truth and wear your mindset.",
        ],
      },
    ],
  },
  {
    title: "What Makes A Drop Feel Meaningful",
    slug: "what-makes-a-drop-feel-meaningful",
    category: "Drops",
    date: "Drop Notes",
    readTime: "5 min read",
    description:
      "A drop is more than a product release when the clothing connects to a message, a moment, and a reason for people to wear it.",
    icon: Tag,
    sections: [
      {
        heading: "A Drop Needs A Reason",
        body: [
          "A meaningful drop is not just a new product. It has a reason behind it. It connects to a message, a mood, a visual direction, or a moment in the brand story.",
          "For Nurnrebel aka XNX, every drop should feel connected to the larger movement: awareness, identity, rebellion, and expression.",
        ],
      },
      {
        heading: "Product With Context",
        body: [
          "Customers connect deeper when they understand what a piece represents. That is why product descriptions, journal posts, and brand storytelling matter.",
          "The product is what people buy. The message is what people carry.",
        ],
      },
    ],
  },
];

function TagIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <Sparkles size={size} className={className} />;
}

type Props = {
  params: Promise<{ slug: string }>;
};

function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {
      title: "Journal Post Not Found | Nurnrebel aka XNX",
      description: "This journal post could not be found.",
    };
  }

  return {
    title: `${post.title} | Nurnrebel Journal`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "Nurnrebel aka XNX",
      type: "article",
      images: [
        {
          url: `${siteUrl}/og-nurnrebel.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${siteUrl}/og-nurnrebel.png`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const Icon = post.icon;

  const relatedPosts = posts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-5xl px-5 py-24">
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back To Journal
          </Link>

          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
            <Icon size={26} className="text-accent" />
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.35em] text-accent">
            {post.category}
          </p>

          <h1 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            {post.title}
          </h1>

          <div className="mt-7 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-muted">
            {post.description}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-20">
        {post.sections.map((section) => (
          <section key={section.heading} className="mb-14">
            <h2 className="text-3xl font-black uppercase leading-tight md:text-5xl">
              {section.heading}
            </h2>

            <div className="mt-6 space-y-5">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-8 text-muted md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-16 rounded-[2rem] border border-border bg-card p-8">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Nurnrebel aka XNX
          </p>

          <h3 className="mt-4 text-3xl font-black uppercase">
            Wear Your Mindset
          </h3>

          <p className="mt-4 text-sm leading-7 text-muted">
            Explore statement streetwear created around awareness, identity,
            rebellion, culture, and self-expression.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-background"
          >
            Shop The Drop <ArrowRight size={16} />
          </Link>
        </div>
      </article>

      <section className="border-t border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Keep Reading
          </p>

          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            Related Journal Posts
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group rounded-[2rem] border border-border bg-card p-7 hover:border-foreground"
              >
                <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
                  {item.category}
                </p>

                <h3 className="mt-8 text-2xl font-black uppercase leading-tight">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted">
                  {item.excerpt ?? item.description}
                </p>

                <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-xs font-black uppercase tracking-widest text-accent">
                    Read Next
                  </span>

                  <ArrowRight
                    size={18}
                    className="text-muted transition group-hover:translate-x-1 group-hover:text-foreground"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
