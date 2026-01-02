
import React from 'react';

interface SuggestionCardProps {
  title: string;
  desc: string;
  images: string[];
  onClick?: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, desc, images, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] rounded-[1.2rem] p-5 pr-28 transition-all cursor-pointer overflow-hidden min-h-[95px] flex flex-col justify-center"
  >
    <h4 className="text-[14px] font-bold text-black mb-0.5">{title}</h4>
    <p className="text-[11px] text-[#ADB5BD] line-clamp-1 leading-relaxed font-medium">{desc}</p>
    <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 flex items-center h-full">
      {images.map((img, i) => (
        <img 
          key={i} 
          src={img} 
          className="w-14 h-22 object-cover rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.06)] border-2 border-white -ml-9 first:ml-0 transform transition-all duration-500 group-hover:-translate-y-1.5"
          style={{ 
            zIndex: images.length - i, 
            transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? '-6px' : '0'})` 
          }}
        />
      ))}
    </div>
  </div>
);
