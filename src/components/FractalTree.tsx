'use client'; // 👈 必须标记为客户端组件

import { useEffect, useRef, useState } from 'react';

export default function FractalTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(9); // 控制递归深度
  const [angle, setAngle] = useState(20); // 控制分叉角度

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 递归绘制函数
    const drawTree = (x: number, y: number, len: number, angle: number, branchWidth: number) => {
      ctx.beginPath();
      ctx.save();
      ctx.strokeStyle = `hsl(${Math.random() * 60 + 100}, 100%, 50%)`; // 随机绿色系颜色
      ctx.fillStyle = `hsl(${Math.random() * 60 + 100}, 100%, 50%)`;
      ctx.lineWidth = branchWidth;
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      if (len < 10) {
        ctx.restore();
        return;
      }

      // 递归绘制左右分枝
      drawTree(0, -len, len * 0.75, angle - 25, branchWidth * 0.7); // 左枝
      drawTree(0, -len, len * 0.75, angle + 25, branchWidth * 0.7); // 右枝

      ctx.restore();
    };

    // 优化的递归函数：动态角度
    const drawDynamicTree = (startX: number, startY: number, len: number, angleOffset: number, branchWidth: number, currentDepth: number) => {
      ctx.beginPath();
      ctx.save();
      
      // 颜色随深度渐变：棕色 -> 绿色
      const hue = 30 + (10 - currentDepth) * 10; 
      ctx.strokeStyle = `hsl(${hue}, 70%, ${currentDepth * 5 + 20}%)`;
      ctx.lineWidth = branchWidth;
      
      ctx.translate(startX, startY);
      ctx.rotate((angleOffset * Math.PI) / 180);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      if (currentDepth <= 0) {
        ctx.restore();
        return;
      }

      // 递归调用
      drawDynamicTree(0, -len, len * 0.75, -angle, branchWidth * 0.7, currentDepth - 1);
      drawDynamicTree(0, -len, len * 0.75, angle, branchWidth * 0.7, currentDepth - 1);

      ctx.restore();
    };

    // 开始绘制 (从底部中间开始)
    drawDynamicTree(width / 2, height, 120, 0, 10, depth);

  }, [depth, angle]); // 当滑块改变时重绘

  return (
    <div className="my-8 p-4 border rounded-xl bg-gray-50 shadow-inner text-center">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={500} 
        className="w-full h-auto bg-white rounded border border-gray-200 shadow-sm"
      />
      
      {/* 交互控制区 */}
      <div className="mt-4 flex flex-col gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-600 w-20">分叉角度: {angle}°</span>
          <input 
            type="range" 
            min="0" max="90" 
            value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-600 w-20">递归深度: {depth}</span>
          <input 
            type="range" 
            min="1" max="12" 
            value={depth} 
            onChange={(e) => setDepth(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">拖动滑块实时改变分形参数</p>
    </div>
  );
}