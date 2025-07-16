// app/components/InteractiveNexusBackground.jsx
"use client";
import React, { useRef, useEffect } from 'react';

const InteractiveNexusBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (event) => { mouse.x = event.x; mouse.y = event.y; };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
        if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    let particlesArray = [];
    const init = () => {
      particlesArray = [];
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, 'rgba(255, 255, 255, 0.8)'));
      }
    };

    const connect = () => {
      // The new core color for the nexus lines: Electric Cyan
      const lineColor = 'rgba(34, 211, 238,'; // This is Tailwind's "cyan-400"

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
          if (distance < 20000) {
            const opacity = 1 - (distance / 20000);
            ctx.strokeStyle = `${lineColor} ${opacity})`; // UPDATED: Changed from pink to cyan
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
        if (mouse.x && mouse.y) {
          const distanceToMouse = ((particlesArray[a].x - mouse.x) ** 2) + ((particlesArray[a].y - mouse.y) ** 2);
          if (distanceToMouse < mouse.radius ** 2) {
            const opacity = 1 - (distanceToMouse / (mouse.radius ** 2));
            ctx.strokeStyle = `${lineColor} ${opacity})`; // UPDATED: Changed from pink to cyan for consistency
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => p.update());
      connect();
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default InteractiveNexusBackground;