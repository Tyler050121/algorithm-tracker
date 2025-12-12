import { useState, useMemo } from 'react';
import { extendTheme, ChakraProvider } from '@chakra-ui/react';
import baseTheme from '../theme';
import { COLOR_SCHEMES } from '../theme/colorSchemes';
import { ThemeContext } from './ThemeContext';

const DEFAULT_SCHEME = 'ocean';

export const AppThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(() => {
    const saved = localStorage.getItem('app_color_scheme');
    // Validate that the saved scheme actually exists
    if (saved && COLOR_SCHEMES[saved]) {
      return saved;
    }
    return DEFAULT_SCHEME;
  });

  const currentTheme = useMemo(() => {
    // Fallback to default if somehow the state is invalid
    const scheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES[DEFAULT_SCHEME];
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
