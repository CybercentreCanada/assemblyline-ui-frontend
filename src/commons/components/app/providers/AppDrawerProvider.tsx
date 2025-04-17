import { useMediaQuery } from '@mui/material';
import {
  AppDrawerContext,
  AppDrawerElementContext,
  type AppDrawerMode,
  type AppDrawerOpenProps
} from 'commons/components/app/AppContexts';
import { useCallback, useMemo, useState, type FC, type PropsWithChildren, type ReactElement } from 'react';

type AppDrawerState = Omit<AppDrawerOpenProps, 'element' | 'mode'> & { open: boolean };

export const AppDrawerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AppDrawerState>({ id: null, open: false, width: '45vw', floatThreshold: 1200 });
  const [element, setElement] = useState<ReactElement>(null);
  const [maximized, setMaximized] = useState<boolean>(false);
  const [mode, setMode] = useState<AppDrawerMode>('float');
  const isFloatThreshold = useMediaQuery(`(max-width: ${state.floatThreshold}px)`);

  const open = useCallback((props: AppDrawerOpenProps) => {
    const { element: newElement, mode: newMode, ...newProps } = props;
    setState(_state => ({ ...{ ..._state, ...newProps }, open: true }));
    setElement(_element => newElement || _element);
    setMode(_mode => newMode || _mode);
  }, []);

  const close = useCallback(() => {
    setState(_state => {
      if (_state?.onClose) {
        _state?.onClose();
      }
      return { ..._state, open: false };
    });
    setMaximized(false);
  }, []);

  const drawerContextValue = useMemo(
    () => ({
      id: state.id,
      width: state.width,
      isOpen: state.open,
      enableClickAway: state.enableClickAway !== undefined ? state.enableClickAway : mode === 'float',
      mode,
      maximized,
      isFloatThreshold,
      open,
      close,
      setWidth: (width: number | string) => setState(_state => ({ ..._state, width })),
      setMode,
      setMaximized
    }),
    [mode, maximized, state.id, state.width, state.open, state.enableClickAway, isFloatThreshold, open, close]
  );

  return (
    <AppDrawerContext.Provider value={drawerContextValue}>
      <AppDrawerElementContext.Provider value={element}>{children}</AppDrawerElementContext.Provider>
    </AppDrawerContext.Provider>
  );
};
