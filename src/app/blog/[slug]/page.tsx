import FractalTree from '@/components/FractalTree'; 
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import React from 'react';

// 1. 定义 PageProps 类型
interface PageProps {
  params: Promise<{ slug: string }>;
}

// 2. (新增) 动态生成 SEO 元数据 (Browser Tab Title)
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  // 简单查一下标题，不用查 content 以节省流量
  const result = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
    
  const post = result[0];

  if (!post) {
    return { title: '文章不存在' };
  }

  return {
    title: `${post.title} | 我的 Nix 博客`,
    description: `阅读关于 ${post.title} 的内容`,
  };
}

// 3. 优化组件类型，去除 'any'
const components = {
  // 使用 React.ComponentProps 获得准确的 HTML 属性类型
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-indigo-600 border-b pb-2" />
  ),
  // 自定义 Alert 组件
  Alert: ({ children, type = 'info' }: { children: React.ReactNode, type?: 'info' | 'warn' }) => (
    <div className={`p-4 my-4 border-l-4 rounded bg-opacity-10 ${
      type === 'warn' 
        ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
        : 'bg-blue-50 border-blue-500 text-blue-800'
    }`}>
      <strong className="block mb-1 font-bold">{type === 'warn' ? '⚠️ 注意' : 'ℹ️ 提示'}</strong>
      {children}
    </div>
  ),
  FractalTree: FractalTree,  
};

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  // 查库
  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  const post = result[0];

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-6 font-sans">
      {/* 顶部导航 */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span> 返回文章列表
        </Link>
      </nav>

      {/* 头部信息 */}
      <header className="mb-10 text-center border-b pb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          {/* 处理日期可能为空的情况 */}
          <time>{post.createdAt ? post.createdAt.toLocaleDateString() : '未知日期'}</time>
          <span>•</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
            {post.slug}
          </span>
        </div>
      </header>

      {/* MDX 内容渲染区 */}
      <div className="prose prose-lg prose-slate mx-auto">
        {/* 
            source 必须是 string。
            虽然 schema 定义 content 是 notNull，但为了保险起见，给个空字符串默认值 
        */}
        <MDXRemote 
          source={post.content || ''} 
          components={components} 
        />
      </div>
    </article>
  );
}