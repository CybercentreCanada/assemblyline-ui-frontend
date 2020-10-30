import { ThemeProvider, useMediaQuery } from '@material-ui/core';
import useAppTheme, { AppThemeColorProps } from 'commons/components/hooks/useAppTheme';
import { SnackbarProvider } from 'notistack';
import React, { useState } from 'react';

// Specification interface of the component properties.
interface AppProviderProps {
  children: React.ReactNode;
  colors: AppThemeColorProps;
  defaultTheme: 'light' | 'dark';
  defaultContext?: any;
}

// Specification interface of the contex provider.
export interface AppContextProps {
  context?: any;
  theme: 'light' | 'dark';
  isDarkTheme: boolean;
  isLightTheme: boolean;
  toggleTheme: () => void;
  setContext: (context: any) => void;
}

// React context instantiation.
export const AppContext = React.createContext<AppContextProps>(null);

// Figure what the initial theme to use.
const getInitialTheme = (defaultTheme, prefersDarkMode) => {
  // Figure out initial theme.
  let initialTheme;
  const storedDarkMode = localStorage.getItem('darkMode');
  const darkMode = storedDarkMode ? !!JSON.parse(storedDarkMode) : null;
  if (darkMode !== null && darkMode === true) {
    initialTheme = 'dark' as 'dark';
  } else if (darkMode !== null && darkMode === false) {
    initialTheme = 'light' as 'light';
  } else if (prefersDarkMode) {
    initialTheme = 'dark' as 'dark';
  } else {
    initialTheme = defaultTheme;
  }
  return initialTheme;
};

// Implementation of the AppContext provider component.
// This should be the root application component renderered by the index.tsx into the dom element-id 'root'
const AppContextProvider: React.FC<AppProviderProps> = ({ defaultTheme, colors, defaultContext, children }) => {
  // Application provided context.
  const [context, setContext] = useState<any>(defaultContext);

  // Theme state.
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme(defaultTheme, prefersDarkMode));

  // Theme toggle handler.
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('darkMode', JSON.stringify(newTheme === 'dark'));
    setTheme(newTheme);
  };

  // Build the theme.
  const [appTheme] = useAppTheme(theme === 'dark', colors);

  // Initialize app context provider, theme, snackbar and render children component.
  // Snackbar needs to be rendered as child of theme provider.  CSS glitches ensues if not the case.
  return (
    <AppContext.Provider
      value={{
        context,
        theme,
        toggleTheme,
        setContext,
        isDarkTheme: theme === 'dark',
        isLightTheme: theme === 'light'
      }}
    >
      <ThemeProvider theme={appTheme}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default AppContextProvider;
