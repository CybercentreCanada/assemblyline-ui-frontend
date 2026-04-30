// import { createAppStore } from 'features/store/createAppStore';
// import React, { PropsWithChildren, useCallback } from 'react';
// import { AppNotificationsStore, DEFAULT_NOTIFICATIONS_STORE } from './notifications.models';

// //*****************************************************************************************
// // App Notifications Store Provider
// //*****************************************************************************************
// export const {
//   StoreProvider: AppNotificationsStoreProvider,
//   useStore: useAppNotificationsStore,
//   useSetStore: useAppNotificationsSetStore
// } = createAppStore<AppNotificationsStore>(DEFAULT_NOTIFICATIONS_STORE);

// AppNotificationsStoreProvider.displayName = 'AppNotificationsStoreProvider';

// //*****************************************************************************************
// // App Notifications Store Sync
// //*****************************************************************************************
// export const AppNotificationsStoreSync = React.memo(({ children }: PropsWithChildren) => {
//   const reset = useCallback((store: AppNotificationsStore) => store, []);

//   return <AppNotificationsStoreProvider data={reset}>{children}</AppNotificationsStoreProvider>;
// });

// AppNotificationsStoreSync.displayName = 'AppNotificationsStoreSync';

// //*****************************************************************************************
// // App Notifications Provider
// //*****************************************************************************************

// export const AppNotificationsProvider = React.memo(({ children }: PropsWithChildren) => (
//   <AppNotificationsStoreSync>{children}</AppNotificationsStoreSync>
// ));

// AppNotificationsProvider.displayName = 'AppNotificationsProvider';
