// src/app/blog/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

// 数据库相关
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 1. 从新创建的文件导入动态组件
import { SortingVisualizer, ActivationPlayground } from '@/components/mdx/DynamicComponents';

// 2. 暂时注释掉报错的 FractalTree，直到确认文件位置
// import FractalTree from '@/components/FractalTree'; 

// 定义 PageProps 类型
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug); 
  
  const result = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.slug, decodedSlug))
    .limit(1);
    
  const post = result[0];

  if (!post) {
    return { title: '文章不存在' };
  }

  return {
    title: `${post.title} | 我的 Nix 博客`,
  };
}

// 3. 注册组件
const components = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-gray-700 pb-2" />
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

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, decodedSlug))
    .limit(1);
    
  const post = result[0];

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-6 font-sans">
      <nav className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span> 返回文章列表
        </Link>
      </nav>

      <header className="mb-10 text-center border-b border-gray-200 dark:border-gray-700 pb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <time>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '未知日期'}</time>
          <span>•</span>
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">
            {post.slug}
          </span>
        </div>
      </header>

      <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
        <MDXRemote 
          source={post.content || ''} 
          components={components} 
        />
      </div>
    </article>
  );
}