export enum DitherType {
  None = 'none',
  Threshold = 'threshold',
  Floyd = 'floyd',
  Ordered = 'ordered',
}

export enum LogoColor {
  White = 'white',
  Brown = 'brown',
  Pink = 'pink',
}

export interface FilterState {
  ditherType: DitherType;
  ditherAmount: number; // 0-100
  pixelate: number; // 0-100
  noise: number; // 0-100
  glitch: number; // 0-100
  rgbShift: number; // 0-100
  isGrayscale: boolean;
}

export interface LogoState {
  visible: boolean;
  color: LogoColor;
  size: number; // 0.1 to 1.0 (scale relative to canvas)
  opacity: number; // 0-100
  x: number; // 0-1 (normalized position)
  y: number; // 0-1 (normalized position)
}

export interface AppState {
  imageSrc: string | null;
  filters: FilterState;
  logo: LogoState;
}