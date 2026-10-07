import { AppStorageKeys } from 'core/template/components/app/AppConstants';
import { AppQuickSearchContext } from 'core/template/components/app/AppContexts';
import { type AppSearchService } from 'core/template/components/app/AppSearchService';
import { useAppConfigs } from 'core/template/components/app/hooks';
import AppSearchServiceProvider from 'core/template/components/app/providers/AppSearchServiceProvider';
import useLocalStorageItem from 'core/template/components/utils/hooks/useLocalStorageItem';
import { type ReactElement, useMemo } from 'react';

const { LS_KEY_SHOW_QUICK_SEARCH } = AppStorageKeys;

type AppQuickSearchProviderProps = {
  search?: AppSearchService;
  children: ReactElement | ReactElement[];
};

export default function AppQuickSearchProvider({ search, children }: AppQuickSearchProviderProps) {
  const { preferences } = useAppConfigs();
  const [show, setShow] = useLocalStorageItem(LS_KEY_SHOW_QUICK_SEARCH, preferences.defaultShowQuickSearch);
  const context = useMemo(
    () => ({
      show: preferences.allowQuickSearch && show,
      setShow,
      toggle: () => setShow(!show)
    }),
    [preferences.allowQuickSearch, show, setShow]
  );
  return (
    <AppQuickSearchContext.Provider value={context}>
      <AppSearchServiceProvider service={search}>{children}</AppSearchServiceProvider>
    </AppQuickSearchContext.Provider>
  );
}
