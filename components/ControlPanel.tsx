import React from 'react';
import { FilterState, LogoState, DitherType, LogoColor } from '../types';
import { Slider, Select, Toggle, Button } from './UIComponents';

interface ControlPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  logo: LogoState;
  setLogo: React.Dispatch<React.SetStateAction<LogoState>>;
  onSave: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  filters,
  setFilters,
  logo,
  setLogo,
  onSave,
  onFileSelect,
}) => {
  
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateLogo = (key: keyof LogoState, value: any) => {
    setLogo(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-[40vh] md:w-80 md:h-full overflow-y-auto border-r border-brand-accent/20 bg-brand-bg flex flex-col p-4 md:p-6 scrollbar-thin">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-brand-accent pb-4">
        <h1 className="text-2xl font-mono font-bold text-brand-white tracking-tighter">GENSYN</h1>
        <h2 className="text-xs font-mono text-brand-accent mt-1 tracking-widest">GLITCH STUDIO v1.0</h2>
      </div>

      {/* Input / Output */}
      <div className="mb-8 space-y-3">
        <label className="block w-full cursor-pointer">
          <input type="file" onChange={onFileSelect} accept="image/*" className="hidden" />
          <div className="w-full border border-dashed border-brand-accent p-3 text-center hover:bg-brand-secondary/30 transition-colors">
            <span className="font-mono text-xs text-brand-accent uppercase">Load Source Image</span>
          </div>
        </label>
        <Button onClick={onSave} className="w-full">
          Save .PNG
        </Button>
      </div>

      {/* Global State */}
      <div className="mb-6">
        <h3 className="text-brand-white font-mono text-sm font-bold mb-4 uppercase border-l-2 border-brand-accent pl-2">Global</h3>
        <Toggle 
          label="Grayscale" 
          checked={filters.isGrayscale} 
          onChange={(v) => updateFilter('isGrayscale', v)} 
        />
      </div>

      {/* Effects */}
      <div className="mb-6">
        <h3 className="text-brand-white font-mono text-sm font-bold mb-4 uppercase border-l-2 border-brand-accent pl-2">Glitch FX</h3>
        <Slider 
          label="Pixelate" 
          min={0} max={100} 
          value={filters.pixelate} 
          onChange={(e) => updateFilter('pixelate', Number(e.target.value))} 
        />
        <Slider 
          label="RGB Shift" 
          min={0} max={100} 
          value={filters.rgbShift} 
          onChange={(e) => updateFilter('rgbShift', Number(e.target.value))} 
        />
        <Slider 
          label="Glitch Slice" 
          min={0} max={100} 
          value={filters.glitch} 
          onChange={(e) => updateFilter('glitch', Number(e.target.value))} 
        />
         <Slider 
          label="Noise" 
          min={0} max={100} 
          value={filters.noise} 
          onChange={(e) => updateFilter('noise', Number(e.target.value))} 
        />
      </div>

      {/* Dithering */}
      <div className="mb-6">
        <h3 className="text-brand-white font-mono text-sm font-bold mb-4 uppercase border-l-2 border-brand-accent pl-2">Dither</h3>
        <Select 
          label="Algorithm" 
          value={filters.ditherType} 
          onChange={(e) => updateFilter('ditherType', e.target.value as DitherType)}
        >
          <option value={DitherType.None}>None</option>
          <option value={DitherType.Threshold}>Threshold (1-Bit)</option>
          <option value={DitherType.Ordered}>Ordered (Bayer)</option>
          <option value={DitherType.Floyd}>Floyd-Steinberg</option>
        </Select>
        {filters.ditherType !== DitherType.None && (
          <Slider 
            label={filters.ditherType === DitherType.Threshold ? "Threshold" : "Intensity"} 
            min={0} max={100} 
            value={filters.ditherAmount} 
            onChange={(e) => updateFilter('ditherAmount', Number(e.target.value))} 
          />
        )}
      </div>

      {/* Logo Overlay */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4 border-l-2 border-brand-accent pl-2">
          <h3 className="text-brand-white font-mono text-sm font-bold uppercase">Branding</h3>
          <Toggle label="" checked={logo.visible} onChange={(v) => updateLogo('visible', v)} />
        </div>
        
        {logo.visible && (
          <div className="space-y-4 animate-fadeIn">
             <Select 
              label="Logo Color" 
              value={logo.color} 
              onChange={(e) => updateLogo('color', e.target.value as LogoColor)}
            >
              <option value={LogoColor.White}>White</option>
              <option value={LogoColor.Brown}>Brand Brown</option>
              <option value={LogoColor.Pink}>Brand Pink</option>
            </Select>

            <Slider 
              label="Size" 
              min={10} max={100} 
              value={logo.size * 100} 
              onChange={(e) => updateLogo('size', Number(e.target.value) / 100)} 
            />
            <Slider 
              label="Opacity" 
              min={0} max={100} 
              value={logo.opacity} 
              onChange={(e) => updateLogo('opacity', Number(e.target.value))} 
            />
            {/* Simple position sliders for X/Y */}
            <Slider 
              label="Pos X" 
              min={0} max={100} 
              value={logo.x * 100} 
              onChange={(e) => updateLogo('x', Number(e.target.value) / 100)} 
            />
            <Slider 
              label="Pos Y" 
              min={0} max={100} 
              value={logo.y * 100} 
              onChange={(e) => updateLogo('y', Number(e.target.value) / 100)} 
            />
          </div>
        )}
      </div>

      <div className="mt-auto text-[10px] text-brand-accent/40 font-mono text-center pb-4">
        SYSTEM READY // WAITING FOR INPUT
      </div>
    </div>
  );
};

export default ControlPanel;