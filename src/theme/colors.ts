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
      primary: '#4B2142',
      primaryPressed: '#3A1833',
      secondary: '#C38D9E',
      mauve: '#D8C3CC',
      accent: '#E7C8BE',
      blush: '#F1E7E4',
    },
    background: {
      base: '#F8F3F1',
    },
    surface: {
      base: '#FFFFFF',
      alt: '#F3ECE9',
    },
    text: {
      primary: '#22181C',
      secondary: '#6E5A61',
      tertiary: '#9A8A90',
      onDark: '#FFF8FA',
    },
    border: {
      default: '#E4D7D9',
      muted: '#E4D7D9',
    },
    semantic: {
      success: '#8FA58A',
      warning: '#B86B77',
      error: '#A55464',
      info: '#8F7A98',
    },
  },
  dark: {
    brand: {
      primary: '#C38D9E',
      primaryPressed: '#B86B77',
      secondary: '#E7C8BE',
      mauve: '#9D8C93',
      accent: '#B86B77',
      blush: '#2E2129',
    },
    background: {
      base: '#181116',
    },
    surface: {
      base: '#241A20',
      alt: '#2E2129',
    },
    text: {
      primary: '#F7EEF1',
      secondary: '#C7B7BE',
      tertiary: '#9D8C93',
      onDark: '#FFF8FA',
    },
    border: {
      default: '#45333C',
      muted: '#45333C',
    },
    semantic: {
      success: '#8FA58A',
      warning: '#B86B77',
      error: '#A55464',
      info: '#8F7A98',
    },
  },
};

export function getThemeTokens(themeMode: ThemeMode): ThemeColorTokens {
  return colorTokens[themeMode];
}

