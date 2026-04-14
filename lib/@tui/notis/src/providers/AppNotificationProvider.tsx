import { createContext, useMemo, useState, type FC, type PropsWithChildren, type ReactElement } from 'react';
import type { AppNotificationService } from '../AppNotificationService';

//NotificationState is only used if feedUrls is empty
export type AppNotificationServiceState = {
  urls: string[]; // The feed urls
  set: (state: AppNotificationServiceState) => void; // Update the feed urls from the state
};

export type AppNotificationServiceContextType = {
  provided: boolean; // has a search service been provided? - if false, then it means the default service is being used.
  service: AppNotificationService; // the search service implementation to use.
  state: AppNotificationServiceState; // the state of the search service.
};

// React Context for the AppNotificationServiceProvider.
export const AppNotificationServiceContext = createContext<AppNotificationServiceContextType>(null);

const DEFAULT_CONTEXT: AppNotificationServiceContextType = {
  provided: false,
  service: {
    feedUrls: [],
    notificationRenderer: null
  },
  state: { urls: [], set: () => null }
};

type AppNotificationServiceProviderProps = PropsWithChildren & {
  service?: AppNotificationService;
};

export const AppNotificationServiceProvider: FC<AppNotificationServiceProviderProps> = ({
  service,
  children
}: {
  service?: AppNotificationService;
  children: ReactElement | ReactElement[];
}) => {
  // Default implementation of the AppNotificationService using configuration preferences.
  const defaultService: AppNotificationService = useMemo(() => {
    return {
      feedUrls: null,
      notificationRenderer: null
    };
  }, []);

  const [state, setState] = useState<AppNotificationServiceState>(DEFAULT_CONTEXT.state);

  // Memoize context value to prevent unnecessary renders.0
  const context = useMemo(
    () => ({
      provided: !!service,
      service: service || defaultService,
      state: {
        ...state,
        set: setState
      }
    }),
    [service, defaultService, state]
  );

  return <AppNotificationServiceContext.Provider value={context}>{children}</AppNotificationServiceContext.Provider>;
};
