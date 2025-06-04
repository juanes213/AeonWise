import React, { useEffect, useRef } from 'react';

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

  const createStars = (width: number, height: number) => {
    const starCount = Math.floor((width * height) / 2000); // Adjust density as needed
    const newStars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.01,
      });
    }
    
    stars.current = newStars;
  };

  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.clearRect(0, 0, width, height);
    
    stars.current.forEach((star) => {
      // Create twinkling effect
      const twinkle = Math.sin(time * 0.001 + star.x + star.y) * 0.3 + 0.7;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Move stars slightly for subtle animation
      star.y += star.speed;
      
      // Reset stars that go off screen
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    });
  };

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
    
    const animate = (time: number) => {
      drawStars(ctx, canvas.width, canvas.height, time);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] opacity-70 pointer-events-none"
    />
  );
};

export default StarfieldBackground;