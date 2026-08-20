"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";

export default function AuthNavButton() {
  const { user, loading, isAnonymous, logout } = useAuth();

  if (loading) return null;

  if (!user || isAnonymous) {
    return (
      <Link
        href="/auth"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-[11px] font-black uppercase tracking-[0.22em] text-muted transition hover:border-foreground hover:text-foreground"
      >
        <LogIn size={15} />
        Account
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.22em] text-background hover:bg-muted"
      >
        <UserRound size={15} />
        Account
      </Link>

      <button
        onClick={logout}
        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-[11px] font-black uppercase tracking-[0.22em] text-muted hover:border-foreground hover:text-foreground"
      >
        Logout
      </button>
    </div>
  );
}