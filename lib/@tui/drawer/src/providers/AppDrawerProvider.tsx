import { useMediaQuery } from '@mui/material';
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
  type ReactElement
} from 'react';

//
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Specification interface of the AppDrawerProvider props.
export type AppDrawerToolbarProps = {
  onCloseClick?: () => void; // callback for when the toolbar close button is clicked.
  slots?: {
    left?: ReactElement[]; // the react element to render in the left side of the drawer toolbar.
    right?: ReactElement[]; // the react element to render in the right side of the drawer toolbar.
  };
};

// Specification interface of the AppDrawer's 'open' method arguments object.
export type AppDrawerOpenProps = {
  id: string; // unique identifier to identify the currently render drawer element.
  element: ReactElement; // the react element to render in the app drawer.
  width?: number; // the width of the app drawer.
  expandable?: boolean; // indicates if the drawer can be expanded [defaults to 'true'].
  mode?: AppDrawerMode; // indicates if the drawer should float over the content area, or be pinned.
  floatThreshold?: number; // the view-port width at which the app drawer will float over the app content.
  enableClickAway?: boolean; // close the drawer when clicking away from the drawer container.
  toolbar?: AppDrawerToolbarProps; // the configuration for the drawer toolbar, if not provided the drawer will not render a toolbar.
  onClose?: () => void; // callback for when the drawer closes.
};

// Type definition of the app drawer mode property.
export type AppDrawerMode = 'float' | 'pin';

// Drawer context provider specification.
export type AppDrawerContextType = {
  id?: string; // the id of the drawer element currently set in the provider.
  isOpen?: boolean; // indicates whether the drawer is open or close.
  isFloatThreshold?: boolean; // indicates if we've surpassed the floatThreshold.
  expandable?: boolean; // indicates if the drawer can be expanded [defaults to 'true'].
  width?: number; // the width of the drawer.
  maximized?: boolean; // indicates if the drawer is floating over content.
  mode: AppDrawerMode; // indicates if the drawer should float over the content area, or be pinned.
  enableClickAway?: boolean; // close the drawer when clicking away from the drawer container.
  toolbar?: AppDrawerToolbarProps; // the configuration for the drawer toolbar, if not provided the drawer will not render a toolbar.
  open: (props: AppDrawerOpenProps) => void; // open the drawer function.
  close: () => void; // close the drawer function.
  setWidth: (width: number) => void; // set the with (when no floating)
  setMaximized: (maximized: boolean) => void; // indicate whether or not to float the drawer over the content area.
  setMode: (mode: AppDrawerMode) => void; // set the mode of the app drawer.
  setElement: (element: ReactElement | null) => void;
};

// React Context for the AppDrawerProvider.
export const AppDrawerContext = createContext<AppDrawerContextType | null>(null);

// React Context for the AppDrawerElementProvider.
export const AppDrawerElementContext = createContext<ReactElement | null>(null);

// Drawer state specification.
type AppDrawerState = MakeOptional<Omit<AppDrawerOpenProps, 'element' | 'mode'>, 'id'> & { open: boolean };

export const AppDrawerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AppDrawerState>({ open: false, floatThreshold: 1600, expandable: true });
  const [element, setElement] = useState<ReactElement | null>(null);
  const [maximized, setMaximized] = useState<boolean>(false);
  const [mode, setMode] = useState<AppDrawerMode>('float');
  const isFloatThreshold = useMediaQuery(`(max-width: ${state.floatThreshold}px)`);

  const open = useCallback((props: AppDrawerOpenProps) => {
    const { element: newElement, mode: newMode, ...newProps } = props;
    setState(_state => ({ ...{ ..._state, ...newProps }, open: true }));
    setElement(newElement);
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
      mode,
      maximized,
      isFloatThreshold,
      id: state.id,
      width: state.width,
      isOpen: state.open,
      enableClickAway: state.enableClickAway !== undefined ? state.enableClickAway : mode === 'float',
      expandable: !!state.expandable,
      toolbar: state.toolbar,
      open,
      close,
      setWidth: (width: number) => setState(_state => ({ ..._state, width })),
      setMode,
      setMaximized,
      setElement
    }),
    [
      mode,
      maximized,
      isFloatThreshold,
      state.id,
      state.width,
      state.open,
      state.enableClickAway,
      state.expandable,
      state.toolbar,
      open,
      close
    ]
  );

  return (
    <AppDrawerContext.Provider value={drawerContextValue}>
      <AppDrawerElementContext.Provider value={element}>{children}</AppDrawerElementContext.Provider>
    </AppDrawerContext.Provider>
  );
};
