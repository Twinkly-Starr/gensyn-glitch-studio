import { DitherType, FilterState, LogoState, LogoColor } from '../types';
import { BAYER_MATRIX_4x4, LOGO_URLS } from '../constants';

// Helper to load image
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// Cache for loaded logo images
const logoCache: Record<string, HTMLImageElement> = {};

export const getLogoImage = async (color: LogoColor): Promise<HTMLImageElement> => {
  const url = LOGO_URLS[color];
  if (logoCache[url]) return logoCache[url];
  const img = await loadImage(url);
  logoCache[url] = img;
  return img;
};

// --- Global Glitch State Cache ---
// This prevents the glitch pattern from jumping (jittering) when other sliders move.
// We only regenerate slices if the glitch AMOUNT changes.
let glitchCache = {
  amount: -1,
  slices: [] as { h: number; y: number; off: number }[]
};

// --- Filters ---

const applyPixelate = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
  if (amount <= 0) return;
  const blockSize = Math.max(1, Math.floor((amount / 100) * 40)) + 1;
  if (blockSize === 1) return;

  const w = Math.ceil(width / blockSize);
  const h = Math.ceil(height / blockSize);

  ctx.imageSmoothingEnabled = false;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0, w, h);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(tempCanvas, 0, 0, width, height);
};

const applyGrayscale = (data: Uint8ClampedArray) => {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
};

const applyNoise = (data: Uint8ClampedArray, amount: number) => {
  if (amount <= 0) return;
  const factor = (amount / 100) * 100;
  for (let i = 0; i < data.length; i += 4) {
    const rand = (Math.random() - 0.5) * factor;
    data[i] = Math.min(255, Math.max(0, data[i] + rand));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + rand));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + rand));
  }
};

const applyDither = (data: Uint8ClampedArray, width: number, height: number, type: DitherType, amount: number) => {
  if (type === DitherType.None) return;

  // Threshold Dither (Amount = Cutoff)
  if (type === DitherType.Threshold) {
    // Map 0-100 to 0-255 threshold
    const threshold = (amount / 100) * 255;
    for (let i = 0; i < data.length; i += 4) {
      const light = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = light > threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    return;
  }

  // Common blending factor for Ordered & Floyd
  const blendRatio = amount / 100;
  
  // Clone data for blending
  const original = new Uint8ClampedArray(data);

  // Ordered Dither (Bayer)
  if (type === DitherType.Ordered) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const mapValue = BAYER_MATRIX_4x4[y % 4][x % 4];
        const normalizedMap = (mapValue / 16) - 0.5; 
        const offset = normalizedMap * 255; 

        // Apply map
        let r = original[i] + offset;
        let g = original[i+1] + offset;
        let b = original[i+2] + offset;

        // Quantize (1-bit style)
        r = r > 128 ? 255 : 0;
        g = g > 128 ? 255 : 0;
        b = b > 128 ? 255 : 0;

        // Blend with original based on intensity
        data[i] = original[i] * (1 - blendRatio) + r * blendRatio;
        data[i+1] = original[i+1] * (1 - blendRatio) + g * blendRatio;
        data[i+2] = original[i+2] * (1 - blendRatio) + b * blendRatio;
      }
    }
    return;
  }

  // Floyd-Steinberg
  if (type === DitherType.Floyd) {
    const w = width;
    
    // We run destructive FS on 'data', then blend back using 'original'
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        
        const oldR = data[i];
        const oldG = data[i+1];
        const oldB = data[i+2];

        const newR = oldR < 128 ? 0 : 255;
        const newG = oldG < 128 ? 0 : 255;
        const newB = oldB < 128 ? 0 : 255;

        data[i] = newR;
        data[i+1] = newG;
        data[i+2] = newB;

        const errR = oldR - newR;
        const errG = oldG - newG;
        const errB = oldB - newB;

        const distribute = (dx: number, dy: number, factor: number) => {
          if (x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < height) {
            const ni = ((y + dy) * w + (x + dx)) * 4;
            data[ni] = Math.min(255, Math.max(0, data[ni] + errR * factor));
            data[ni+1] = Math.min(255, Math.max(0, data[ni+1] + errG * factor));
            data[ni+2] = Math.min(255, Math.max(0, data[ni+2] + errB * factor));
          }
        };

        distribute(1, 0, 7/16);
        distribute(-1, 1, 3/16);
        distribute(0, 1, 5/16);
        distribute(1, 1, 1/16);
      }
    }

    // Apply Blend
    for (let i = 0; i < data.length; i++) {
        data[i] = original[i] * (1 - blendRatio) + data[i] * blendRatio;
    }
  }
};

