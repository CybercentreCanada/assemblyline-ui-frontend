import useLocalStorageItem from 'deprecated/legacy/commons/components/utils/hooks/useLocalStorageItem';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type AppLeftNavElement } from 'deprecated/legacy/commons/components/app/AppConfigs';
import { AppStorageKeys } from 'deprecated/legacy/commons/components/app/AppConstants';
import { AppLeftNavContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import { useAppConfigs } from 'deprecated/legacy/commons/components/app/hooks';

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
