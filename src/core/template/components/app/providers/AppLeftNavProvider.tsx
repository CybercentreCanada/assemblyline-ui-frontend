import { type AppLeftNavElement } from 'core/template/components/app/AppConfigs';
import { AppStorageKeys } from 'core/template/components/app/AppConstants';
import { AppLeftNavContext } from 'core/template/components/app/AppContexts';
import { useAppConfigs } from 'core/template/components/app/hooks';
import useLocalStorageItem from 'core/template/components/utils/hooks/useLocalStorageItem';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

const { LS_KEY_LEFTNAV_OPEN } = AppStorageKeys;

type LeftNavProviderProps = {
  children: ReactNode;
};

export default function AppLeftNavProvider({ children }: LeftNavProviderProps) {
  const { preferences } = useAppConfigs();
  const [open, setOpen] = useLocalStorageItem(LS_KEY_LEFTNAV_OPEN, preferences.defaultDrawerOpen);
  const [elements, setElements] = useState<AppLeftNavElement[]>();
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const context = useMemo(
    () => ({
      open,
      elements: elements || preferences.leftnav.elements,
      setOpen,
      setElements,
      toggle
    }),
    [open, elements, preferences.leftnav.elements, setOpen, toggle]
  );
  return <AppLeftNavContext.Provider value={context}>{children}</AppLeftNavContext.Provider>;
}
