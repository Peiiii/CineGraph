
import React from 'react';

interface IconButtonProps {
  icon: string;
  title: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  title, 
  onClick, 
  className = "", 
  active,
  disabled,
  children
}) => (
  <button 
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative ${
      active 
        ? 'bg-[#F0F2F5] text-black shadow-inner' 
        : 'text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-black'
    } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <i className={`${icon} text-[14px]`}></i>
    {children}
  </button>
);
