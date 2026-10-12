export type CartItem = {
  variantKey?: string;
  sku?: string;
  inventoryId?: string;
  trackInventory?: boolean;
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  options: Record<string, string>;
  shippingWeight?: number;
  shippingWeightUnit?: string;
};
