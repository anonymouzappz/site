"use client";

import AuthNavButton from "@/components/auth/AuthNavButton";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, ShoppingBag, Sparkles, Sun, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Cards", href: "/cards" },
  { label: "About", href: "/about" },
  { label: "Movement", href: "/movement" },
  { label: "Blog", href: "/blog" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Contact", href: "/contact" },
];

function ThemeIcon({ theme }: { theme: "dark" | "light" }) {
  return (
    <span className="relative z-10" suppressHydrationWarning>
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </span>
  );
}

function Logo({
  onClick,
  theme,
}: {
  onClick?: () => void;
  theme: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="group relative flex shrink-0 items-center gap-2"
    >
      <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl opacity-0 transition duration-700 group-hover:opacity-100" />

      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/30 blur-xl" />

        <Image
          src={theme === "light" ? "/logo-black.png" : "/logo-white.png"}
          alt="Nurnrebel icon"
          width={48}
          height={48}
          priority
          className="relative z-10 h-[48px] w-[48px] object-contain"
        />
      </div>

      <Image
        src={
          theme === "light"
            ? "/nurnrebel-black.png"
            : "/nurnrebel.png"
        }
        alt="Nurnrebel wordmark"
        width={128}
        height={40}
        priority
        style={{ width: "105px", height: "auto" }}
        className="relative z-10 object-contain transition duration-500 group-hover:opacity-90"
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const nextTheme = savedTheme === "light" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");

    requestAnimationFrame(() => {
      setTheme(nextTheme);
    });
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";

      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("theme", next);

      return next;
    });
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-[9999] transition-all duration-500 ${
          scrolled ? "pt-2" : "pt-4"
        }`}
      >
        <div className="mx-auto max-w-[1650px] px-3 sm:px-5">
          <div
            className={`relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${
              scrolled
                ? "border-border bg-background/80 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                : "border-border/70 bg-background/55 backdrop-blur-xl"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(102,122,69,0.14),transparent_45%)]" />
            <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            <nav className="relative z-10 grid h-[82px] grid-cols-[220px_minmax(0,1fr)_auto] items-center gap-4 px-5">
              <div className="flex items-center">
                <Logo theme={theme} />
              </div>

              <div className="hidden justify-center 2xl:flex">
                <div className="relative flex items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(102,122,69,0.10),transparent)]" />

                  {navItems.map((item) => {
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative overflow-hidden rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[0.24em] transition-all duration-300 ${
                          active
                            ? "text-white"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-full bg-accent shadow-[0_0_30px_rgba(102,122,69,0.45)]"
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 30,
                            }}
                          />
                        )}

                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="hidden items-center gap-2 2xl:flex">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  onClick={toggleTheme}
                  className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-card/70 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition"
                  aria-label="Toggle theme"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <ThemeIcon theme={theme} />
                </motion.button>

                <AuthNavButton />

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/shop"
                    className="group relative inline-flex h-11 items-center overflow-hidden rounded-full border border-accent/30 bg-accent px-5 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_30px_rgba(102,122,69,0.35)] transition"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={14} />
                      Latest Drop
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Link
                    href="/cart"
                    className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-foreground text-background shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition"
                    aria-label="Cart"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <ShoppingBag size={18} className="relative z-10" />
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center justify-end gap-2 2xl:hidden">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={toggleTheme}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
                  aria-label="Toggle theme"
                >
                  <ThemeIcon theme={theme} />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
                  aria-label="Open menu"
                >
                  <Menu size={22} />
                </motion.button>
              </div>
            </nav>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[999999] bg-background/95 backdrop-blur-2xl 2xl:hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(102,122,69,0.18),transparent_45%)]" />

            <div className="relative z-10 flex h-[82px] items-center justify-between border-b border-border px-5">
              <Logo onClick={() => setOpen(false)} theme={"dark"} />

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
                aria-label="Close menu"
              >
                <X size={22} />
              </motion.button>
            </div>

            <div className="relative z-10 flex h-[calc(100dvh-82px)] flex-col overflow-y-auto px-6 py-8">
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const active = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-2xl border px-5 py-5 text-xl font-black uppercase tracking-[0.14em] transition ${
                          active
                            ? "border-accent bg-accent text-white shadow-[0_0_35px_rgba(102,122,69,0.35)]"
                            : "border-border bg-card/50 text-muted"
                        }`}
                      >
                        {item.label}
                        {active && (
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto space-y-3 pt-8">
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="block rounded-full border border-border bg-card px-6 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-foreground"
                >
                  Account
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-accent px-6 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-white shadow-[0_0_35px_rgba(102,122,69,0.35)]"
                >
                  Latest Drop
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="block rounded-full border border-border bg-card px-6 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-foreground"
                >
                  Cart
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}