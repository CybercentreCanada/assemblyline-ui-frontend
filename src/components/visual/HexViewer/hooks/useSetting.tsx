import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useLayout, useStore } from '..';

export type SettingValue = {
  columns?: string;
};

export type SettingValues = {
  columns?: Array<string>;
};

export type SettingContextProps = {
  nextSettingsOpen?: React.MutableRefObject<boolean>;
  nextSettingValue?: React.MutableRefObject<SettingValue>;
  nextSettingValues?: React.MutableRefObject<SettingValues>;
  settingColumns?: Array<string>;
  onSettingOpen?: () => void;
  onSettingClose?: () => void;
  onSettingLoad?: () => void;
  onSettingSave?: () => void;
  onSettingColumnsChange?: (value: string) => void;
};

export const SettingContext = React.createContext<SettingContextProps>(null);

export const WrappedSettingProvider = ({ children }: HexProps) => {
  const { setSettingsOpen } = useStore();
  const { nextLayoutAutoColumns, onLayoutColumnsChange, onLayoutResize } = useLayout();

  const nextSettingsOpen = useRef<boolean>(false);
  const nextSettingValue = useRef<SettingValue>({
    columns: 'auto'
  });
  const nextSettingValues = useRef<SettingValues>({
    columns: ['auto', '2', '4', '8', '12', '16', '20', '24', '32', '48', '64', '80', '96', '112', '128']
  });

  const onSettingOpen = useCallback(() => {
    nextSettingsOpen.current = true;
    setSettingsOpen(true);
  }, [setSettingsOpen]);

  const onSettingClose = useCallback(() => {
    nextSettingsOpen.current = false;
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  const onSettingSave = useCallback(
    () => localStorage.setItem('hexViewer.settings', JSON.stringify(nextSettingValue.current)),
    []
  );

  const onSettingColumnsChange = useCallback(
    (value: string) => {
      if (!nextSettingValues.current.columns.includes(value)) return;
      nextSettingValue.current.columns = value;

      if (nextSettingValue.current.columns === 'auto') {
        nextLayoutAutoColumns.current = true;
        onLayoutResize();
      } else {
        nextLayoutAutoColumns.current = false;
        onLayoutColumnsChange(parseInt(nextSettingValue.current.columns));
      }
      onSettingSave();
    },
    [nextLayoutAutoColumns, onLayoutColumnsChange, onLayoutResize, onSettingSave]
  );

  const onSettingLoad = useCallback(() => {
    setSettingsOpen(nextSettingsOpen.current);

    const value = localStorage.getItem('hexViewer.settings');
    const json: SettingValue = JSON.parse(value) as SettingValue;
    if (value === null || value === '' || typeof json !== 'object') return;

    if (json.hasOwnProperty('columns')) onSettingColumnsChange(json.columns);
  }, [onSettingColumnsChange, setSettingsOpen]);

  return (
    <SettingContext.Provider
      value={{
        nextSettingsOpen,
        nextSettingValue,
        nextSettingValues,
        onSettingOpen,
        onSettingClose,
        onSettingLoad,
        onSettingSave,
        onSettingColumnsChange
      }}
    >
      {useMemo(() => children, [children])}
    </SettingContext.Provider>
  );
};

export const SettingProvider = React.memo(WrappedSettingProvider);
export const useSetting = (): SettingContextProps => useContext(SettingContext) as SettingContextProps;
