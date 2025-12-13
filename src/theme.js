import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
  // Theme toggle changes a lot of colors at once. Animating *everything* causes
  // heavy repaint/reflow and feels janky, especially with blur/backdrop-filter.
  disableTransitionOnChange: true,
};

const colors = {
  brand: {
    50: '#EBF4FF',
    100: '#C3DAFE',
    200: '#A3BFFA',
    300: '#7F9CF5',
    400: '#667EEA',
    500: '#5A67D8', // Primary Indigo
    600: '#4C51BF',
    700: '#434190',
    800: '#2C276B',
    900: '#1A1638',
  },
  accent: {
    500: '#FF6B6B', // Coral
  },
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode('#F7F9FC', '#0F1117')(props), // Warm white / Deep dark
      color: mode('gray.800', 'gray.100')(props),
      transitionProperty: 'background-color, border-color, color',
      transitionDuration: '0.25s',
      transitionTimingFunction: 'ease-in-out',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: '12px',
    },
    variants: {
      solid: (props) => ({
        bg: mode('brand.500', 'brand.300')(props),
        color: mode('white', 'gray.900')(props),
        _hover: {
          bg: mode('brand.600', 'brand.400')(props),
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          transform: 'translateY(0)',
        },
      }),
    },
  },
  Container: {
    baseStyle: {
      maxW: 'container.xl',
    },
  },
};

const theme = extendTheme({ config, colors, styles, components });

export default theme;
