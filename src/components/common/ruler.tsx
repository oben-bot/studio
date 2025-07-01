
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type RulerProps = {
  orientation?: 'horizontal' | 'vertical';
};

export const Ruler = ({ orientation = 'horizontal' }: RulerProps) => {
  const [size, setSize] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize(orientation === 'horizontal' ? width : height);
      }
    });

    const currentRef = ref.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      resizeObserver.disconnect();
    };
  }, [orientation]);

  const renderTicks = () => {
    const ticks = [];
    const interval = 50;
    if (size === 0) return null;

    const numTicks = Math.floor(size / interval);

    for (let i = 0; i <= numTicks; i++) {
      const position = i * interval;
      const isMajorTick = i % 2 === 0 && i > 0;
      
      ticks.push(
        <div
          key={i}
          className="absolute"
          style={orientation === 'horizontal' ? { left: `${position}px` } : { top: `${position}px` }}
        >
          <div
            className={cn(
              "bg-muted-foreground",
              orientation === 'horizontal' ? (isMajorTick ? 'h-3 w-px' : 'h-2 w-px') : (isMajorTick ? 'w-3 h-px' : 'w-2 h-px')
            )}
          />
          {isMajorTick && (
            <span
              className="absolute text-muted-foreground text-[10px] select-none"
              style={
                orientation === 'horizontal'
                  ? { transform: 'translateX(-50%)', top: '12px' }
                  : { transform: 'translateY(-50%)', left: '12px' }
              }
            >
              {position}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div ref={ref} className="relative w-full h-full">
      {renderTicks()}
    </div>
  );
};
