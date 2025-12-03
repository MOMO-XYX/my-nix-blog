'use client';

import React, { useState, useEffect } from 'react';

// 简单的冒泡排序生成器，用于逐步生成快照
function* bubbleSortSteps(initialArr: number[]) {
  const arr = [...initialArr];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Yield 当前状态：正在比较的两个索引，以及当前数组
      yield { compare: [j, j + 1], arr: [...arr], swap: false };
      
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        // Yield 交换后的状态
        yield { compare: [j, j + 1], arr: [...arr], swap: true };
      }
    }
  }
  yield { compare: [], arr: [...arr], swap: false, finished: true };
}

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 初始化随机数组
  const resetArray = () => {
    const newArr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 5);
    setArray(newArr);
    setComparing([]);
    setIsFinished(false);
    setIsSorting(false);
  };

  useEffect(() => {
    resetArray();
  }, []);

  const startSorting = async () => {
    if (isSorting || isFinished) return;
    setIsSorting(true);

    const sorter = bubbleSortSteps(array);
    
    for (const step of sorter) {
      if (!step) break;
      setArray(step.arr);
      setComparing(step.compare || []);
      
      // 控制动画速度
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setComparing([]);
    setIsSorting(false);
    setIsFinished(true);
  };

  return (
    <div className="my-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 m-0">冒泡排序可视化</h3>
        <div className="space-x-2">
          <button
            onClick={resetArray}
            disabled={isSorting}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded disabled:opacity-50"
          >
            重置
          </button>
          <button
            onClick={startSorting}
            disabled={isSorting || isFinished}
            className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
          >
            {isSorting ? '排序中...' : isFinished ? '完成' : '开始排序'}
          </button>
        </div>
      </div>

      {/* 柱状图区域 */}
      <div className="flex items-end justify-center h-48 gap-1">
        {array.map((value, idx) => {
          // 判断颜色：正在比较(黄色)，正在交换(红色)，默认(蓝色)
          let bgColor = 'bg-blue-500 dark:bg-blue-600';
          if (comparing.includes(idx)) {
            bgColor = 'bg-yellow-500';
          }
          if (isFinished) {
            bgColor = 'bg-green-500';
          }

          return (
            <div
              key={idx}
              className={`w-3 rounded-t-sm transition-colors duration-100 ${bgColor}`}
              style={{ height: `${value * 1.5}%` }}
              title={value.toString()}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-gray-500 mt-4">
        黄色代表正在比较，高度代表数值大小
      </p>
    </div>
  );
}