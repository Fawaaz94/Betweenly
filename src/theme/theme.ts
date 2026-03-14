import { colorTokens, type ThemeColorTokens, type ThemeMode } from './colors';
import { radius, type RadiusTokens } from './radius';
import { darkShadows, lightShadows, type ShadowTokens } from './shadows';
import { sizing, type SizingTokens } from './sizing';
import { spacing, type SpacingTokens } from './spacing';
import { typography, type TypographyTokens } from './typography';

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  sizing: SizingTokens;
};

const sharedTokens = {
  spacing,
  radius,
  typography,
  sizing,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: colorTokens.light,
  shadows: lightShadows,
  ...sharedTokens,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: colorTokens.dark,
  shadows: darkShadows,
  ...sharedTokens,
};

const themesByMode: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const defaultThemeMode: ThemeMode = 'dark';

export function getTheme(themeMode: ThemeMode): Theme {
  return themesByMode[themeMode];
}

export type ThemeColors = {
  appBg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentPressed: string;
  accentText: string;
  textOnAccent: string;
  danger: string;
  dangerPressed: string;
  chipActiveBg: string;
  chipActiveBorder: string;
  selectedSurface: string;
};

function toThemeColors(theme: Theme): ThemeColors {
  const { colors } = theme;

  return {
    appBg: colors.background.base,
    surface: colors.surface.base,
    surfaceAlt: colors.surface.alt,
    border: colors.border.default,
    borderMuted: colors.border.muted,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.tertiary,
    accent: colors.brand.primary,
    accentPressed: colors.brand.primaryPressed,
    accentText: colors.brand.secondary,
    textOnAccent: theme.mode === 'dark' ? colors.background.base : colors.text.onDark,
    danger: colors.semantic.error,
    dangerPressed: colors.semantic.warning,
    chipActiveBg: colors.brand.primary,
    chipActiveBorder: colors.brand.primaryPressed,
    selectedSurface: colors.brand.blush,
  };
}

const themeColorsByMode: Record<ThemeMode, ThemeColors> = {
  light: toThemeColors(lightTheme),
  dark: toThemeColors(darkTheme),
};

export function getThemeColors(themeMode: ThemeMode): ThemeColors {
  return themeColorsByMode[themeMode];
}

