import React, { useEffect, useState } from 'react';
import { Zap, Shield, Target, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  speed: number;
  icon: React.ReactNode;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize floating elements
  useEffect(() => {
    const icons = [
      { icon: <Zap />, color: 'text-electric-purple' },
      { icon: <Shield />, color: 'text-cyber-blue' },
      { icon: <Target />, color: 'text-neon-cyan' },
      { icon: <TrendingUp />, color: 'text-warning-orange' },
      { icon: <DollarSign />, color: 'text-electric-purple' },
      { icon: <BarChart3 />, color: 'text-cyber-blue' },
    ];

    const newElements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
      speed: 0.2 + Math.random() * 0.8,
      icon: icons[i % icons.length].icon,
      color: icons[i % icons.length].color,
    }));

    setElements(newElements);
  }, []);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate floating elements
  useEffect(() => {
    const animateElements = () => {
      setElements(prev => prev.map(element => ({
        ...element,
        rotation: (element.rotation + element.speed) % 360,
        y: element.y + Math.sin(Date.now() * 0.001 + element.id) * 0.02,
      })));
    };

    const interval = setInterval(animateElements, 50);
    return () => clearInterval(interval);
  }, []);

  // Particle system
  useEffect(() => {
    const createParticle = () => {
      if (particles.length < 30) {
        const newParticle: Particle = {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 3,
          life: 100,
          maxLife: 100,
          size: 1 + Math.random() * 3,
          color: ['#8A2BE2', '#1E90FF', '#00FFFF'][Math.floor(Math.random() * 3)],
        };
        setParticles(prev => [...prev, newParticle]);
      }
    };

    const animateParticles = () => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          vy: particle.vy * 0.99, // Slow down over time
        }))
        .filter(particle => particle.life > 0 && particle.y > -50)
      );
    };

    const particleInterval = setInterval(createParticle, 200);
    const animationInterval = setInterval(animateParticles, 50);

    return () => {
      clearInterval(particleInterval);
      clearInterval(animationInterval);
    };
  }, [particles.length]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Icons with 3D Effects */}
      <div className="absolute inset-0">
        {elements.map((element) => {
          const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.02 * element.scale;
          const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.02 * element.scale;
          
          return (
            <div
              key={element.id}
              className="absolute floating-3d"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: `
                  translate(${parallaxX}px, ${parallaxY}px) 
                  rotate(${element.rotation}deg) 
                  scale(${element.scale})
                  rotateX(${Math.sin(element.rotation * 0.02) * 15}deg)
                  rotateY(${Math.cos(element.rotation * 0.02) * 15}deg)
                `,
                opacity: element.opacity,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className={`${element.color} drop-shadow-lg`} style={{
                filter: `drop-shadow(0 0 10px currentColor)`,
                fontSize: '2rem',
              }}>
                {element.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Particle System */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life / particle.maxLife,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
