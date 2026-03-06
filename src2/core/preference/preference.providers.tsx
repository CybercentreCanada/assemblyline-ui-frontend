import { createStoreContext } from 'features/store/createStoreContext';
import React, { PropsWithChildren } from 'react';
import { APP_PREFERENCE_DEFAULTS } from './preference.defaults';
import { AppPreferenceStore } from './preference.models';

//*****************************************************************************************
// App Preference Store Provider
//*****************************************************************************************

const createDefaultAppPreferenceStore = (): AppPreferenceStore => APP_PREFERENCE_DEFAULTS;

export const { StoreProvider: AppPreferenceStoreProvider, useStore: useAppPreferenceStore } =
  createStoreContext<AppPreferenceStore>(createDefaultAppPreferenceStore());

export type AppPreferenceProviderProps = PropsWithChildren;

//*****************************************************************************************
// App Preference Provider
//*****************************************************************************************

export const AppPreferenceProvider = React.memo(({ children }: AppPreferenceProviderProps) => {
  return <AppPreferenceStoreProvider data={APP_PREFERENCE_DEFAULTS}>{children}</AppPreferenceStoreProvider>;
});

AppPreferenceStoreProvider.displayName = 'AppPreferenceStoreProvider';
