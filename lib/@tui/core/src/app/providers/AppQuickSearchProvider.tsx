import { type FC, type PropsWithChildren, useMemo } from 'react';
import { useCookiesStore } from '../../cookies/hooks/useCookiesStore';
import { type AppSearchService } from '../../search/AppSearchService';
import { AppQuickSearchContext } from '../AppContexts';
import { useAppPreferences } from '../hooks';
import AppSearchServiceProvider from './AppSearchServiceProvider';

type AppQuickSearchProviderProps = PropsWithChildren & {
  search?: AppSearchService;
};

const AppQuickSearchProvider: FC<AppQuickSearchProviderProps> = ({ search, children }) => {
  const { allowQuickSearch } = useAppPreferences();

  const show = useCookiesStore(state => allowQuickSearch && state.showQuickSearch);

  const setShow = useCookiesStore(state => state.setShowQuickSearch);

  const context = useMemo(
    () => ({
      initialized: true,
      show,
      setShow,
      toggle: () => setShow(!show)
    }),
    [show, setShow]
  );

  return (
    <AppQuickSearchContext.Provider value={context}>
      <AppSearchServiceProvider service={search}>{children}</AppSearchServiceProvider>
    </AppQuickSearchContext.Provider>
  );
};

export default AppQuickSearchProvider;
