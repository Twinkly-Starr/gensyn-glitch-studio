import React, { useRef, useEffect, useState } from 'react';
import { FilterState, LogoState } from '../types';
import { loadImage, renderPipeline } from '../utils/imageProcessor';

interface CanvasViewProps {
  imageSrc: string | null;
  filters: FilterState;
  logo: LogoState;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

const CanvasView: React.FC<CanvasViewProps> = ({ imageSrc, filters, logo, setCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const requestRef = useRef<number | null>(null);

  // Expose ref to parent for saving
  useEffect(() => {
    setCanvasRef(canvasRef.current);
  }, [setCanvasRef]);

  // Load source image when src changes
  useEffect(() => {
    if (imageSrc) {
      loadImage(imageSrc).then(img => {
        setSourceImg(img);
      }).catch(err => console.error("Failed to load source", err));
    }
  }, [imageSrc]);

  // The Render Loop
  useEffect(() => {
    if (!sourceImg || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimized for frequent readback
    if (!ctx) return;

    // Responsive Canvas Sizing
    const updateDimensions = () => {
      const container = containerRef.current!;
      if (!container) return;

      const aspect = sourceImg.width / sourceImg.height;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      
      let finalW = containerW;
      let finalH = containerW / aspect;

      if (finalH > containerH) {
        finalH = containerH;
        finalW = containerH * aspect;
      }

      // Max processing resolution
      const MAX_DIM = 2000;
      let renderW = sourceImg.width;
      let renderH = sourceImg.height;
      
      if (renderW > MAX_DIM || renderH > MAX_DIM) {
        const scale = Math.min(MAX_DIM / renderW, MAX_DIM / renderH);
        renderW *= scale;
        renderH *= scale;
      }

      canvas.width = renderW;
      canvas.height = renderH;
      
      // CSS Scaling for Display
      canvas.style.width = `${finalW}px`;
      canvas.style.height = `${finalH}px`;
    };

    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    const render = async () => {
      setIsProcessing(true);
      await renderPipeline(ctx, sourceImg, filters, logo);
      setIsProcessing(false);
    };

    // Use rAF to debounce and schedule render
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(() => {
      render();
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

  }, [sourceImg, filters, logo]);

  return (
    <div ref={containerRef} className="h-[60vh] md:h-full flex-1 bg-black/90 relative flex items-center justify-center p-8 overflow-hidden bg-[radial-gradient(#230800_1px,transparent_1px)] [background-size:16px_16px]">
      {!imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-brand-accent/30 font-mono text-xl animate-pulse">
            NO SIGNAL_
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className={`shadow-2xl border border-brand-secondary/50 object-contain ${isProcessing ? 'cursor-wait' : ''}`}
      />
      {isProcessing && (
         <div className="absolute top-4 right-4 text-brand-accent font-mono text-xs bg-black px-2 py-1 border border-brand-accent">
           RENDERING...
         </div>
      )}
    </div>
  );
};

export default CanvasView;