import { ReactNode } from 'react';

interface FilterPillProps {
  children: ReactNode;
  active?: boolean;
  icon?: string;
  onClick: () => void;
}

export function FilterPill({ 
  children, 
  active = false, 
  icon, 
  onClick 
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-all
        flex items-center gap-1.5
        ${active 
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
          : 'bg-[#222222] hover:bg-[#2a2a2a] text-gray-300'
        }
      `}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </button>
  );
}
