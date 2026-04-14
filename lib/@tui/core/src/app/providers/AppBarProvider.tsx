import { type FC, type PropsWithChildren, useMemo, useState } from 'react';
import { useCookiesStore } from '../../cookies/hooks/useCookiesStore';
import type { AppSearchService } from '../../search/AppSearchService';
import { AppBarContext } from '../AppContexts';
import { useAppPreferences } from '../hooks';
import AppQuickSearchProvider from '../providers/AppQuickSearchProvider';

type AppTopNavProviderProps = PropsWithChildren & {
  search?: AppSearchService;
};

const AppBarProvider: FC<AppTopNavProviderProps> = ({ search, children }: AppTopNavProviderProps) => {
  const { allowAutoHideTopbar } = useAppPreferences();

  const [show, setShow] = useState<boolean>(true);

  const autoHide = useCookiesStore(state => {
    return allowAutoHideTopbar && state.autoHideAppbar;
  });

  const setAutoHide = useCookiesStore(state => state.setAutoHideAppbar);

  const context = useMemo(
    () => ({
      initialized: true,
      show,
      autoHide,
      setShow,
      setAutoHide,
      toggleAutoHide: () => setAutoHide(!autoHide)
    }),
    [show, autoHide, setAutoHide]
  );
  return (
    <AppBarContext.Provider value={context}>
      <AppQuickSearchProvider search={search}>{children}</AppQuickSearchProvider>
    </AppBarContext.Provider>
  );
};

export default AppBarProvider;
