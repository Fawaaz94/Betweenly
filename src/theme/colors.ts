export type ThemeMode = 'light' | 'dark';

export type ThemeColorTokens = {
  brand: {
    primary: string;
    primaryPressed: string;
    secondary: string;
    mauve: string;
    accent: string;
    blush: string;
  };
  background: {
    base: string;
  };
  surface: {
    base: string;
    alt: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onDark: string;
  };
  border: {
    default: string;
    muted: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
};

export const colorTokens: Record<ThemeMode, ThemeColorTokens> = {
  light: {
    brand: {
      primary: '#E45C5C',
      primaryPressed: '#C64B4B',
      secondary: '#F07A7A',
      mauve: '#D9DEED',
      accent: '#F7D9D9',
      blush: '#F4F6FB',
    },
    background: {
      base: '#F6F7FB',
    },
    surface: {
      base: '#FFFFFF',
      alt: '#F0F2F8',
    },
    text: {
      primary: '#1A1D2B',
      secondary: '#6B7287',
      tertiary: '#9AA0B5',
      onDark: '#FFFFFF',
    },
    border: {
      default: '#E2E5EF',
      muted: '#ECEFF6',
    },
    semantic: {
      success: '#63A38A',
      warning: '#F07A7A',
      error: '#E45C5C',
      info: '#7E8CC4',
    },
  },
  dark: {
    brand: {
      primary: '#E45C5C',
      primaryPressed: '#C64B4B',
      secondary: '#F07A7A',
      mauve: '#6C728A',
      accent: '#F07A7A',
      blush: '#2A314F',
    },
    background: {
      base: '#0D0F1A',
    },
    surface: {
      base: '#161B2E',
      alt: '#1E233A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A7ADC3',
      tertiary: '#6C728A',
      onDark: '#FFFFFF',
    },
    border: {
      default: '#2E3552',
      muted: '#242A44',
    },
    semantic: {
      success: '#63A38A',
      warning: '#F07A7A',
      error: '#E45C5C',
      info: '#7E8CC4',
    },
  },
};

export function getThemeTokens(themeMode: ThemeMode): ThemeColorTokens {
  return colorTokens[themeMode];
}
