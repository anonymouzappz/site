"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Mode = "login" | "register";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (!password) return { score: 0, label: "Empty" };
  if (score <= 1) return { score, label: "Weak" };
  if (score === 2 || score === 3) return { score, label: "Good" };
  return { score, label: "Strong" };
}

export default function AuthPage() {
  const {
    user,
    loading,
    isAnonymous,
    emailVerified,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    resendVerification,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const realUser = user && !isAnonymous;

  async function submitEmailAuth() {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name.");
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        await registerWithEmail(name, email, password);
        setMessage("Account created. Check your email to verify your account.");
      } else {
        await loginWithEmail(email, password);
        setMessage("Signed in successfully.");
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      setError(firebaseError.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogleAuth() {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await loginWithGoogle();
      setMessage("Signed in successfully.");
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || "Google sign in failed.");
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
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-accent">
              <Sparkles size={13} />
              Nurnrebel Account
            </div>

            <h1 className="mt-6 max-w-4xl text-6xl font-black uppercase leading-[0.9] md:text-8xl">
              Wear It.
              <span className="block text-accent">Own It.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
              Sign in once to order products, track rewards, save profile
              details, and unlock the full Nurnrebel / XNX experience.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["Checkout", "Secure orders"],
                ["Rewards", "Earn points"],
                ["Drops", "Early access"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-border bg-card p-5"
                >
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted">
                    Access
                  </p>
                  <h3 className="mt-8 text-xl font-black uppercase">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs text-muted">{text}</p>
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
            {loading ? (
              <div className="p-8 text-muted">Loading account...</div>
            ) : realUser ? (
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                  <ShieldCheck className="text-accent" size={28} />
                </div>

                <h2 className="mt-8 text-4xl font-black uppercase">
                  You Are Signed In
                </h2>

                <p className="mt-4 text-sm leading-7 text-muted">
                  {user.email || "Your account is active."}
                </p>

                {!emailVerified &&
                  user.providerData.some((p) => p.providerId === "password") && (
                    <div className="mt-6 rounded-[1.5rem] border border-border bg-card p-5">
                      <p className="text-sm leading-7 text-muted">
                        Your email is not verified yet. Verify before checkout
                        and rewards.
                      </p>

                      <button
                        onClick={resendVerification}
                        className="mt-4 rounded-full bg-foreground px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-background"
                      >
                        Resend Verification
                      </button>
                    </div>
                  )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/account"
                    className="rounded-full bg-foreground px-6 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-background"
                  >
                    Go To Account
                  </Link>

                  <button
                    onClick={logout}
                    className="rounded-full border border-border bg-card px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex rounded-full border border-border bg-card p-1">
                  <button
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                      setError("");
                    }}
                    className={`flex-1 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.22em] ${
                      mode === "login"
                        ? "bg-foreground text-background"
                        : "text-muted"
                    }`}
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => {
                      setMode("register");
                      setMessage("");
                      setError("");
                    }}
                    className={`flex-1 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.22em] ${
                      mode === "register"
                        ? "bg-foreground text-background"
                        : "text-muted"
                    }`}
                  >
                    Create
                  </button>
                </div>

                <button
                  onClick={submitGoogleAuth}
                  disabled={busy}
                  className="mb-5 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-foreground hover:border-foreground disabled:opacity-60"
                >
                  Continue With Google
                  <ArrowRight size={17} />
                </button>

                <div className="mb-5 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-border" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-muted">
                    Or Email
                  </span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>

                <div className="space-y-4">
                  {mode === "register" && (
                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                      />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-5 text-sm text-foreground placeholder:text-muted/50"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-5 text-sm text-foreground placeholder:text-muted/50"
                    />
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-14 text-sm text-foreground placeholder:text-muted/50"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {mode === "register" && (
                    <div className="rounded-[1.25rem] border border-border bg-card p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">
                          Password Strength
                        </p>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-foreground">
                          {strength.label}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-2 rounded-full ${
                              strength.score >= bar
                                ? "bg-foreground"
                                : "bg-background"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-2">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> 8+ characters
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Uppercase letter
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Number
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Symbol
                        </p>
                      </div>
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="flex items-center justify-between text-xs text-muted">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="h-4 w-4 accent-[#F2EFE9]"
                        />
                        Remember me
                      </label>

                      <Link href="/forgot-password" className="hover:text-foreground">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={submitEmailAuth}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-background disabled:opacity-60"
                  >
                    <Mail size={17} />
                    {busy
                      ? "Please Wait..."
                      : mode === "register"
                      ? "Create Account"
                      : "Sign In"}
                  </button>
                </div>

                {message && (
                  <p className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-muted">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-foreground">
                    {error}
                  </p>
                )}

                <p className="mt-6 text-center text-xs leading-6 text-muted">
                  By continuing, you agree to Nurnrebel/XNX account access for
                  orders, rewards, and drop updates.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}