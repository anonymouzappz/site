import type { MetadataRoute } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const siteUrl = "https://nurnrebel.com";

type FirestoreProduct = {
  slug?: string;
  updatedAt?: {
    toDate?: () => Date;
  };
  createdAt?: {
    toDate?: () => Date;
  };
};

async function getProductUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const q = query(
      collection(db, "products"),
      where("isActive", "==", true),
    );

    const snap = await getDocs(q);

    return snap.docs
      .map((doc) => {
        const data = doc.data() as FirestoreProduct;

        if (!data.slug) return null;

        const lastModified =
          data.updatedAt?.toDate?.() ||
          data.createdAt?.toDate?.() ||
          new Date();

        return {
          url: `${siteUrl}/product/${data.slug}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/movement`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/lookbook`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/cards`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/cards/spades`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${siteUrl}/cards/tonk`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
  ];

  const productPages = await getProductUrls();

  return [...staticPages, ...productPages];
}