const applyRGBShift = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
  if (amount <= 0) return;
  const shift = Math.floor((amount / 100) * (width * 0.05));
  if (shift === 0) return;

  const src = ctx.getImageData(0, 0, width, height);
  const data = src.data;
  const copy = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      const rX = Math.min(width - 1, Math.max(0, x + shift));
      const rI = (y * width + rX) * 4;
      
      const bX = Math.min(width - 1, Math.max(0, x - shift));
      const bI = (y * width + bX) * 4;

      data[i] = copy[rI];
      data[i+2] = copy[bI+2];
    }
  }
  ctx.putImageData(src, 0, 0);
};

const applyGlitch = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
  if (amount <= 0) return;
  
  // Only regenerate random slices if the intensity amount changes
  if (glitchCache.amount !== amount) {
    const intensity = amount / 100;
    const numSlices = Math.floor(intensity * 20); 
    const maxOffset = width * 0.1 * intensity;
    
    const slices = [];
    for (let i = 0; i < numSlices; i++) {
      slices.push({
        h: Math.random() * (height * 0.2),
        y: Math.random() * height, // we wrap or clamp later
        off: (Math.random() - 0.5) * 2 * maxOffset
      });
    }
    
    glitchCache = { amount, slices };
  }
  
  // Render using cached slices
  glitchCache.slices.forEach(slice => {
    // Ensure slice stays within bounds or wraps safely
    let y = slice.y;
    if (y + slice.h > height) y = height - slice.h;
    if (y < 0) y = 0;

    ctx.drawImage(
      ctx.canvas,
      0, y, width, slice.h, 
      slice.off, y, width, slice.h 
    );
  });
};

export const renderPipeline = async (
  ctx: CanvasRenderingContext2D,
  sourceImg: HTMLImageElement,
  filters: FilterState,
  logo: LogoState
) => {
  const { width, height } = ctx.canvas;

  // 0. Clear
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Source
  ctx.drawImage(sourceImg, 0, 0, width, height);

  // 2. Pixelate
  applyPixelate(ctx, width, height, filters.pixelate);

  // 3. RGB Shift
  applyRGBShift(ctx, width, height, filters.rgbShift);

  // 4. Glitch
  applyGlitch(ctx, width, height, filters.glitch);

  // --- Pixel Manipulation Stage ---
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 5. Grayscale
  if (filters.isGrayscale) {
    applyGrayscale(data);
  }

  // 6. Noise
  applyNoise(data, filters.noise);

  // 7. Dither
  applyDither(data, width, height, filters.ditherType, filters.ditherAmount);

  ctx.putImageData(imageData, 0, 0);

  // 8. Logo Overlay
  if (logo.visible) {
    try {
      const logoImg = await getLogoImage(logo.color);
      const logoW = width * logo.size;
      const logoH = logoW * (logoImg.height / logoImg.width);
      const posX = (width * logo.x) - (logoW / 2);
      const posY = (height * logo.y) - (logoH / 2);

      ctx.save();
      ctx.globalAlpha = logo.opacity / 100;
      ctx.drawImage(logoImg, posX, posY, logoW, logoH);
      ctx.restore();
    } catch (e) {
      console.error("Failed to load logo", e);
    }
  }
};