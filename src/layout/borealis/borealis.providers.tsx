import { BorealisProvider } from 'borealis-ui';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const AppBorealisProvider = memo(({ children }: PropsWithChildren) => {
  const i18next = useTranslation('borealis');

  return (
    <BorealisProvider
      baseURL={location.origin + '/api/v4/proxy/borealis'}
      getToken={() => null}
      chunkSize={200}
      maxRequestCount={3}
      defaultTimeout={60}
      debugLogging={false}
      i18next={i18next as never}
    >
      {children}
    </BorealisProvider>
  );
});
