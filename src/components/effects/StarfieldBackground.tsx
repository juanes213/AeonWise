import React, { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const animationFrameId = useRef<number>(0);
  const lastTime = useRef<number>(0);

  const createStars = useCallback((width: number, height: number) => {
    const starCount = Math.min(Math.floor((width * height) / 3000), 150); // Limit star count for performance
    const newStars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }
    
    stars.current = newStars;
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    ctx.clearRect(0, 0, width, height);
    
    stars.current.forEach((star) => {
      // Create subtle twinkling effect
      const twinkle = Math.sin(Date.now() * 0.001 + star.x + star.y) * 0.2 + 0.8;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Move stars slowly
      star.y += star.speed * deltaTime;
      
      // Reset stars that go off screen
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars(canvas.width, canvas.height);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;
      
      // Throttle animation to 30fps for better performance
      if (deltaTime > 33) {
        drawStars(ctx, canvas.width, canvas.height, deltaTime);
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
      className="fixed inset-0 z-[-1] opacity-60 pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
};

export default StarfieldBackground;