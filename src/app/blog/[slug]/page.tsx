// src/app/blog/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ⬇️【修改点 1】从刚才新建的 ClientMdxComponents 导入组件
import { SortingVisualizer, ActivationPlayground } from '@/components/mdx/ClientMdxComponents';

// ⬇️【修改点 2】暂时注释掉找不到的 FractalTree，防止构建失败
// import FractalTree from '@/components/FractalTree'; 

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, decodedSlug),
    columns: { title: true }
  });

  if (!post) return { title: '文章不存在' };
  return { title: `${post.title} | Tech Blog` };
}

const components = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-400 border-b pb-2" />
  ),
  Alert: ({ children, type = 'info' }: { children: React.ReactNode, type?: 'info' | 'warn' }) => (
    <div className={`p-4 my-4 border-l-4 rounded bg-opacity-10 ${
      type === 'warn' 
        ? 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:text-yellow-200 dark:bg-yellow-900/20' 
        : 'bg-blue-50 border-blue-500 text-blue-800 dark:text-blue-200 dark:bg-blue-900/20'
    }`}>
      <strong className="block mb-1 font-bold">{type === 'warn' ? '⚠️ 注意' : 'ℹ️ 提示'}</strong>
      {children}
    </div>
  ),
  // FractalTree, // 暂时注释
  SortingVisualizer, 
  ActivationPlayground, 
};

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, decodedSlug)
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-6 font-sans">
      <nav className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
          ← 返回文章列表
        </Link>
      </nav>

      <header className="mb-10 text-center border-b pb-10 border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        <div className="text-sm text-gray-500">
           {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown'}
        </div>
      </header>

      <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
        <MDXRemote source={post.content || ''} components={components} />
      </div>
    </article>
  );
}