
import React from 'react';
import { Tooltip } from './Tooltip';

interface IconButtonProps {
  icon: string;
  title: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  title, 
  onClick, 
  className = "", 
  active,
  disabled,
  children,
  tooltipPosition = 'top'
}) => (
  <Tooltip content={title} position={tooltipPosition}>
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative active:scale-90 group ${
        active 
          ? 'bg-[#DEE2E6] text-[#1A1C1E] shadow-sm ring-1 ring-[#CED4DA]' 
          : 'text-[#868E96] hover:bg-[#ECEEF0] hover:text-[#1A1C1E]'
      } ${className} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <i className={`${icon} text-[16px] transition-transform duration-200 group-hover:scale-110`}></i>
      {children}
    </button>
  </Tooltip>
);
