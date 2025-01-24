/**
 * Shared theme with unified tokens for spacing, colors, radii, etc.
 * You can adjust these values to match your brand's look and feel.
 */

import { Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const theme = {
  layout: {
    windowWidth,
    windowHeight,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    full: 9999,
  },
  colors: {
    primary: '#693a9d',
    secondary: '#5FA0EE',
    danger: '#EE4A4A',

    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textWhite: '#FFFFFF',

    border: '#E2E8F0',
    background: '#F9FAFB',

    black: '#0F172A',
    white: '#FFFFFF',
    transparent: 'transparent',

    overlayLike: 'rgba(105, 105, 105, 0.85)',
    overlayNope: 'rgba(238, 74, 74, 0.85)',
    overlayDark: 'rgba(0, 0, 0, 0.45)',

    switchTrackOff: '#CBD5E1',
    switchTrackOn: '#A3E635',
    switchThumbOff: '#FFFFFF',
    warning: '#FFB300',
  },
  shadow: {
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },
};
