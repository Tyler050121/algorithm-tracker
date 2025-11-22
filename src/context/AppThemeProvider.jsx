import { useState, useMemo } from 'react';
import { extendTheme, ChakraProvider } from '@chakra-ui/react';
import baseTheme from '../theme';
import { COLOR_SCHEMES } from '../theme/colorSchemes';
import { ThemeContext } from './ThemeContext';

export const AppThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('app_color_scheme') || 'indigo';
  });

  const currentTheme = useMemo(() => {
    const scheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.indigo;
    return extendTheme(
      { colors: scheme.colors },
      baseTheme
    );
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
