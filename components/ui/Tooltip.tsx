
import React from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: Position;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
}) => {
  // Tighter margins (1.5 = 6px) and no translation to prevent jitter
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className={`
        absolute z-[1000] px-2.5 py-1.5 
        bg-[#1A1C1E] text-white text-[11px] font-bold 
        rounded-lg whitespace-nowrap pointer-events-none 
        opacity-0 group-hover:opacity-100 
        transition-all duration-150 ease-out scale-95 group-hover:scale-100
        shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5
        ${positionClasses[position]}
      `}>
        {content}
      </div>
    </div>
  );
};
