
import React from 'react';
import { Tooltip } from './Tooltip';

interface TabButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  hasAI?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  icon, 
  label, 
  active, 
  onClick, 
  hasAI 
}) => (
  <Tooltip content={label} position="right">
    <button 
      onClick={onClick}
      className={`
        w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 relative group active:scale-95
        ${active 
          ? 'bg-[#E9ECEF] text-[#1A1C1E] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-[#DEE2E6]' 
          : 'text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-[#495057]'
        }
      `}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <i className={`${icon} text-[16px] transition-transform duration-200 group-hover:scale-105`}></i>
      </div>
      {hasAI && (
        <div className="absolute top-1.5 right-1.5">
           <i className="fa-solid fa-sparkles text-[7px] text-[#0066FF] animate-pulse"></i>
        </div>
      )}
      {active && (
        <div className="absolute -left-[14px] w-1 h-4 bg-black rounded-full"></div>
      )}
    </button>
  </Tooltip>
);
