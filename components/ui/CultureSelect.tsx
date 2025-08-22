'use client';

import { Sprout, Wheat, Coffee } from 'lucide-react';

interface CultureSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const cultures = [
  { value: 'soja', label: 'Soja', icon: Sprout, color: 'from-green-500 to-green-600' },
  { value: 'milho', label: 'Milho', icon: Wheat, color: 'from-yellow-500 to-yellow-600' },
  { value: 'cafe', label: 'Café', icon: Coffee, color: 'from-amber-600 to-amber-700' },
];

export function CultureSelect({ value, onChange, className = '' }: CultureSelectProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {cultures.map((culture) => {
        const Icon = culture.icon;
        const isSelected = value === culture.value;
        
        return (
          <button
            key={culture.value}
            onClick={() => onChange(culture.value)}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              isSelected
                ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${culture.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-white font-medium">{culture.label}</div>
          </button>
        );
      })}
    </div>
  );
}