
import React from 'react';
import { Tooltip } from './Tooltip';

interface ActionButtonProps {
  icon: string;
  title: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  title, 
  onClick, 
  className = "", 
  disabled,
  tooltipPosition = 'top'
}) => (
  <Tooltip content={title} position={tooltipPosition}>
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 group
        text-[#ADB5BD] hover:bg-[#F1F3F5] hover:text-[#1A1C1E]
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        <i className={`${icon} text-[14px] transition-transform duration-200 group-hover:scale-110`}></i>
      </div>
    </button>
  </Tooltip>
);
