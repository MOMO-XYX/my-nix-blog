// src/components/mdx/DynamicComponents.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// 1. 在这里定义 Loading UI
const LoadingPlaceholder = ({ height = 'h-48' }: { height?: string }) => (
  <div className={`w-full ${height} bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-400`}>
    加载交互组件...
  </div>
);

// 2. 导出动态组件 (SSR: false)
// 注意：这里使用相对路径 import，确保 SortingVisualizer.tsx 和 ActivationPlayground.tsx 在同级目录
export const SortingVisualizer = dynamic(
  () => import('./SortingVisualizer'),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="h-40" />
  }
);

export const ActivationPlayground = dynamic(
  () => import('./ActivationPlayground'),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="h-64" />
  }
);