import { AppConfig, DEFAULT_APP_CONFIG } from 'app/app.configs';
import React, { PropsWithChildren, useCallback } from 'react';
import { useStore as useZustandStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { createStore } from 'zustand/vanilla';

type StorePatch = Partial<AppConfig> | ((state: AppConfig) => Partial<AppConfig>);

// const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const APP_CONFIG_STORE = createStore<AppConfig>()(devtools(() => ({ ...DEFAULT_APP_CONFIG })));

// const useHydrateAppConfigStore = () => {
//   const [hasHydrated, setHasHydrated] = useState<boolean>(false);

//   useEffect(() => {
//     if (hasHydrated || !isBrowser()) return;

//     try {
//       const settings = loadSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY);
//       APP_CONFIG_STORE.setState(store => deepmerge(store, settings as Partial<AppConfig>) as AppConfig);
//     } catch (err) {
//       console.warn(err);
//     }

//     setHasHydrated(true);
//   }, []);

//   return hasHydrated;
// };

export const useAppConfig = <T,>(selector: (state: AppConfig) => T): T =>
  useZustandStore(APP_CONFIG_STORE, useShallow(selector));

export const useAppSetConfig = () =>
  useCallback((patch: StorePatch) => {
    APP_CONFIG_STORE.setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

//*****************************************************************************************
// App Config Provider
//*****************************************************************************************
export const AppConfigProvider = React.memo(({ children }: PropsWithChildren) => {
  // const hasHydrated = useHydrateAppConfigStore();

  return <>{!true ? null : children}</>;
});

AppConfigProvider.displayName = 'AppConfigProvider';
