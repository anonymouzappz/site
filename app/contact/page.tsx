"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Package,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { sendContactMessage } from "@/lib/contact";
import RobotCheck from "@/components/contact/RobotCheck";

const contactOptions = [
  {
    icon: Mail,
    title: "General Contact",
    text: "Questions, support, press, or brand inquiries.",
    value: "contact@nurnrebel.com",
  },
  {
    icon: Package,
    title: "Orders & Drops",
    text: "Questions about products, shipping, and releases.",
    value: "orders@nurnrebel.com",
  },
  {
    icon: Users,
    title: "Collabs",
    text: "Creators, models, photographers, artists, and partnerships.",
    value: "collab@nurnrebel.com",
  },
];

const supportTopics = [
  {
    icon: Shirt,
    title: "Product Questions",
    text: "Ask about sizing, colors, product details, drop availability, styling ideas, or future Nurnrebel aka XNX releases.",
  },
  {
    icon: Truck,
    title: "Shipping Help",
    text: "Reach out if you have questions about shipping, delivery, fulfillment, address details, or order updates.",
  },
  {
    icon: Sparkles,
    title: "Brand Partnerships",
    text: "Creators, photographers, models, artists, and community partners can contact us about possible collaborations.",
  },
  {
    icon: ShieldCheck,
    title: "Customer Support",
    text: "Use the contact form for order support, product concerns, payment questions, or general customer service needs.",
  },
];

const responseSteps = [
  {
    number: "01",
    title: "Send Your Message",
    text: "Choose the inquiry type that best matches your request and include as much detail as possible.",
  },
  {
    number: "02",
    title: "We Review It",
    text: "Messages are saved to the admin system so the Nurnrebel team can review support, collab, and order requests.",
  },
  {
    number: "03",
    title: "We Follow Up",
    text: "If your message needs a response, we will use the email address you provided to contact you.",
  },
];

