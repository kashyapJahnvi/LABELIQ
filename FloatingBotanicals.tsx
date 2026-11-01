import React from 'react';

export const FloatingBotanicals: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Sliced Grapefruit - Top Right */}
      <div className="absolute -top-6 -right-8 w-44 h-44 opacity-25 animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#F07853" />
          <circle cx="50" cy="50" r="42" fill="#FFE4D9" />
          <circle cx="50" cy="50" r="38" fill="#F07853" />
          <circle cx="50" cy="50" r="8" fill="#FFF7F2" />
          {/* Segments */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <path
              key={i}
              d="M 50 50 L 50 15 A 35 35 0 0 1 74 25 Z"
              fill="#FF8C66"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        </svg>
      </div>

      {/* Avocado Slice - Top Left */}
      <div className="absolute top-24 -left-6 w-36 h-36 opacity-20 animate-float-medium">
        <svg viewBox="0 0 100 120" fill="none" className="w-full h-full drop-shadow-md">
          <path
            d="M 50 10 C 75 10 90 40 90 75 C 90 105 70 115 50 115 C 30 115 10 105 10 75 C 10 40 25 10 50 10 Z"
            fill="#3D6A46"
          />
          <path
            d="M 50 18 C 70 18 82 44 82 75 C 82 100 66 108 50 108 C 34 108 18 100 18 75 C 18 44 30 18 50 18 Z"
            fill="#EAF2D5"
          />
          <circle cx="50" cy="80" r="22" fill="#7C4A2D" />
          <circle cx="56" cy="74" r="5" fill="#A76E4B" opacity="0.6" />
        </svg>
      </div>

      {/* Fresh Botanical Leaf - Middle Right */}
      <div className="absolute top-1/2 right-4 w-28 h-28 opacity-25 animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M 20 80 C 20 40 50 20 80 20 C 80 50 60 80 20 80 Z"
            fill="#4A7C59"
          />
          <path d="M 20 80 Q 50 50 80 20" stroke="#EAF2D5" strokeWidth="2.5" />
          <path d="M 38 62 Q 52 64 58 54" stroke="#EAF2D5" strokeWidth="1.5" />
          <path d="M 52 48 Q 66 50 72 40" stroke="#EAF2D5" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Strawberry Slice - Bottom Left */}
      <div className="absolute -bottom-10 left-12 w-32 h-32 opacity-20 animate-float-medium">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M 50 85 C 30 85 20 60 20 40 C 20 25 35 20 50 30 C 65 20 80 25 80 40 C 80 60 70 85 50 85 Z"
            fill="#E05345"
          />
          <circle cx="42" cy="45" r="2" fill="#FFEAA7" />
          <circle cx="58" cy="45" r="2" fill="#FFEAA7" />
          <circle cx="36" cy="58" r="2" fill="#FFEAA7" />
          <circle cx="50" cy="62" r="2" fill="#FFEAA7" />
          <circle cx="64" cy="58" r="2" fill="#FFEAA7" />
          <circle cx="50" cy="74" r="2" fill="#FFEAA7" />
        </svg>
      </div>
    </div>
  );
};
