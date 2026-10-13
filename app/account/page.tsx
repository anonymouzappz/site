"use client";

import OrderHistory from "@/components/account/OrderHistory";
import { useAuth } from "@/components/providers/AuthProvider";
import { db, storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Crown,
  Gift,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useState } from "react";

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  rewardsPoints: number;
  lifetimePoints: number;
  tier: string;
};

export default function AccountPage() {
  const { user, loading, isAnonymous, emailVerified, resendVerification, logout } =
    useAuth();

  const [profile, setProfile] = useState<UserProfile>({
    uid: "",
    displayName: "",
    email: "",
    photoURL: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    rewardsPoints: 0,
    lifetimePoints: 0,
    tier: "Rebel Starter",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user || isAnonymous) return;

      const refDoc = doc(db, "users", user.uid);
      const snap = await getDoc(refDoc);

      if (snap.exists()) {
        const data = snap.data();

        setProfile({
          uid: user.uid,
          displayName: String(data.displayName || user.displayName || ""),
          email: String(data.email || user.email || ""),
          photoURL: String(data.photoURL || user.photoURL || ""),
          phone: String(data.phone || ""),
          address: String(data.address || ""),
          city: String(data.city || ""),
          state: String(data.state || ""),
          zipCode: String(data.zipCode || ""),
          rewardsPoints: Number(data.rewardsPoints || 0),
          lifetimePoints: Number(data.lifetimePoints || 0),
          tier: String(data.tier || "Rebel Starter"),
        });
      } else {
        const starterProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          rewardsPoints: 0,
          lifetimePoints: 0,
          tier: "Rebel Starter",
        };

        setProfile(starterProfile);

        await setDoc(refDoc, {
          ...starterProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    loadProfile();
  }, [user, isAnonymous]);

  async function saveProfile() {
    if (!user || isAnonymous) return;

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: profile.displayName,
          photoURL: profile.photoURL,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          uid: user.uid,
          email: user.email || profile.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Account updated successfully.");
    } catch {
      setMessage("Unable to save your account. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfileImage(file: File) {
    if (!user || isAnonymous) return;

    setUploading(true);
    setMessage("");

    try {
      const imageRef = ref(storage, `users/${user.uid}/profile/profile.jpg`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      setProfile((prev) => ({
        ...prev,
        photoURL: url,
      }));

      await updateProfile(user, {
        photoURL: url,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          photoURL: url,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Profile image uploaded.");
    } catch {
      setMessage("Unable to upload your image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (!user || isAnonymous) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center">
          <UserRound className="mx-auto text-accent" size={42} />

          <h1 className="mt-6 text-4xl font-black uppercase">
            Account Required
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted">
            Sign in or create an account to manage your profile, rewards,
            orders, and saved information.
          </p>

          <Link
            href="/auth"
            className="mt-8 inline-flex rounded-full bg-foreground px-7 py-4 text-sm font-black uppercase tracking-[0.25em] text-background"
          >
            Go To Auth
          </Link>
        </div>
      </div>
    );
  }

  const nextTierPoints = 500;
  const progress = Math.min(
    100,
    Math.round((profile.lifetimePoints / nextTierPoints) * 100)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-accent"
          >
            Nurnrebel Account
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-6xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            Your
            <span className="block text-accent">Profile</span>
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-border bg-card p-8"
          >
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border border-border bg-background">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={54} className="text-muted" />
                </div>
              )}
            </div>

            <label className="mt-6 flex cursor-pointer items-center justify-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-muted hover:text-foreground">
              {uploading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadProfileImage(file);
                }}
              />
            </label>

            <div className="mt-8 text-center">
              <h2 className="text-3xl font-black uppercase">
                {profile.displayName || "Nurnrebel Member"}
              </h2>

              <p className="mt-2 text-sm text-muted">{profile.email}</p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-widest text-muted">
                {emailVerified ? (
                  <>
                    <CheckCircle2 size={15} />
                    Email Verified
                  </>
                ) : (
                  <>
                    <Mail size={15} />
                    Email Not Verified
                  </>
                )}
              </div>

              {!emailVerified && (
                <button
                  onClick={resendVerification}
                  className="mt-4 w-full rounded-full bg-foreground px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-background"
                >
                  Resend Verification
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-border bg-surface p-7"
          >
            <Crown className="text-accent" size={32} />

            <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-muted">
              Rewards Tier
            </p>

            <h3 className="mt-3 text-3xl font-black uppercase">
              {profile.tier}
            </h3>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-muted">
              {profile.lifetimePoints} / {nextTierPoints} lifetime points
            </p>
          </motion.div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-muted hover:text-foreground"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[2.5rem] border border-border bg-surface p-8 md:p-10"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
              <ShieldCheck size={24} className="text-accent" />
            </div>

            <div>
              <h2 className="text-4xl font-black uppercase">Account Details</h2>
              <p className="mt-2 text-sm text-muted">
                Update profile, shipping address, and reward identity.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <input
              value={profile.displayName}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="Display Name"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />

            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="Phone"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />

            <input
              value={profile.address}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Street Address"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50 md:col-span-2"
            />

            <input
              value={profile.city}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              placeholder="City"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />

            <input
              value={profile.state}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  state: e.target.value,
                }))
              }
              placeholder="State"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />

            <input
              value={profile.zipCode}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  zipCode: e.target.value,
                }))
              }
              placeholder="Zip Code"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />

            <input
              value={profile.photoURL}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  photoURL: e.target.value,
                }))
              }
              placeholder="Image URL"
              className="rounded-full border border-border bg-card px-5 py-4 text-sm text-foreground placeholder:text-muted/50"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-background disabled:opacity-60"
          >
            {saving && <LoaderCircle size={18} className="animate-spin" />}
            Save Account
          </button>

          {message && (
            <p className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm text-muted">
              {message}
            </p>
          )}

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border bg-card p-5">
              <Gift className="text-accent" size={24} />
              <p className="mt-6 text-3xl font-black">
                {profile.rewardsPoints}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
                Rewards Points
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-card p-5">
              <Crown className="text-accent" size={24} />
              <p className="mt-6 text-3xl font-black">
                {profile.lifetimePoints}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
                Lifetime Points
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-card p-5">
              <MapPin className="text-accent" size={24} />
              <p className="mt-6 text-3xl font-black">
                {profile.zipCode || "---"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
                Shipping Zip
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      <OrderHistory />
      <div className="mx-auto max-w-7xl px-5 py-8"><Link href="/jersey-studio" className="inline-block rounded-xl border border-border bg-card px-6 py-4 font-bold">Design a jersey & track your submissions →</Link></div>
    </div>
  );
}
