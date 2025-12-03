'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

type ActivationType = 'sigmoid' | 'relu' | 'tanh';

export default function ActivationPlayground() {
  const [inputValue, setInputValue] = useState(0);
  const [type, setType] = useState<ActivationType>('sigmoid');

  // 生成图表数据
  const generateData = (funcType: ActivationType) => {
    const data = [];
    for (let i = -6; i <= 6; i += 0.5) {
      let y = 0;
      if (funcType === 'sigmoid') y = 1 / (1 + Math.exp(-i));
      else if (funcType === 'relu') y = Math.max(0, i);
      else if (funcType === 'tanh') y = Math.tanh(i);
      data.push({ x: i, y: Number(y.toFixed(3)) });
    }
    return data;
  };

  // 计算当前点的 Y 值
  const calculateY = (x: number, funcType: ActivationType) => {
    if (funcType === 'sigmoid') return 1 / (1 + Math.exp(-x));
    if (funcType === 'relu') return Math.max(0, x);
    if (funcType === 'tanh') return Math.tanh(x);
    return 0;
  };

  const currentY = calculateY(inputValue, type);
  const data = generateData(type);

  return (
    <div className="my-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 m-0">激活函数可视化</h3>
      
      <div className="flex gap-4 mb-6">
        {(['sigmoid', 'relu', 'tanh'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 text-sm rounded capitalize ${
              type === t 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="x" type="number" domain={[-6, 6]} allowDataOverflow={false} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={3} dot={false} />
            {/* 动态显示当前点 */}
            <ReferenceDot x={Number(inputValue)} y={currentY} r={6} fill="#ef4444" stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
          <span>Input (x): <strong>{inputValue}</strong></span>
          <span>Output (y): <strong>{currentY.toFixed(4)}</strong></span>
        </div>
        <input
          type="range"
          min="-6"
          max="6"
          step="0.1"
          value={inputValue}
          onChange={(e) => setInputValue(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
        />
      </div>
    </div>
  );
}