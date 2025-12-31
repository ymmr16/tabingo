/**
 * カラーパレット: #005739 を中心とした50-900スケール
 */
export const colors = {
  50: '#e6f5f0',
  100: '#b3e6d4',
  200: '#80d7b8',
  300: '#4dc89c',
  400: '#1ab980',
  500: '#005739', // ベースカラー
  600: '#00462d',
  700: '#003521',
  800: '#002415',
  900: '#00130a',
} as const;

/**
 * グレーパレット: 緑に合うクールグレーの50-900スケール
 */
export const gray = {
  50: '#f8f9fa',
  100: '#f1f3f5',
  200: '#e9ecef',
  300: '#dee2e6',
  400: '#ced4da',
  500: '#adb5bd',
  600: '#868e96',
  700: '#495057',
  800: '#343a40',
  900: '#212529',
} as const;

export const black = '#0D0116';
export const white = '#FFFEF9';

export type ColorScale = keyof typeof colors;
export type GrayScale = keyof typeof gray;

