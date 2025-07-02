
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type UiMode = 'setup' | 'chat';
export type WorkType = 'corte' | 'corte-grabado' | 'grabado' | '3d' | '';
export type CorteSubType = 'nombre' | 'figura' | 'contorno' | 'forma' | '';
export type ThreeDSubType = 'nuevo' | 'existente' | '';
export type FontType =
  | 'sans-serif'
  | 'serif'
  | 'script'
  | 'gothic'
  | 'display'
  | 'monospace'
  | 'fantasy'
  | 'handwriting'
  | 'blackletter'
  | 'decorative'
  | 'stencil'
  | 'futuristic'
  | 'retro'
  | 'comic'
  | 'calligraphy'
  | 'graffiti'
  | 'pixel'
  | 'rounded'
  | 'grunge'
  | 'art deco'
  | '';
