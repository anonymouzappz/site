import type { Metadata } from "next";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductDetailsClient from "./ProductDetailsClient";

const siteUrl = "https://nurnrebel.com";
const defaultOgImage = `${siteUrl}/og-nurnrebel.png`;

type Props = {
  params: Promise<{ slug: string }>;
};

type ProductSeo = {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImage: string;
};

function toAbsoluteUrl(value: string) {
  const clean = value.trim();

  if (!clean) return defaultOgImage;

  if (clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean;
  }

  if (clean.startsWith("/")) {
    return `${siteUrl}${clean}`;
  }

  return `${siteUrl}/${clean}`;
}

function cleanDescription(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

async function getProductSeo(slug: string): Promise<ProductSeo | null> {
  try {
    const q = query(
      collection(db, "products"),
      where("slug", "==", slug),
      where("isActive", "==", true),
      limit(1),
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const data = snap.docs[0].data();

    const imageUrls = Array.isArray(data.imageUrls)
      ? data.imageUrls.map(String)
      : [];

    const seoKeywords = Array.isArray(data.seoKeywords)
      ? data.seoKeywords.map(String)
      : Array.isArray(data.tags)
        ? data.tags.map(String)
        : [];

    const rawImage =
      String(data.ogImage || "").trim() ||
      imageUrls[0] ||
      "/og-nurnrebel.png";

    return {
      name: String(data.name || "Nurnrebel Product"),
      description: String(data.description || ""),
      seoTitle: String(data.seoTitle || ""),
      seoDescription: String(data.seoDescription || ""),
      seoKeywords,
      ogImage: toAbsoluteUrl(rawImage),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductSeo(slug);

  if (!product) {
    const title = "Product Not Found | Nurnrebel aka XNX";
    const description = "This product could not be found.";

    return {
      title,
      description,
      alternates: {
        canonical: `/product/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/product/${slug}`,
        siteName: "Nurnrebel aka XNX",
        type: "website",
        images: [
          {
            url: defaultOgImage,
            width: 1200,
            height: 630,
            alt: "Nurnrebel aka XNX",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [defaultOgImage],
      },
    };
  }

  const title = product.seoTitle || `${product.name} | Nurnrebel aka XNX`;

  const description = cleanDescription(
    product.seoDescription ||
      product.description ||
      "Shop statement streetwear from Nurnrebel aka XNX.",
  );

  return {
    title,
    description,
    keywords: product.seoKeywords,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/product/${slug}`,
      siteName: "Nurnrebel aka XNX",
      type: "website",
      images: [
        {
          url: product.ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.ogImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  return <ProductDetailsClient slug={slug} />;
}