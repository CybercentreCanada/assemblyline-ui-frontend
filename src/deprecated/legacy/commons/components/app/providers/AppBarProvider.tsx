import { AppStorageKeys } from 'deprecated/legacy/commons/components/app/AppConstants';
import { AppBarContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import type { AppSearchService } from 'deprecated/legacy/commons/components/app/AppSearchService';
import { useAppConfigs } from 'deprecated/legacy/commons/components/app/hooks';
import AppQuickSearchProvider from 'deprecated/legacy/commons/components/app/providers/AppQuickSearchProvider';
import AppSwitcherProvider from 'deprecated/legacy/commons/components/app/providers/AppSwitcherProvider';
import useLocalStorageItem from 'deprecated/legacy/commons/components/utils/hooks/useLocalStorageItem';
import { type ReactElement, useMemo, useState } from 'react';

const { LS_KEY_AUTOHIDE_APPBAR } = AppStorageKeys;

type AppTopNavProviderProps = {
  search?: AppSearchService;
  children: ReactElement | ReactElement[];
};

export default function AppBarProvider({ search, children }: AppTopNavProviderProps) {
  const configs = useAppConfigs();
  const [show, setShow] = useState<boolean>(true);
  const [autoHide, setAutoHide] = useLocalStorageItem<boolean>(
    LS_KEY_AUTOHIDE_APPBAR,
    configs.preferences.defaultAutoHideAppbar
  );
  const context = useMemo(
    () => ({
      show,
      autoHide: configs.preferences.allowAutoHideTopbar && autoHide,
      setShow,
      setAutoHide,
      toggleAutoHide: () => setAutoHide(!autoHide)
    }),
    [configs.preferences.allowAutoHideTopbar, show, autoHide, setAutoHide]
  );
  return (
    <AppBarContext.Provider value={context}>
      <AppSwitcherProvider>
        <AppQuickSearchProvider search={search}>{children}</AppQuickSearchProvider>
      </AppSwitcherProvider>
    </AppBarContext.Provider>
  );
}
