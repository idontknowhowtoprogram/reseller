'use client';

import { useEffect, useState } from 'react';

const promoMessages = [
  'Going Cheap Today',
  'One-of-a-kind Items',
  'Only 1 Piece Available',
  'Grab It Before Someone Else Does',
  'Verified Original',
  'Fresh Drops Just Added',
];

export function PromoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoMessages.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-primary/10 py-2 w-full">
      <div className="w-full max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-primary animate-pulse">🔥</span>
          <div className="relative h-6 w-full max-w-md">
            {promoMessages.map((message, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-sm font-medium text-foreground">{message}</span>
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-primary animate-pulse">🔥</span>
        </div>
      </div>
    </div>
  );
}

