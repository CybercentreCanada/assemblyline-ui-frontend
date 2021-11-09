import {
  Button,
  CssBaseline,
  makeStyles,
  Paper,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import useAppTheme, { AppThemeProps } from 'commons/components/hooks/useAppTheme';
import { SnackbarProvider } from 'notistack';
import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { GiMineExplosion } from 'react-icons/gi';
import PageCenter from '../layout/pages/PageCenter';

//
interface AppbarStyles {
  color: string;
  backgroundColor: string;
  elevation: number;
}

// Specification interface of the component properties.
interface AppProviderProps {
  children: React.ReactNode;
  colors: AppThemeProps;
  defaultTheme: 'light' | 'dark';
  defaultContext?: any;
}

// Specification interface of the contex provider.
export interface AppContextProps {
  context?: any;
  theme: 'light' | 'dark';
  colors: AppThemeProps;
  isDarkTheme: boolean;
  isLightTheme: boolean;
  toggleTheme: () => void;
  setContext: (context: any) => void;
  getAppbarStyles: (currentLayout: 'side' | 'top') => AppbarStyles;
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

const useStyles = makeStyles(theme => ({
  snackroot: {
    [theme.breakpoints.only('xs')]: { wordBreak: 'break-word' }
  }
}));

function ErrorFallback({ error, resetErrorBoundary }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <div role="alert">
      <CssBaseline />
      <PageCenter width={isXS ? '100%' : '70%'} margin={4}>
        <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
          <GiMineExplosion fontSize="inherit" />
        </div>
        <Typography variant={downSM ? 'h4' : 'h3'} gutterBottom>
          {t('error.title')}
        </Typography>
        <Typography variant={downSM ? 'body1' : 'h6'} gutterBottom>
          {t('error.description')}
        </Typography>
        <Paper
          component="pre"
          variant="outlined"
          style={{
            padding: theme.spacing(2),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: downSM ? theme.spacing(8) : theme.spacing(16),
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {error.message}
        </Paper>
        <Button onClick={resetErrorBoundary} style={{ margin: theme.spacing(4) }} color="primary">
          {t('error.button')}
        </Button>
      </PageCenter>
    </div>
  );
}

// Implementation of the AppContext provider component.
// This should be the root application component renderered by the index.tsx into the dom element-id 'root'
const AppContextProvider: React.FC<AppProviderProps> = ({ defaultTheme, colors, defaultContext, children }) => {
  // Application provided context.
  const [context, setContext] = useState<any>(defaultContext);
  const classes = useStyles();

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

  // Compute appbar styles for specified layout.
  const getAppbarStyles = (layout: 'side' | 'top'): AppbarStyles => {
    const isTopLayout = layout === 'top';
    const isDarkTheme = theme === 'dark';
    const isLightTheme = theme === 'light';

    // Compute background color.
    let backgroundColor = isTopLayout ? appTheme.palette.primary.dark : appTheme.palette.background.default;
    if (isTopLayout) {
      if (isDarkTheme && colors.appbar?.sticky?.dark) {
        backgroundColor = colors.appbar.sticky.dark.backgroundColor;
      }
      if (isLightTheme && colors.appbar?.sticky?.light) {
        backgroundColor = colors.appbar.sticky.light.backgroundColor;
      }
    }

    // Compute elevation.
    const elevation = isTopLayout
      ? colors.appbar?.sticky?.elevation !== undefined
        ? colors.appbar?.sticky?.elevation
        : 2
      : 0;

    // Wrap it up and send-it!
    return {
      color: appTheme.palette.getContrastText(backgroundColor),
      backgroundColor,
      elevation
    };
  };

  // Initialize app context provider, theme, snackbar and render children component.
  // Snackbar needs to be rendered as child of theme provider.  CSS glitches ensues if not the case.
  return (
    <AppContext.Provider
      value={{
        context,
        theme,
        colors,
        isDarkTheme: theme === 'dark',
        isLightTheme: theme === 'light',
        toggleTheme,
        setContext,
        getAppbarStyles
      }}
    >
      <ThemeProvider theme={appTheme}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            window.location.reload();
          }}
        >
          <SnackbarProvider classes={{ root: classes.snackroot }}>{children}</SnackbarProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default AppContextProvider;
