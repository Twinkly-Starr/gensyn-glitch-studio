import { LogoColor, DitherType } from './types';

export const LOGO_URLS: Record<LogoColor, string> = {
  [LogoColor.White]: 'https://i.postimg.cc/QNcnw0Zd/Gensyn-Logo-Inline-White.png',
  [LogoColor.Brown]: 'https://i.postimg.cc/DZxb0PFt/Gensyn-Logo-Inline-Brown.png',
  [LogoColor.Pink]: 'https://i.postimg.cc/DZp8nfdx/Gensyn-Logo-Inline-Pink.png',
};

export const INITIAL_FILTERS = {
  ditherType: DitherType.None,
  ditherAmount: 50,
  pixelate: 0,
  noise: 0,
  glitch: 0,
  rgbShift: 0,
  isGrayscale: false,
};

export const INITIAL_LOGO = {
  visible: false,
  color: LogoColor.White,
  size: 0.3,
  opacity: 90,
  x: 0.5,
  y: 0.5,
};

// Bayer Matrix for Ordered Dithering (4x4)
export const BAYER_MATRIX_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];