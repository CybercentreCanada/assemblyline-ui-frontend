import { createStoreContext } from 'features/store/createStoreContext';
import React from 'react';
import { AppConfigStore } from './config.models';

//*****************************************************************************************
// RouterProvider
//*****************************************************************************************

const createDefaultAppConfigStore = (): AppConfigStore => ({ theme: 'dark' });

export const { StoreProvider: AppConfigStoreProvider, useStore: useAppConfigStore } =
  createStoreContext<AppConfigStore>(createDefaultAppConfigStore());

export type AppConfigProviderProps = {
  children: React.ReactNode;
};

export const AppConfigProvider = React.memo(({ children }: AppConfigProviderProps) => {
  return <AppConfigStoreProvider data={{}}>{children}</AppConfigStoreProvider>;
});

AppConfigStoreProvider.displayName = 'AppConfigStoreProvider';
