import type { Theme, Direction, CommonColors, ThemeProviderProps } from '@mui/material/styles';
import type { ThemeCssVariables } from './types';
import type { PaletteColorKey, PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

export type ThemeConfig = {
  direction: Direction;
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  defaultMode: ThemeProviderProps<Theme>['defaultMode'];
  modeStorageKey: ThemeProviderProps<Theme>['modeStorageKey'];
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<PaletteColorKey, PaletteColorNoChannels> & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: {
      [K in 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 as `${K}`]: string;
    };
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  defaultMode: 'dark',
  modeStorageKey: 'theme-mode',
  direction: 'ltr',
  classesPrefix: 'tlc',
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'Jost Variable',
    secondary: 'Cormorant Garamond',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: '#F6ECD1',
      light: '#EFDCA9',
      main: '#E7CE92',
      dark: '#C9A94E',
      darker: '#8A6D2F',
      contrastText: '#0B0B0D',
    },
    secondary: {
      lighter: '#EED9A2',
      light: '#E4C77E',
      main: '#D9B45B',
      dark: '#A8842F',
      darker: '#6E5620',
      contrastText: '#0B0B0D',
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D6F0DF',
      light: '#9FD8B5',
      main: '#6FBF8E',
      dark: '#3E9A64',
      darker: '#1F6B42',
      contrastText: '#0B0B0D',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#F2D6D4',
      light: '#DC938F',
      main: '#C9605B',
      dark: '#9B3E3A',
      darker: '#6B2523',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#F7F6F3',
      100: '#EFEDE7',
      200: '#D8D4CB',
      300: '#B6B1A6',
      400: '#8A857B',
      500: '#635F58',
      600: '#4A4844',
      700: '#2B2A28',
      800: '#1B1A1E',
      900: '#111014',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
  },
};
