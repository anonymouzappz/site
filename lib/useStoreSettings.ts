"use client";
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
export type StoreSettings = { announcement: string; pickupInstructions: string; pickupEnabled: boolean; deliveryEnabled: boolean; shippingEnabled: boolean };
export const defaultStoreSettings: StoreSettings = { announcement: '', pickupInstructions: 'Pickup details will be shared after payment.', pickupEnabled: true, deliveryEnabled: true, shippingEnabled: true };
export function useStoreSettings() {
  const [settings, setSettings] = useState(defaultStoreSettings);
  useEffect(() => onSnapshot(doc(db, 'storeSettings', 'public'), snapshot => {
    setSettings({ ...defaultStoreSettings, ...snapshot.data() });
  }, error => console.error('Store settings load failed', error)), []);
  return settings;
}
