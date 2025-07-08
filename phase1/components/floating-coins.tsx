import React, { useEffect, useState } from 'react';

interface CoinElement {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationY: number;
  scale: number;
  speed: number;
  delay: number;
  floatOffset: number;
}

export function FloatingCoins() {
  const [coins, setCoins] = useState<CoinElement[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const newCoins = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      rotation: Math.random() * 360,
      rotationY: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.6,
      speed: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 3,
      floatOffset: Math.random() * Math.PI * 2
    }));

    setCoins(newCoins);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animateCoins = () => {
      setCoins(prev => prev.map(coin => ({
        ...coin,
        rotation: (coin.rotation + coin.speed * 0.5) % 360,
        rotationY: (coin.rotationY + coin.speed) % 360
      })));
    };

    const interval = setInterval(animateCoins, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {coins.map((coin) => {
        const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.03 * coin.scale;
        const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.03 * coin.scale;
        const floatY = Math.sin(Date.now() * 0.002 + coin.floatOffset) * 20;
        
        return (
          <div
            key={coin.id}
            className="absolute"
            style={{
              left: `${coin.x}%`,
              top: `${coin.y}%`,
              transform: `
                translate(${parallaxX}px, ${parallaxY + floatY}px) 
                scale(${coin.scale})
              `,
              animationDelay: `${coin.delay}s`
            }}
          >
            {/* 3D Coin with Enhanced Lighting */}
            <div 
              className="relative w-20 h-20 floating-3d"
              style={{
                transform: `rotateY(${coin.rotationY}deg) rotateX(${Math.sin(coin.rotation * 0.02) * 15}deg)`,
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 10px 30px rgba(138, 43, 226, 0.4))'
              }}
            >
              {/* Front face with enhanced gradients */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 50%, #00FFFF 100%)',
                  transform: 'translateZ(10px)',
                  boxShadow: '0 0 30px rgba(138, 43, 226, 0.8), inset 0 0 30px rgba(30, 144, 255, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="absolute inset-3 rounded-full bg-dark-card/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-sm drop-shadow-lg">₿</span>
                </div>
                {/* Highlight effect */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/40 blur-sm"
                  style={{ transform: 'translateZ(1px)' }}
                />
              </div>
              
              {/* Back face */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #1E90FF 50%, #8A2BE2 100%)',
                  transform: 'translateZ(-10px) rotateY(180deg)',
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.8), inset 0 0 30px rgba(138, 43, 226, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="absolute inset-3 rounded-full bg-dark-card/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-sm drop-shadow-lg">Ξ</span>
                </div>
                {/* Highlight effect */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/40 blur-sm"
                  style={{ transform: 'translateZ(1px)' }}
                />
              </div>

              {/* Enhanced Edge with thickness */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #8A2BE2 0%, #1E90FF 50%, #00FFFF 100%)',
                  transform: 'rotateX(90deg)',
                  transformOrigin: 'center',
                  height: '20px',
                  top: '50%',
                  marginTop: '-10px',
                  boxShadow: '0 0 20px rgba(30, 144, 255, 0.6)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
