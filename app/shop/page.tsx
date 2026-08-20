"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";

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
  shippingWeight: number;
  shippingWeightUnit: string;
  isActive: boolean;
  isFeatured: boolean;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function cleanOptionName(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("isActive", "==", true),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          const rawOptions =
            data.options && typeof data.options === "object"
              ? data.options
              : {};

          const safeOptions: Record<string, string[]> = {};

          Object.entries(rawOptions).forEach(([key, value]) => {
            safeOptions[key] = Array.isArray(value)
              ? value.map(String)
              : [];
          });

          return {
            id: doc.id,
            name: String(data.name || "Unnamed Product"),
            slug: String(data.slug || doc.id),
            description: String(data.description || ""),
            price: Number(data.price || 0),
            comparePrice: Number(data.comparePrice || 0),
            categoryName: String(data.categoryName || "Collection"),
            imageUrls: Array.isArray(data.imageUrls)
              ? data.imageUrls.map(String)
              : [],
            tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
            options: safeOptions,
            stock: Number(data.stock || 0),
            shippingWeight: Number(data.shippingWeight || 0),
            shippingWeightUnit: String(data.shippingWeightUnit || "oz"),
            isActive: Boolean(data.isActive ?? true),
            isFeatured: Boolean(data.isFeatured ?? false),
          };
        });

        items.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        });

        setProducts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Products load error:", error);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const filters = useMemo(() => {
    const categories = products
      .map((product) => product.categoryName)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(categories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") return products;

    return products.filter((product) => product.categoryName === activeFilter);
  }, [activeFilter, products]);

  const featuredCount = useMemo(() => {
    return products.filter((product) => product.isFeatured).length;
  }, [products]);

  const inStockCount = useMemo(() => {
    return products.filter((product) => product.stock > 0).length;
  }, [products]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-accent"
          >
            Nurnrebel Shop
          </motion.p>

          <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.9] md:text-8xl">
                Shop The
                <span className="block text-accent">Message</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
                Statement clothing for awareness, identity, rebellion, and
                mindset. Designed to say what words sometimes cannot.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-3 sm:grid-cols-3 md:min-w-[430px]"
            >
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-black">{products.length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted">
                  Products
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-black">{inStockCount}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted">
                  In Stock
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-black">{featuredCount}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted">
                  Featured
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-wrap gap-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-xs font-black uppercase tracking-widest text-muted">
              <SlidersHorizontal size={15} />
              Filter
            </div>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-5 py-2 text-xs font-black uppercase tracking-widest transition ${
                  activeFilter === filter
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted hover:border-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
            {activeFilter === "All" ? "All Products" : activeFilter} /{" "}
            {filteredProducts.length} Pieces
          </p>

          <p className="text-xs font-black uppercase tracking-[0.35em] text-muted">
            Wear Your Mindset
          </p>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-sm font-black uppercase tracking-[0.3em] text-muted">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-sm font-black uppercase tracking-[0.3em] text-muted">
            No products available yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const imageUrl = product.imageUrls[0] || "";
              const inStock = product.stock > 0;

              const primaryTag =
                product.tags[0] ||
                (product.isFeatured ? "Featured" : product.categoryName);

              const optionEntries = Object.entries(product.options || {}).filter(
                ([, values]) => Array.isArray(values) && values.length > 0,
              );

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="group block h-full overflow-hidden rounded-[2rem] border border-border bg-card"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#181818] via-[#111111] to-[#202020]">
                      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent backdrop-blur">
                            <Sparkles size={12} />
                            Featured
                          </span>
                        )}

                        <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted backdrop-blur">
                          {primaryTag}
                        </span>
                      </div>

                      <div className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card p-2 text-muted opacity-0 transition group-hover:opacity-100">
                        <ArrowRight size={15} />
                      </div>

                      {!inStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-red-300">
                            Sold Out
                          </span>
                        </div>
                      )}

                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-8 text-center">
                          <div>
                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-white/[0.04]">
                              <ShoppingBag className="text-accent" size={34} />
                            </div>

                            <p className="text-xs font-black uppercase tracking-[0.35em] text-muted/60">
                              Product Image
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
                          {product.categoryName}
                        </p>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                            inStock
                              ? "border-border text-muted"
                              : "border-red-500/40 text-red-400"
                          }`}
                        >
                          {inStock ? `${product.stock} Left` : "Out"}
                        </span>
                      </div>

                      <h2 className="mt-3 min-h-14 text-lg font-black uppercase leading-tight">
                        {product.name}
                      </h2>

                      {optionEntries.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {optionEntries.slice(0, 2).map(([key, values]) => (
                            <div key={key}>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted">
                                {cleanOptionName(key)}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {values.slice(0, 4).map((value) => (
                                  <span
                                    key={value}
                                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted"
                                  >
                                    {value}
                                  </span>
                                ))}

                                {values.length > 4 && (
                                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted">
                                    +{values.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xl font-black">
                            {money(product.price)}
                          </p>

                          {product.comparePrice > product.price && (
                            <p className="text-xs font-bold text-muted line-through">
                              {money(product.comparePrice)}
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                          View
                        </span>
                      </div>

                      {product.shippingWeight > 0 && (
                        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-[10px] font-black uppercase tracking-widest text-muted">
                          <Package size={14} />
                          Ships at {product.shippingWeight}{" "}
                          {product.shippingWeightUnit}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}