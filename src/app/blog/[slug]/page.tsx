import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// 1. 引入 dynamic 用于动态加载组件
import dynamic from 'next/dynamic';

// 数据库相关
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// MDX 渲染器
import { MDXRemote } from 'next-mdx-remote/rsc';

// 普通组件可以保持静态引入 (假设 FractalTree 支持 SSR，如果报错也请改为 dynamic)
import FractalTree from '@/components/FractalTree'; // 注意路径，确认文件位置

// -----------------------------------------------------------------------------
// 2.【关键修改】使用 dynamic 导入交互式组件，并禁用 SSR
// -----------------------------------------------------------------------------

// 排序可视化组件
const SortingVisualizer = dynamic(
  () => import('@/components/mdx/SortingVisualizer'),
  { 
    ssr: false, // 禁用服务端渲染，解决 "window is not defined" 和 Hydration 错误
    loading: () => (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
        加载可视化组件...
      </div>
    )
  }
);

// 激活函数组件 (使用了 Recharts)
const ActivationPlayground = dynamic(
  () => import('@/components/mdx/ActivationPlayground'),
  { 
    ssr: false, // Recharts 不支持 SSR，必须禁用
    loading: () => (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
        加载图表...
      </div>
    )
  }
);

// -----------------------------------------------------------------------------

// 定义 PageProps 类型
interface PageProps {
  params: Promise<{ slug: string }>;
}

// 动态生成 SEO 元数据
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  // 解码 slug，防止中文乱码导致查不到
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
    description: `阅读关于 ${post.title} 的内容`,
  };
}

// 3. 注册 MDX 组件
const components = {
  // 使用 React.ComponentProps 获得准确的 HTML 属性类型
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-gray-700 pb-2" />
  ),
  // 自定义 Alert 组件
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
  // 注册我们的自定义组件
  FractalTree,  
  SortingVisualizer, 
  ActivationPlayground, 
};

export default async function BlogPost({ params }: PageProps) {
  // 4. 等待 params 解析 (Next.js 15 要求)
  const { slug } = await params;
  
  // 5.【重要】解码 URL (例如: "%E5%86%92%E6%B3%A1" -> "冒泡")
  const decodedSlug = decodeURIComponent(slug);

  // 查库
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
      {/* 顶部导航 */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span> 返回文章列表
        </Link>
      </nav>

      {/* 头部信息 */}
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
          {/* 这里可以加回之前的阅读量组件 */}
        </div>
      </header>

      {/* MDX 内容渲染区 */}
      <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
        <MDXRemote 
          source={post.content || ''} 
          components={components} 
        />
      </div>
    </article>
  );
}