"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitReset() {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      if (!email.trim()) {
        throw new Error("Enter your email address.");
      }

      await resetPassword(email.trim());

      setMessage(
        "Password reset email sent. Check your inbox and follow the link to reset your password."
      );
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || "Could not send password reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[560px] w-[560px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-white/[0.025] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back To Sign In
            </Link>

            <p className="mt-10 text-xs font-black uppercase tracking-[0.4em] text-accent">
              Account Recovery
            </p>

            <h1 className="mt-5 max-w-4xl text-6xl font-black uppercase leading-[0.9] md:text-8xl">
              Reset Your
              <span className="block text-accent">Password</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
              Enter the email connected to your Nurnrebel / XNX account. We’ll
              send you a secure reset link so you can regain access.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["01", "Secure Link"],
                ["02", "Email Verify"],
                ["03", "Account Access"],
              ].map(([num, label]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-border bg-card p-5"
                >
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted">
                    {num}
                  </p>
                  <h3 className="mt-8 text-xl font-black uppercase">{label}</h3>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2.5rem] border border-border bg-surface p-6 shadow-2xl md:p-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
              <ShieldCheck className="text-accent" size={28} />
            </div>

            <h2 className="mt-8 text-4xl font-black uppercase">
              Recover Account
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted">
              Use the same email you signed up with. If the account exists,
              Firebase will send a password reset email.
            </p>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-5 text-sm text-foreground placeholder:text-muted/50"
                />
              </div>

              <button
                onClick={submitReset}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-background disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>

            {message && (
              <div className="mt-6 rounded-[1.5rem] border border-border bg-card p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 text-accent" size={20} />
                  <p className="text-sm leading-7 text-muted">{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-[1.5rem] border border-border bg-card p-5">
                <p className="text-sm leading-7 text-foreground">{error}</p>
              </div>
            )}

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs leading-6 text-muted">
                Already remember your password?
              </p>

              <Link
                href="/auth"
                className="mt-3 inline-flex rounded-full border border-border bg-card px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-muted hover:text-foreground"
              >
                Return To Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}