import type { ViewStyle } from 'react-native';

export type ShadowStyleToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export type ShadowTokens = {
  card: ShadowStyleToken;
  tabBar: ShadowStyleToken;
};

export const lightShadows: ShadowTokens = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const darkShadows: ShadowTokens = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 1,
  },
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const shadows = {
  light: lightShadows,
  dark: darkShadows,
} as const;
