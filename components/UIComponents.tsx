import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => {
  return (
    <button
      className={`
        font-mono text-sm px-4 py-2 border border-brand-accent text-brand-accent 
        bg-brand-bg hover:bg-brand-accent hover:text-brand-secondary 
        transition-colors uppercase tracking-wider
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, ...props }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex justify-between items-end">
        <label className="font-mono text-xs uppercase text-brand-accent opacity-80">{label}</label>
        <span className="font-mono text-xs text-brand-white">{value}</span>
      </div>
      <input
        type="range"
        className="w-full h-2 bg-brand-secondary rounded-none appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
        [&::-webkit-slider-thumb]:bg-brand-accent [&::-webkit-slider-thumb]:border-none"
        value={value}
        {...props}
      />
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="font-mono text-xs uppercase text-brand-accent opacity-80">{label}</label>
      <select
        className="w-full bg-brand-bg border border-brand-accent text-brand-accent font-mono text-sm p-2 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-accent"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void }> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => onChange(!checked)}>
      <span className="font-mono text-xs uppercase text-brand-accent opacity-80 select-none">{label}</span>
      <div className={`w-10 h-5 border border-brand-accent flex items-center p-0.5 ${checked ? 'justify-end' : 'justify-start'}`}>
        <div className={`w-3 h-3 bg-brand-accent transition-all ${checked ? 'opacity-100' : 'opacity-40'}`} />
      </div>
    </div>
  );
};