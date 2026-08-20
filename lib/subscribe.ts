import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

function safeEmailId(email: string) {
  return email.trim().toLowerCase().replace(/\./g, "_");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function welcomeEmailHtml(email: string) {
  return `
    <div style="background:#050505;color:#f4f1ea;padding:32px;font-family:Arial,Helvetica,sans-serif;">
      <h1>Welcome To The Movement.</h1>
      <p>You’re officially on the Nurnrebel / XNX list.</p>
      <p>Early drops, stories, movement updates, and exclusive releases are coming.</p>
      <a href="https://nurnrebel.com/shop">Shop The Message</a>
      <p>Sent to ${email}</p>
    </div>
  `;
}

export async function subscribeEmail(email: string, source = "website") {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    throw new Error("Enter a valid email.");
  }

  const subscriberId = safeEmailId(cleanEmail);

  await setDoc(
    doc(db, "emailSubscribers", subscriberId),
    {
      email: cleanEmail,
      isActive: true,
      source,
      sources: {
        [source]: true,
      },
      subscribedAt: serverTimestamp(),
      lastSignupAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await addDoc(collection(db, "mail"), {
    to: [cleanEmail],
    message: {
      subject: "Welcome to Nurnrebel / XNX",
      html: welcomeEmailHtml(cleanEmail),
      text: "Welcome to Nurnrebel / XNX. You’re on the list.",
    },
    metadata: {
      type: "welcome_email",
      source,
      subscriberId,
    },
    createdAt: serverTimestamp(),
  });
}