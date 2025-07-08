import React from 'react';
import LogoImage from './assets/Logo.png';

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size, margin: '2px' }}>
      <img 
        src={LogoImage} 
        alt="Logo" 
        width={size} 
        height={size} 
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}

export default Logo;
