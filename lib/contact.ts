import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function sendContactMessage(data: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const type = data.type.trim();
  const message = data.message.trim();

  if (!name) throw new Error("Enter your name.");
  if (!email || !email.includes("@")) throw new Error("Enter a valid email.");
  if (!message) throw new Error("Enter a message.");

  await addDoc(collection(db, "contactMessages"), {
    name,
    email,
    type,
    message,
    status: "new",
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}