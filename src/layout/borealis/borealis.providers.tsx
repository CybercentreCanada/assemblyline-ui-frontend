import { BorealisProvider } from 'borealis-ui';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

export const AppBorealisProvider = memo(({ children }: PropsWithChildren) => (
  <BorealisProvider
    baseURL={location.origin + '/api/v4/proxy/borealis'}
    getToken={() => null}
    chunkSize={200}
    maxRequestCount={3}
    defaultTimeout={60}
    debugLogging={false}
  >
    {children}
  </BorealisProvider>
));
