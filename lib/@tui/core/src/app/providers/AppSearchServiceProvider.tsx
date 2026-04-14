import { type PropsWithChildren, useMemo, useState } from 'react';
import type { AppSearchService } from '../../search/AppSearchService';
import { AppSearchServiceContext, type AppSearchServiceContextType, type AppSearchServiceState } from '../AppContexts';
import { useAppPreferences } from '../hooks';
import { useAppRouter } from '../hooks/useAppRouter';

const DEFAULT_CONTEXT: AppSearchServiceContextType = {
  initialized: false,
  provided: false,
  service: {
    itemRenderer: () => <div />
  },
  state: {
    searching: false,
    menu: false,
    mode: 'inline',
    items: null,
    set: () => null
  }
};

type AppSearchServiceProviderProps<T> = PropsWithChildren & {
  service?: AppSearchService<T>;
};

const AppSearchServiceProvider = <T = any,>({ service, children }: AppSearchServiceProviderProps<T>) => {
  const { navigate } = useAppRouter();
  const { topnav } = useAppPreferences();

  // Default implementation of the AppSearchService using configuration preferences.
  const defaultService: AppSearchService<any> = useMemo(() => {
    const searchUri = topnav.quickSearchURI;
    const params = topnav.quickSearchParam;
    return {
      onEnter: (value: string) => {
        navigate(`${searchUri}?${params}=${encodeURIComponent(value)}`);
      },
      itemRenderer: () => <div />
    };
  }, [topnav, navigate]);

  // The state of the search service.
  const [state, setState] = useState<AppSearchServiceState<T>>(DEFAULT_CONTEXT.state);

  // Memoize context value to prevent unnecessary renders.
  const context = useMemo(
    () => ({
      initialized: true,
      provided: !!service,
      service: service || defaultService,
      state: {
        ...state,
        set: setState
      }
    }),
    [service, defaultService, state]
  );

  return <AppSearchServiceContext.Provider value={context}>{children}</AppSearchServiceContext.Provider>;
};

export default AppSearchServiceProvider;
