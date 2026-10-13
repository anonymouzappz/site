"use client";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, limit, query, where } from "firebase/firestore";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import ProductGallery from "@/components/shop/ProductGallery";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { selectedVariant, canPurchase, sameOptions, type Variant } from "@/functions/src/catalog";

const CART_KEY = "nurnrebel_cart";

type StoredCartItem = {
  variantKey?: string;
  sku?: string;
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

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number;
  categoryName: string;
  imageUrls: string[];
  tags: string[];
  options: Record<string, string[]>;
  stock: number;
  variants: Variant[];
  shippingWeight?: number;
  shippingWeightUnit?: string;
  isActive: boolean;
  isFeatured?: boolean;
};

export default function ProductDetailsClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

        const q = query(
          collection(db, "products"),
          where("slug", "==", slug),
          where("isActive", "==", true),
          limit(1),
        );

        return onSnapshot(q, (snap) => {
        setLoading(false);

        if (snap.empty) {
          setProduct(null);
          return;
        }

        const doc = snap.docs[0];
        const data = doc.data();

        const loadedProduct: Product = {
          id: doc.id,
          name: String(data.name || ""),
          slug: String(data.slug || slug),
          description: String(data.description || ""),
          price: Number(data.price || 0),
          comparePrice: Number(data.comparePrice || 0),
          categoryName: String(data.categoryName || ""),
          imageUrls: Array.isArray(data.imageUrls)
            ? data.imageUrls.map(String)
            : [],
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          options: data.options || {},
          stock: Number(data.stock || 0),
          variants: Array.isArray(data.variants) ? data.variants : [],
          shippingWeight: Number(data.shippingWeight || 0),
          shippingWeightUnit: String(data.shippingWeightUnit || "oz"),
          isActive: Boolean(data.isActive),
          isFeatured: Boolean(data.isFeatured),
        };

        setProduct(loadedProduct);
      }, (error) => { setLoadError(error.message); setLoading(false); });
  }, [slug]);

  const variant = product ? selectedVariant(product.variants, selectedOptions) : undefined;
  const available = variant || (product && !product.variants.length ? { variantKey: "default", optionValues: selectedOptions, stock: product.stock } : undefined);
  const purchaseLimit = available && (available.trackInventory === false || available.allowBackorder) ? 999 : Math.max(0, available?.stock || 0);

  const hasDiscount = useMemo(() => {
    if (!product) return false;
    return product.comparePrice > product.price;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !hasDiscount) return 0;

    return Math.round(
      ((product.comparePrice - product.price) / product.comparePrice) * 100,
    );
  }, [product, hasDiscount]);

  function selectOption(optionName: string, value: string) {
    setQuantity(1);
    setSelectedOptions((current) => ({
      ...current,
      [optionName]: value,
    }));
  }

  function addToCart() {
    if (!product) return;

    const requiredOptions = Object.entries(product.options || {}).filter(
      ([, values]) => Array.isArray(values) && values.length > 0,
    );

    const missingOption = requiredOptions.find(
      ([optionName]) => !selectedOptions[optionName],
    );

    if (missingOption) {
      alert(`Please select ${missingOption[0]}.`);
      return;
    }

    if (!available || !canPurchase(available, quantity)) {
      alert("This selection is unavailable or the requested quantity exceeds stock.");
      return;
    }

    const cartItem: StoredCartItem = {
      variantKey: available.variantKey,
      sku: variant?.sku || "",
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrls[0] || "",
      quantity,
      options: { ...selectedOptions },
      shippingWeight: product.shippingWeight || 0,
      shippingWeightUnit: product.shippingWeightUnit || "oz",
    };

    try {
      const saved = localStorage.getItem(CART_KEY);

      const currentCart: StoredCartItem[] = saved
        ? (JSON.parse(saved) as StoredCartItem[])
        : [];

      const existingIndex = currentCart.findIndex(
        (item) =>
          item.productId === product.id &&
          sameOptions(item.options || {}, selectedOptions),
      );

      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity = Math.min(
          currentCart[existingIndex].quantity + quantity,
          purchaseLimit,
        );
      } else {
        currentCart.push({ ...cartItem, quantity: Math.min(quantity, purchaseLimit) });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(currentCart));

      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: currentCart,
        }),
      );

      const goToCart = window.confirm(
        `${product.name} was added to your cart.\n\nWould you like to go to your cart?`,
      );

      if (goToCart) {
        window.location.assign("/cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add this item to your cart.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20 text-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="h-[600px] animate-pulse rounded-[2rem] border border-border bg-card/60" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen px-6 py-20 text-foreground">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card/70 p-10 text-center backdrop-blur-xl">
          <h1 className="text-4xl font-black uppercase">Product Not Found</h1>
          <p className="mt-4 text-muted">
            {loadError ? "Unable to load this product. Please try again." : "This product may be unavailable or inactive."}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-white"
          >
            Back To Shop
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 text-foreground sm:px-6 lg:py-16">
      <section className="mx-auto max-w-7xl">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back To Shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <ProductGallery key={product.id} images={product.imageUrls} name={product.name} featured={product.isFeatured} discount={hasDiscount ? discountPercent : undefined}/>

          <div className="rounded-[2rem] border border-border bg-card/70 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex flex-wrap gap-2">
              {product.categoryName && (
                <span className="rounded-full border border-border bg-background/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                  {product.categoryName}
                </span>
              )}

              {(available ? purchaseLimit > 0 : product.variants.some(variant => canPurchase(variant, 1))) ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                  <Check size={13} />
                  In Stock
                </span>
              ) : (
                <span className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-3xl font-black">${product.price.toFixed(2)}</p>

              {hasDiscount && (
                <p className="pb-1 text-lg font-bold text-muted line-through">
                  ${product.comparePrice.toFixed(2)}
                </p>
              )}
            </div>

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted sm:text-base">
              {product.description}
            </p>

            {Object.entries(product.options).length > 0 && (
              <div className="mt-8 space-y-6">
                {Object.entries(product.options).map(([optionName, values]) => (
                  <div key={optionName}>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                      {optionName}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const active = selectedOptions[optionName] === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectOption(optionName, value)}
                            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                              active
                                ? "border-accent bg-accent text-white"
                                : "border-border bg-background/60 text-foreground hover:border-accent"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border border-border bg-background/60">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-12 items-center justify-center"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.max(1, Math.min(purchaseLimit, q + 1)))
                  }
                  className="flex h-12 w-12 items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={!available || !canPurchase(available, quantity)}
                className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-accent px-6 text-xs font-black uppercase tracking-[0.25em] text-white shadow-[0_0_35px_rgba(102,120,74,0.35)] transition disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag size={16} />
                  {!available ? "Select Options" : purchaseLimit <= 0 ? "Sold Out" : "Add To Cart"}
                </span>
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <Truck size={20} className="mb-3 text-accent" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Shipping Ready
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Weight: {product.shippingWeight || 0}{" "}
                  {product.shippingWeightUnit || "oz"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <Sparkles size={20} className="mb-3 text-accent" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Statement Wear
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Built for awareness, rebellion, and self-expression.
                </p>
              </div>
            </div>

            {product.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
