import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export { stripeWebhook } from "./stripeWebhook";
export { cleanupCheckouts } from './checkoutCleanup';
