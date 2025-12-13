import { useState, useMemo } from 'react';
import { extendTheme, ChakraProvider } from '@chakra-ui/react';
import baseTheme from '../theme';
import { COLOR_SCHEMES } from '../theme/colorSchemes';
import { deriveThemeColorsFromScheme } from '../theme/deriveThemeColors';
import { ThemeContext } from './ThemeContext';

const DEFAULT_SCHEME = 'monet';

export const AppThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(() => {
    const saved = localStorage.getItem('app_color_scheme');
    if (saved && COLOR_SCHEMES[saved]) {
      return saved;
    }
    return DEFAULT_SCHEME;
  });

  const currentTheme = useMemo(() => {
    const scheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES[DEFAULT_SCHEME];

    // 从 palette 派生 Chakra 需要的色阶（brand/accent），并同时注入原始 palette
    const themeColors = deriveThemeColorsFromScheme(scheme);

    // Ensure derived scheme colors override base theme defaults.
    return extendTheme(baseTheme, { colors: themeColors });
  }, [colorScheme]);

  const changeColorScheme = (scheme) => {
    if (COLOR_SCHEMES[scheme]) {
      setColorScheme(scheme);
      localStorage.setItem('app_color_scheme', scheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, changeColorScheme, schemes: COLOR_SCHEMES }}>
      <ChakraProvider theme={currentTheme}>
        {children}
      </ChakraProvider>
    </ThemeContext.Provider>
  );
};