const faqs = [
  {
    q: "How do I contact Nurnrebel aka XNX?",
    a: "Use the contact form on this page or email the address that best matches your request. General questions, order support, and collaboration inquiries can all be sent here.",
  },
  {
    q: "What should I include for order support?",
    a: "Include your name, email address, order details, product name, and a clear description of the issue so support can review it faster.",
  },
  {
    q: "Can creators or models contact the brand?",
    a: "Yes. Creators, models, photographers, stylists, artists, and media partners can use the Collaboration option in the form.",
  },
  {
    q: "Where can I learn more about the brand?",
    a: "Visit the About page, Movement page, Lookbook, and Blog to learn more about the Nurnrebel aka XNX message.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);
  const [website, setWebsite] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!captchaToken) { setStatus('Please complete the robot check first.'); return; }

    try {
      setLoading(true);
      setStatus("");

      await sendContactMessage({
        name,
        email,
        type,
        message,
        captchaToken,
        website,
      });

      setName("");
      setEmail("");
      setType("General Inquiry");
      setMessage("");
      setStatus("Message sent. We’ll get back to you soon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setCaptchaToken('');
      setCaptchaReset(value => value + 1);
    }
  }

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
            Contact Nurnrebel
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-6xl text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            Connect With
            <span className="block text-accent">The Movement</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-8 text-muted"
          >
            Reach out for support, collaborations, wholesale, media, order
            questions, product details, or creative partnerships. Nurnrebel aka
            XNX is built for people who move with meaning and want clothing that
            says something.
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
              Shop The Drop <ArrowRight size={18} />
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

      {/* CONTACT INTRO */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Support Center
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            We’re Here
            <br />
            To Help
          </h2>
        </div>

        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            The contact page is the main place to reach Nurnrebel aka XNX for
            customer questions, product support, brand opportunities, and
            movement-related messages. Whether you are shopping a drop, checking
            on an order, asking about sizing, or interested in a collaboration,
            this page helps route your message to the right place.
          </p>

          <p>
            When sending a message, include clear details so the team can
            understand what you need. For order questions, include the product
            name, checkout email, and any details related to shipping or
            fulfillment. For collaboration requests, include your role, links,
            location, and what type of project you have in mind.
          </p>

          <p>
            Nurnrebel is more than a clothing brand. It is a message-driven
            streetwear movement, so we also welcome serious creative, community,
            and media inquiries that align with awareness, identity, culture,
            and expression.
          </p>
        </div>
      </section>

      {/* MAIN CONTACT GRID */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          {contactOptions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[2rem] border border-border bg-card p-7"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                    <Icon size={22} className="text-accent" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-muted">
                      {item.text}
                    </p>

                    <p className="mt-4 break-all text-xs font-black uppercase tracking-[0.25em] text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className="rounded-[2rem] border border-border bg-surface/70 p-7 backdrop-blur-xl">
            <Clock size={28} className="text-accent" />

            <h3 className="mt-5 text-2xl font-black uppercase">
              Response Expectations
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted">
              Response times may vary depending on order volume, drop activity,
              and the type of inquiry. Clear messages with accurate contact
              information are easier to review and respond to.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[2.5rem] border border-border bg-surface/70 p-8 backdrop-blur-xl md:p-10"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
            <MessageSquare size={26} className="text-accent" />
          </div>

          <h2 className="mt-8 text-4xl font-black uppercase leading-none md:text-6xl">
            Send A Message
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted">
            Send support requests, collab submissions, wholesale questions,
            product questions, or general brand messages directly to the
            Nurnrebel admin team.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Website<input name="website" value={website} onChange={e => setWebsite(e.target.value)} autoComplete="off" tabIndex={-1}/></label></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                maxLength={200}
                required
                className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted/50"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                maxLength={254}
                type="email"
                required
                className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted/50"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-full border border-border bg-card px-5 py-4 text-sm text-muted outline-none"
            >
              <option>General Inquiry</option>
              <option>Order Support</option>
              <option>Product Question</option>
              <option>Shipping Question</option>
              <option>Collaboration</option>
              <option>Wholesale</option>
              <option>Press / Media</option>
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              maxLength={10000}
              rows={7}
              required
              className="w-full resize-none rounded-[2rem] border border-border bg-card px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted/50"
            />

            <RobotCheck onToken={setCaptchaToken} reset={captchaReset}/>
            <button
              disabled={loading || !captchaToken}
              className="w-full rounded-full bg-foreground px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Submit Message"}
            </button>

            {status && (
              <p className="text-center text-xs font-bold uppercase tracking-widest text-muted">
                {status}
              </p>
            )}
          </form>
        </motion.div>
      </section>

      {/* SUPPORT TOPICS */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              What You Can Ask About
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
              Support Topics
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <div
                  key={topic.title}
                  className="rounded-[2rem] border border-border bg-card p-7"
                >
                  <Icon size={25} className="text-accent" />

                  <h3 className="mt-5 text-lg font-black uppercase">
                    {topic.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted">
                    {topic.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW CONTACT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            How Contact Works
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Simple And
            <br />
            Direct
          </h2>

          <p className="mt-6 text-base leading-8 text-muted">
            The form helps organize customer support, collaboration inquiries,
            product questions, and general messages. The more detail you
            provide, the easier it is to understand your request.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {responseSteps.map((step) => (
            <div
              key={step.title}
              className="rounded-[2rem] border border-border bg-card p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-sm font-black text-accent">
                {step.number}
              </div>

              <h3 className="mt-7 text-3xl font-black uppercase">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND + SHOPPING HELP */}
      <section className="border-y border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-24 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-card p-8">
            <Package size={32} className="text-accent" />

            <h2 className="mt-6 text-4xl font-black uppercase leading-none">
              Order And Product Help
            </h2>

            <p className="mt-6 text-sm leading-8 text-muted">
              For order support, include your checkout email, product name,
              issue description, and any relevant shipping information. Product
              questions can include sizing, color, availability, drop timing, or
              styling needs.
            </p>

            <p className="mt-5 text-sm leading-8 text-muted">
              You can also visit the Shop page to view current products, product
              images, prices, and product descriptions before reaching out.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-background"
            >
              Visit Shop <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8">
            <Users size={32} className="text-accent" />

            <h2 className="mt-6 text-4xl font-black uppercase leading-none">
              Collabs And Creative Work
            </h2>

            <p className="mt-6 text-sm leading-8 text-muted">
              Nurnrebel aka XNX is open to serious collaboration conversations
              with creators, models, photographers, stylists, artists, media
              pages, and people who understand the message behind the brand.
            </p>

            <p className="mt-5 text-sm leading-8 text-muted">
              When submitting a collab request, include links to your work, your
              location, your idea, and why you connect with the movement.
            </p>

            <Link
              href="/movement"
              className="mt-7 inline-flex items-center gap-3 rounded-full border border-border bg-background px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-foreground"
            >
              Learn Movement <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">
            Contact FAQ
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
          <HelpCircle size={34} className="mx-auto text-accent" />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-accent">
            Need More Info?
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
            Explore The Brand Before You Reach Out
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Learn about the Nurnrebel aka XNX story, movement, lookbook, and
            current product drops.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              About
            </Link>

            <Link
              href="/lookbook"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-foreground"
            >
              Lookbook
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
            >
              Shop <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
