import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useLayout, useScroll, useStore } from '..';

export type SettingValues = {
  // Hex
  hexBase?: number;

  // Layout
  layoutRows?: number;
  layoutAutoRows?: boolean;
  layoutColumns?: number;
  layoutAutoColumns?: boolean;

  // Scroll
  scrollSpeed?: number;
};

export type SettingContextProps = {
  nextSettingsOpen?: React.MutableRefObject<boolean>;
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
  const { nextHexBase, onHexBaseValueChange } = useHex();
  const {
    nextLayoutRows,
    nextLayoutAutoRows,
    nextLayoutColumns,
    nextLayoutAutoColumns,
    onLayoutRowsChange,
    onLayoutAutoRowsChange,
    onLayoutColumnsChange,
    onLayoutAutoColumnsChange
  } = useLayout();
  const { nextScrollSpeed, onScrollSpeedChange } = useScroll();

  const nextSettingsOpen = useRef<boolean>(false);

  const onSettingOpen = useCallback(() => {
    nextSettingsOpen.current = true;
    setSettingsOpen(true);
  }, [setSettingsOpen]);

  const onSettingClose = useCallback(() => {
    nextSettingsOpen.current = false;
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  const onSettingSave = useCallback(
    () =>
      localStorage.setItem(
        'hexViewer.settings',
        JSON.stringify({
          // Hex
          hexBase: nextHexBase.current,

          // Layout
          layoutRows: nextLayoutRows.current,
          layoutAutoRows: nextLayoutAutoRows.current,
          layoutColumns: nextLayoutColumns.current,
          layoutAutoColumns: nextLayoutAutoColumns.current,

          // Scroll
          scrollSpeed: nextScrollSpeed.current
        })
      ),
    [nextHexBase, nextLayoutAutoColumns, nextLayoutAutoRows, nextLayoutColumns, nextLayoutRows, nextScrollSpeed]
  );

  const onSettingLoad = useCallback(() => {
    const value = localStorage.getItem('hexViewer.settings');
    const json: SettingValues = JSON.parse(value) as SettingValues;
    if (value === null || value === '' || typeof json !== 'object') return;

    // Hex
    if (json.hasOwnProperty('hexBase')) onHexBaseValueChange(json.hexBase);

    // Layout
    if (json.hasOwnProperty('layoutRows')) onLayoutRowsChange(json.layoutRows);
    if (json.hasOwnProperty('layoutAutoRows')) onLayoutAutoRowsChange(json.layoutAutoRows);
    if (json.hasOwnProperty('layoutColumns')) onLayoutColumnsChange(json.layoutColumns);
    if (json.hasOwnProperty('layoutAutoColumns')) onLayoutAutoColumnsChange(json.layoutAutoColumns);

    // Scroll
    if (json.hasOwnProperty('scrollSpeed')) onScrollSpeedChange(json.scrollSpeed);
  }, [
    onHexBaseValueChange,
    onLayoutAutoColumnsChange,
    onLayoutAutoRowsChange,
    onLayoutColumnsChange,
    onLayoutRowsChange,
    onScrollSpeedChange
  ]);

  return (
    <SettingContext.Provider
      value={{
        nextSettingsOpen,
        onSettingOpen,
        onSettingClose,
        onSettingLoad,
        onSettingSave
      }}
    >
      {useMemo(() => children, [children])}
    </SettingContext.Provider>
  );
};

export const SettingProvider = React.memo(WrappedSettingProvider);
export const useSetting = (): SettingContextProps => useContext(SettingContext) as SettingContextProps;
