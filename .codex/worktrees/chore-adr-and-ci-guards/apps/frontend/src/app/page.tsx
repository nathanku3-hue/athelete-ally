"use client";

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { NavBar } from '@/components/navigation/NavBar';

// ============================================================================
// 動態視覺化組件 (Dynamic Visualizer Component)
// ============================================================================
const DynamicVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[];
    const particleCount = 70;
    const connectionDistance = 120;
    
    // 設置畫布尺寸以匹配其容器
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    // 定義單個粒子
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        if (!canvas) return;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // 亮藍色節點
        ctx.fill();
      }
    }

    // 初始化粒子
    const init = () => {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = (Math.random() - 0.5) * 0.5;
        particles.push(new Particle(x, y, vx, vy));
      }
    };

    // 連接粒子
    const connectParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / connectionDistance})`; // 根據距離調整線條透明度
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // 動畫循環
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', init);

    // 清理函數
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};


// ============================================================================
// 主頁面組件 (Home Page Component)
// ============================================================================
export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-8 md:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* 左欄：文本內容和 CTA */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Smarter Training. Peak Results.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg whitespace-nowrap">
            AI-powered scientific periodization, customized for you.
          </p>
          <div className="flex flex-col items-start space-y-4">
            <Link 
                href="/onboarding/proficiency" 
                className="px-8 py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              Customize for me
            </Link>
            <Link 
                href="/plan" 
                className="px-8 py-4 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              View Training Plan
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required
            </p>
          </div>
        </div>

        {/* 右欄：動態視覺化 */}
        <div className="hidden md:flex w-full h-full min-h-[400px]">
          <DynamicVisualizer />
        </div>

      </div>
    </main>
    </>
  );
}