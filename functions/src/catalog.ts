export type Variant = {
  variantKey: string;
  sku?: string;
  optionValues: Record<string, string>;
  stock: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
};

export function sameOptions(a: Record<string, string>, b: Record<string, string>) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key]);
}

export function selectedVariant(variants: Variant[], options: Record<string, string>) {
  return variants.find(variant => sameOptions(variant.optionValues || {}, options));
}

export function canPurchase(variant: Variant, quantity: number) {
  return Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 999 &&
    (variant.trackInventory === false || variant.allowBackorder === true || variant.stock >= quantity);
}
