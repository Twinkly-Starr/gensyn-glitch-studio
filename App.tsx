import React, { useState, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import CanvasView from './components/CanvasView';
import { FilterState, LogoState } from './types';
import { INITIAL_FILTERS, INITIAL_LOGO } from './constants';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [logo, setLogo] = useState<LogoState>(INITIAL_LOGO);
  
  // We hold the canvas ref here to trigger Save
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const handleSave = useCallback(() => {
    if (!canvasRef) return;
    try {
      // Create a temporary link
      const link = document.createElement('a');
      link.download = `gensyn-glitch-${Date.now()}.png`;
      link.href = canvasRef.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Save failed (likely CORS on external image if used)", err);
      alert("Error saving image. Ensure source images allow CORS.");
    }
  }, [canvasRef]);

  return (
    <div className="flex flex-col md:flex-row-reverse h-screen w-screen bg-brand-bg text-brand-accent overflow-hidden">
      {/* 
        Layout Strategy:
        Mobile (col): Canvas is first (Top 60vh), Controls second (Bottom 40vh).
        Desktop (row-reverse): Canvas is first in DOM so it goes Right. Controls second in DOM goes Left.
      */}
      <CanvasView 
        imageSrc={imageSrc}
        filters={filters}
        logo={logo}
        setCanvasRef={setCanvasRef}
      />
      <ControlPanel 
        filters={filters}
        setFilters={setFilters}
        logo={logo}
        setLogo={setLogo}
        onSave={handleSave}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}

export default App;