import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
async function getPost(slug: string) {
  const snapshot = await adminDb.collection('blogPosts').where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0].data();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return { title: post?.title || 'Journal Post Not Found', description: post?.excerpt || '',
    ...(post?.coverUrl ? { openGraph: { images: [post.coverUrl], type: 'article' as const } } : {}) };
}
export default async function BlogPostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <main className="mx-auto max-w-4xl px-5 py-20 text-foreground">
    <Link href="/blog" className="text-accent">Back to Journal</Link>
    <p className="mt-8 uppercase text-muted">{post.category}</p>
    <h1 className="mt-4 text-4xl font-black uppercase md:text-6xl">{post.title}</h1>
    <p className="my-6 text-muted">{post.author} · {post.readMinutes || 3} min read</p>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {post.coverUrl && <img src={post.coverUrl} alt={post.title} className="mb-8 w-full rounded-2xl" />}
    <p className="mb-8 text-xl text-muted">{post.excerpt}</p>
    <article className="whitespace-pre-wrap text-base leading-8">{post.content}</article>
    <Link href="/shop" className="mt-12 inline-block rounded-full bg-accent px-6 py-3 font-bold">Shop the Drop</Link>
  </main>;
}
