import { useMemo } from 'react';
import { useAppState } from '../features/app/app-context';
import { getTheme, getThemeColors } from './theme';

export function useTheme() {
  const { themeMode } = useAppState();

  return useMemo(
    () => ({
      themeMode,
      theme: getTheme(themeMode),
      colors: getThemeColors(themeMode),
    }),
    [themeMode],
  );
}

