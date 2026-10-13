import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

export { stripeWebhook } from "./stripeWebhook";
export { cleanupCheckouts } from './checkoutCleanup';
