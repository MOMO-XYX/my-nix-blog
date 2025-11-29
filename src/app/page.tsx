import { notFound } from 'next/navigation';
import { redis } from '@/lib/redis'; // 👈 引入 redis
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
// 辅助函数：去除 Markdown 符号
function stripMarkdown(content: string) {
  if (!content) return '';
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*`_~\[\]]/g, '')
    .replace(/\(https?:\/\/[^\)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export default async function Home() {
  // 1. 先从 Postgres 数据库查询所有文章
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  // 2. 🔥 关键步骤：并行查询 Redis 获取每一篇文章的阅读量
  // 我们使用 Promise.all 并发处理，速度非常快
  const postsWithViews = await Promise.all(
    allPosts.map(async (post) => {
      // 这里的 key 必须和详情页里的保持一致：`post:views:${slug}`
      const views = await redis.get(`post:views:${post.slug}`);
      return {
        ...post,
        // 如果 Redis 里没数据（新文章），默认为 0
        views: views ? parseInt(views) : 0, 
      };
    })
  );

  return (
    <main className="max-w-4xl mx-auto p-10 font-sans">
      <header className="mb-10 flex justify-between items-center border-b pb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          我的 Nix 极客博客
        </h1>
        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          文章数: {postsWithViews.length}
        </span>
      </header>

      {postsWithViews.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-xl text-gray-500 mb-2">数据库是空的 🍃</p>
          <p className="text-sm text-gray-400">
            请使用 Drizzle Studio 添加第一篇文章
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* 👇 这里遍历的是包含了 views 的新数组 */}
          {postsWithViews.map((post) => (
            <article 
              key={post.id} 
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-white flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-indigo-600 transition-colors cursor-pointer block"
                  >
                    {post.title}
                  </Link>
                </h2>

                {post.published ? (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded">已发布</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">草稿</span>
                )}
              </div>
              
              <p className="text-sm text-gray-400 font-mono mb-4">/{post.slug}</p>
              
              <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4">
                {stripMarkdown(post.content)}
              </p>
              
              {/* 底部信息栏：日期 和 阅读量 */}
              <div className="mt-auto flex justify-between items-center text-xs border-t pt-4">
                {/* 左侧：阅读量 */}
                <span className="flex items-center gap-1 text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
                  👁️ {post.views} 阅读
                </span>

                {/* 右侧：日期 */}
                <span className="text-gray-400">
                  发布于: {post.createdAt ? post.createdAt.toLocaleDateString() : '未知日期'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}