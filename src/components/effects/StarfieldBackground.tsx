import React, { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinklePhase: number;
}

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const animationFrameId = useRef<number>(0);
  const lastTime = useRef<number>(0);

  const createStars = useCallback((width: number, height: number) => {
    const starCount = Math.min(Math.floor((width * height) / 4000), 120); // Optimized star count
    const newStars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    stars.current = newStars;
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const time = Date.now() * 0.001;
    
    stars.current.forEach((star) => {
      // Create subtle twinkling effect
      const twinkle = Math.sin(time * 0.5 + star.twinklePhase) * 0.3 + 0.7;
      const finalOpacity = star.opacity * twinkle;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Move stars slowly downward
      star.y += star.speed * deltaTime;
      
      // Reset stars that go off screen
      if (star.y > height + star.size) {
        star.y = -star.size;
        star.x = Math.random() * width;
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Optimize canvas for better performance
    ctx.imageSmoothingEnabled = false;
    
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(dpr, dpr);
      createStars(rect.width, rect.height);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;
      
      // Throttle animation to 30fps for better performance
      if (deltaTime > 33) {
        const rect = canvas.getBoundingClientRect();
        drawStars(ctx, rect.width, rect.height, deltaTime);
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [createStars, drawStars]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] opacity-70 pointer-events-none"
      style={{ 
        willChange: 'transform',
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};

export default StarfieldBackground;