import { FieldValue } from 'firebase-admin/firestore';
import type { Firestore, DocumentReference, DocumentData } from 'firebase-admin/firestore';
import { canPurchase, selectedVariant, sameOptions, Variant } from './catalog';
import type { CartItem } from './types/cart';

type Data = DocumentData;
type Row = { ref: DocumentReference; data: Data };
export class CartError extends Error {}

// Reserve available stock before creating a payment URL. All reads precede writes.
export async function reserveCart(db: Firestore, checkoutRef: DocumentReference, raw: CartItem[], customerId: string) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 100) throw new CartError('Cart must contain 1–100 items.');
  for (const item of raw) {
    if (!item || typeof item.productId !== 'string' || !item.productId || item.productId.includes('/') ||
        !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 999) {
      throw new CartError('Invalid product or quantity.');
    }
  }
  return db.runTransaction(async tx => {
    const products = new Map<string, Row>();
    const inventory = new Map<string, Row[]>();
    for (const id of new Set(raw.map(item => item.productId))) {
      const ref = db.collection('products').doc(id);
      const product = await tx.get(ref);
      if (!product.exists || product.data()?.isActive !== true) throw new CartError('A product is no longer available.');
      products.set(id, { ref, data: product.data()! });
      const rows = await tx.get(db.collection('inventory').where('productId', '==', id));
      inventory.set(id, rows.docs.map(doc => ({ ref: doc.ref, data: doc.data() })));
    }
    const items: CartItem[] = [];
    const changedRows = new Map<string, Row>();
    for (const input of raw) {
      const product = products.get(input.productId)!;
      const data = product.data;
      const options = input.options || {};
      if (typeof options !== 'object' || Array.isArray(options)) throw new CartError('Invalid options.');
      const groups = Object.entries(data.options || {}) as [string, string[]][];
      if (Object.keys(options).length !== groups.filter(([, values]) => values.length).length ||
          groups.some(([key, values]) => values.length && !values.includes(options[key]))) {
        throw new CartError(`Choose valid options for ${data.name}.`);
      }
      const variants: Variant[] = Array.isArray(data.variants) ? data.variants : [];
      const variant = selectedVariant(variants, options);
      if (variants.length && !variant) throw new CartError(`This variant of ${data.name} is unavailable.`);
      const rows = inventory.get(input.productId)!;
      const matches = rows.filter(row => sameOptions(row.data.optionValues || {}, options) ||
        (variant && row.data.variantKey === variant.variantKey));
      if (rows.length && matches.length !== 1) throw new CartError(`Inventory for ${data.name} needs admin review.`);
      const row = matches[0];
      if (!row && (variants.length || groups.length)) throw new CartError(`Save ${data.name} in admin to initialize variant inventory.`);
      const stock = Number(row ? row.data.stockAvailable : data.stock || 0);
      const trackInventory = row ? row.data.trackInventory !== false : true;
      const allowBackorder = row?.data.allowBackorder === true;
      if (!canPurchase({ variantKey: '', optionValues: options, stock, trackInventory, allowBackorder }, input.quantity)) {
        throw new CartError(`Not enough stock for ${data.name}${variant?.sku ? ` (${variant.sku})` : ''}.`);
      }
      const price = Number(data.price);
      if (!Number.isFinite(price) || price <= 0) throw new CartError('A product has an invalid price.');
      const canonical: CartItem = {
        productId: input.productId, name: String(data.name), slug: String(data.slug || ''), price: Math.round(price * 100) / 100,
        imageUrl: data.imageUrls?.[0] || '', quantity: input.quantity, options,
        variantKey: variant?.variantKey || row?.data.variantKey || 'default',
        sku: String(row?.data.sku || variant?.sku || ''), inventoryId: row?.ref.id || '',
        trackInventory, shippingWeight: Number(data.shippingWeight || 0),
        shippingWeightUnit: String(data.shippingWeightUnit || 'oz'),
      };
      const existing = items.find(item => item.productId === canonical.productId && item.variantKey === canonical.variantKey);
      if (existing) existing.quantity += canonical.quantity; else items.push(canonical);
      if (row) {
          if (trackInventory) row.data.stockAvailable = stock - input.quantity;
          row.data.reservedStock = Number(row.data.reservedStock || 0) + input.quantity;
          changedRows.set(row.ref.id, row);
      }
      if (trackInventory) {
        if (!row) data.stock = stock - input.quantity;
        if (variant) variant.stock = stock - input.quantity;
      }
    }
    for (const row of changedRows.values()) tx.update(row.ref, {
      stockAvailable: row.data.stockAvailable, reservedStock: row.data.reservedStock, updatedAt: FieldValue.serverTimestamp(),
    });
    for (const [id, product] of products) {
      const rows = inventory.get(id)!;
      tx.update(product.ref, {
        stock: rows.length ? rows.reduce((sum, row) => sum + Number(row.data.stockAvailable || 0), 0) : product.data.stock,
        ...(Array.isArray(product.data.variants) ? { variants: product.data.variants } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    tx.set(checkoutRef, { items, customerId, status: 'reserved', inventoryState: 'reserved',
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return items;
  });
}

// Payment, expiration and retry handling share the same atomic inventory transition.
export async function finishCheckout(db: Firestore, checkoutId: string, order?: { id: string; data: Data }) {
  const checkoutRef = db.collection('checkout_sessions').doc(checkoutId);
  await db.runTransaction(async tx => {
    const checkout = await tx.get(checkoutRef);
    if (!checkout.exists) throw new Error('Checkout not found.');
    const data = checkout.data()!;
    const orderRef = order ? db.collection('orders').doc(order.id) : null;
    if (orderRef && (await tx.get(orderRef)).exists) return;
    if (data.inventoryState !== 'reserved') {
      if (order && data.inventoryState !== 'sold') throw new Error('Checkout has no stock reservation.');
      return;
    }
    const items = data.items as CartItem[];
    const products = new Map<string, Row>();
    const rows = new Map<string, Row>();
    for (const item of items) {
      if (!products.has(item.productId)) {
        const ref = db.collection('products').doc(item.productId);
        const snap = await tx.get(ref);
        if (snap.exists) products.set(item.productId, { ref, data: snap.data()! });
      }
      if (item.inventoryId && !rows.has(item.inventoryId)) {
        const ref = db.collection('inventory').doc(item.inventoryId);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Reserved inventory was deleted.');
        rows.set(item.inventoryId, { ref, data: snap.data()! });
      }
    }
    for (const item of items) {
      const row = rows.get(item.inventoryId || '');
      const product = products.get(item.productId);
      if (row) {
        row.data.reservedStock = Math.max(0, Number(row.data.reservedStock || 0) - item.quantity);
        if (order) row.data.soldCount = Number(row.data.soldCount || 0) + item.quantity;
        else if (item.trackInventory) row.data.stockAvailable = Number(row.data.stockAvailable || 0) + item.quantity;
      }
      if (!order && item.trackInventory && product) {
        product.data.stock = Number(product.data.stock || 0) + item.quantity;
        const variant = selectedVariant(product.data.variants || [], item.options);
        if (variant) variant.stock = Number(variant.stock || 0) + item.quantity;
      }
      tx.set(db.collection('inventoryLogs').doc(`${checkoutId}_${item.inventoryId || item.productId}`), {
        inventoryId: item.inventoryId || '', productId: item.productId, variantKey: item.variantKey || 'default',
        type: order ? 'sale' : 'reservation_released', quantity: item.quantity,
        note: order ? `Order ${order.id}` : `Checkout ${checkoutId}`, createdAt: FieldValue.serverTimestamp(),
      });
    }
    for (const row of rows.values()) tx.update(row.ref, {
      stockAvailable: row.data.stockAvailable, reservedStock: row.data.reservedStock || 0,
      soldCount: row.data.soldCount || 0, updatedAt: FieldValue.serverTimestamp(),
    });
    for (const product of products.values()) tx.update(product.ref, {
      ...(!order ? { stock: product.data.stock, ...(Array.isArray(product.data.variants) ? { variants: product.data.variants } : {}) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (orderRef && order) tx.set(orderRef, { ...order.data, items, customerId: data.customerId || '', createdAt: FieldValue.serverTimestamp() });
    tx.update(checkoutRef, { status: order ? 'paid' : 'expired', inventoryState: order ? 'sold' : 'released',
      ...(order ? { orderId: order.id, paidAt: FieldValue.serverTimestamp() } : {}), updatedAt: FieldValue.serverTimestamp() });
  });
}
