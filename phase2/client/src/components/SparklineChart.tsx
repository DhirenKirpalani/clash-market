import React from 'react';

interface SparklineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  fillGradient?: [string, string]; // Optional gradient array [startColor, endColor]
}

export default function SparklineChart({ 
  data = [],
  color = "#4ADE80", 
  width = 64,
  height = 24,
  fillGradient
}: SparklineChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Prevent division by zero

  // Create sparkline points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine whether chart shows uptrend or downtrend
  const isUptrend = data[0] < data[data.length - 1];
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Path line */}
      <path
        d={`M0,${height} L${points}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gradient fill under the line */}
      <linearGradient id={`sparkline-gradient-${color.replace('#', '').replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" x2="0" y1="0" y2="1">
        {fillGradient ? (
          <>
            <stop offset="0%" stopColor={fillGradient[0]} stopOpacity="1" />
            <stop offset="100%" stopColor={fillGradient[1]} stopOpacity="1" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </>
        )}
      </linearGradient>
      
      <path
        d={`M0,${height} L${points} L${width},${height} Z`}
        fill={`url(#sparkline-gradient-${color.replace('#', '').replace(/[^a-zA-Z0-9]/g, '')})`}
      />
    </svg>
  );
}
