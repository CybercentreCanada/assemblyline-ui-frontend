import type { SnackbarEvents } from '@cccsaurora/clue-ui';
import { buildDatabase, ClueProvider, SNACKBAR_EVENT_ID } from '@cccsaurora/clue-ui';
import { useAppConfigStore } from 'core/config';
import { useAppSnackbar } from 'core/snackbar';
import type { PropsWithChildren } from 'react';
import { memo, Suspense, use, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONEditor } from 'ui/JSONEditor';

export type CluePublicConfig = {
  chunk_size?: number;
  debug_logging?: boolean;
  default_timeout?: number;
  iconify_url?: string;
  max_request_count?: number;
};

// Built once at module scope: the provider otherwise creates a new database on every mount.
const CLUE_DATABASE = buildDatabase().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize the Clue database:', error);
  return undefined;
});

//*****************************************************************************************
// App Clue Layout
//*****************************************************************************************

const AppClueLayout = memo(({ children }: PropsWithChildren) => {
  const i18next = useTranslation('clue');
  const { showSuccessMessage, showErrorMessage, showInfoMessage, showWarningMessage } = useAppSnackbar();

  const database = use(CLUE_DATABASE);

  const clueConfig = useAppConfigStore(s => s?.configuration?.ui?.api_proxies?.clue as CluePublicConfig);

  useEffect(() => {
    const handleMessage = (event: CustomEvent<SnackbarEvents>) => {
      const { detail } = event;
      if (detail.level === 'success') {
        showSuccessMessage(detail.message);
      } else if (detail.level === 'error') {
        showErrorMessage(detail.message);
      } else if (detail.level === 'info') {
        showInfoMessage(detail.message);
      } else if (detail.level === 'warning') {
        showWarningMessage(detail.message);
      }
    };

    window.addEventListener(SNACKBAR_EVENT_ID, handleMessage);

    return () => {
      window.removeEventListener(SNACKBAR_EVENT_ID, handleMessage);
    };
  }, [showErrorMessage, showInfoMessage, showSuccessMessage, showWarningMessage]);

  return (
    <ClueProvider
      baseURL={location.origin + '/api/v4/proxy/clue'}
      chunkSize={clueConfig?.chunk_size || 200}
      database={database}
      debugLogging={clueConfig?.debug_logging || false}
      defaultTimeout={clueConfig?.default_timeout || 60}
      i18next={i18next as never}
      maxRequestCount={clueConfig?.max_request_count || 3}
      ReactJson={JSONEditor}
      {...(clueConfig?.iconify_url
        ? {
            customIconify: clueConfig?.iconify_url,
            publicIconify: false
          }
        : {
            publicIconify: true
          })}
    >
      {children}
    </ClueProvider>
  );
});

AppClueLayout.displayName = 'AppClueLayout';

//*****************************************************************************************
// App Clue Provider
//*****************************************************************************************

export const AppClueProvider = memo(({ children }: PropsWithChildren) => (
  <Suspense fallback={null}>
    <AppClueLayout>{children}</AppClueLayout>
  </Suspense>
));

AppClueProvider.displayName = 'AppClueProvider';
