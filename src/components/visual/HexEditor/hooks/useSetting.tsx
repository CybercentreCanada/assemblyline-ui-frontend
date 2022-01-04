import { default as React, useContext, useMemo } from 'react';
import { HexProps } from '..';

export type SettingContextProps = {};

export const SettingContext = React.createContext<SettingContextProps>(null);

export const WrappedSettingProvider = ({ children }: HexProps) => {
  return <SettingContext.Provider value={{}}>{useMemo(() => children, [children])}</SettingContext.Provider>;
};

export const SettingProvider = React.memo(WrappedSettingProvider);
export const useSetting = (): SettingContextProps => useContext(SettingContext) as SettingContextProps;
