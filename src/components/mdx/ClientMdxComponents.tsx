// src/components/mdx/ClientMdxComponents.tsx
'use client'; // 👈 这一行至关重要！

import dynamic from 'next/dynamic';
import React from 'react';

// 定义加载时的占位符
const LoadingSkeleton = ({ height }: { height: string }) => (
  <div className={`w-full ${height} bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-400 my-8`}>
    Loading Component...
  </div>
);

// 1. 在这里定义 SortingVisualizer
// 注意：路径是 './SortingVisualizer'，因为它们在同一个文件夹下
export const SortingVisualizer = dynamic(
  () => import('./SortingVisualizer'),
  { 
    ssr: false,
    loading: () => <LoadingSkeleton height="h-48" />
  }
);

// 2. 在这里定义 ActivationPlayground
export const ActivationPlayground = dynamic(
  () => import('./ActivationPlayground'),
  { 
    ssr: false,
    loading: () => <LoadingSkeleton height="h-64" />
  }
);