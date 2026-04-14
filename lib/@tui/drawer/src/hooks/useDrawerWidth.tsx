import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAppDrawer } from './useAppDrawer';

export const useDrawerWidth = () => {
  const drawer = useAppDrawer();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return useMemo(() => {
    const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));
    const desktopMaxWidth = Math.max(320, windowWidth - 96);
    const maximizedWidth = Math.min(windowWidth * 0.85, windowWidth - 32);

    let minimizedWidth = 300;

    // full width mobile
    if (isXs || isSm) {
      return { maximizedWidth: windowWidth, minimizedWidth: windowWidth };
    }

    // user specified.
    if (drawer.width) {
      minimizedWidth = drawer.width;
    }

    // medium screen
    else if (isMd) {
      minimizedWidth = Math.min(550, desktopMaxWidth);
    }

    // large breakpoint
    else if (isLg) {
      minimizedWidth = Math.min(clamp(600, windowWidth * 0.42, 680), desktopMaxWidth);
    }

    // extra-large screen
    else if (isXl) {
      minimizedWidth = Math.min(clamp(680, windowWidth * 0.45, 760), desktopMaxWidth);
    }

    return { maximizedWidth, minimizedWidth };
  }, [windowWidth, drawer.width, isLg, isMd, isSm, isXl, isXs]);
};
