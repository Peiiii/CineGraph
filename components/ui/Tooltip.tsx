
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
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className={`
        absolute z-[1000] px-3 py-1.5 
        bg-[#1A1C1E] text-white text-[12px] font-bold 
        rounded-xl whitespace-nowrap pointer-events-none 
        opacity-0 group-hover:opacity-100 
        transition-all duration-200 ease-out scale-90 group-hover:scale-100
        shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-white/10
        ${positionClasses[position]}
      `}>
        {content}
      </div>
    </div>
  );
};
