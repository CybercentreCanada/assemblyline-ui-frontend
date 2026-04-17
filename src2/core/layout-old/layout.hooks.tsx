import { useAppSetConfig } from 'core/config';
import { useAppLeftMenuItems } from 'core/layout';
import { useCallback, useEffect } from 'react';
import { AppLayoutLeftNav, AppLayoutQuickSearch } from './layout.config';
import {
  initializeLeftNavItems,
  setLeftNavOpen,
  setQuickSearchShow,
  toggleLeftNavOpen,
  toggleQuickSearchShow
} from './layout.utils';

export const useBuildLayout = () => {
  const setConfig = useAppSetConfig();
  const menu = useAppLeftMenuItems();

  useEffect(() => {
    setConfig(s => initializeLeftNavItems(s, menu));
  }, [menu]);
};

export const useAppLayoutUtils = () => {
  const setConfig = useAppSetConfig();

  return {
    // App Quick Search
    toggleQuickSearchShow: useCallback(() => setConfig(s => toggleQuickSearchShow(s)), [setConfig]),

    setQuickSearchShow: useCallback(
      (show: AppLayoutQuickSearch['show']) => setConfig(s => setQuickSearchShow(s, show)),
      [setConfig]
    ),

    // App Layout Settings & Config
    setLeftNavOpen: useCallback(
      (open: AppLayoutLeftNav['open']) => setConfig(s => setLeftNavOpen(s, open)),
      [setConfig]
    ),

    toggleLeftNavOpen: useCallback(() => setConfig(s => toggleLeftNavOpen(s)), [setConfig])
  };
};

//*****************************************************************************************
// App Layout Settings & Config
//*****************************************************************************************

export const useSetTopBarShow = () => {
  const setConfig = useAppSetConfig();
  return useCallback(
    (show: boolean) =>
      setConfig(s => {
        if (!s.layout.topbar) s.layout.topbar = { show: true, autoHide: false };
        s.layout.topbar.show = show;
        return s;
      }),
    [setConfig]
  );
};

export const useSetTopBarAutoHide = () => {
  const setConfig = useAppSetConfig();
  return useCallback(
    (autoHide: boolean) =>
      setConfig(s => {
        if (!s.layout.topbar) s.layout.topbar = { show: true, autoHide: false };
        s.layout.topbar.autoHide = autoHide;
        return s;
      }),
    [setConfig]
  );
};

export const useToggleTopBarAutoHide = () => {
  const setConfig = useAppSetConfig();
  return useCallback(
    () =>
      setConfig(s => {
        if (!s.layout.topbar) s.layout.topbar = { show: true, autoHide: false };
        s.layout.topbar.autoHide = !s.layout.topbar.autoHide;
        return s;
      }),
    [setConfig]
  );
};

export const useToggleLayoutMode = () => {
  const setConfig = useAppSetConfig();
  return useCallback(
    () =>
      setConfig(s => {
        const nextMode = s.layout.mode === 'side' ? 'top' : 'side';
        s.layout.mode = nextMode;
        s.layout.current = nextMode;
        return s;
      }),
    [setConfig]
  );
};

export const useSetLayoutReady = () => {
  const setConfig = useAppSetConfig();
  return useCallback(
    (ready: boolean) =>
      setConfig(s => {
        s.layout.ready = ready;
        return s;
      }),
    [setConfig]
  );
};
