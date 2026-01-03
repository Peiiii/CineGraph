
import React from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: Position;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
}) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover:-translate-y-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 group-hover:translate-y-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 group-hover:-translate-x-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 group-hover:translate-x-1',
  };

  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className={`
        absolute z-[1000] px-2.5 py-1.5 
        bg-black/90 backdrop-blur-sm text-white text-[11px] font-bold 
        rounded-lg whitespace-nowrap pointer-events-none 
        opacity-0 group-hover:opacity-100 
        transition-all duration-200 ease-out scale-95 group-hover:scale-100
        shadow-xl border border-white/10
        ${positionClasses[position]}
      `}>
        {content}
      </div>
    </div>
  );
};
