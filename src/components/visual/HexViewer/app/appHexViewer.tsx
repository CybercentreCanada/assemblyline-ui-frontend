import React from 'react';
import { AppHookInit, AppStoreInit, StoreProvider } from '..';

export type DataProps = {
  data: string;
};

export default React.memo(({ data }: DataProps) =>
  data != null && data.length > 0 ? (
    <StoreProvider>
      <AppHookInit>
        <AppStoreInit data={data} />
      </AppHookInit>
    </StoreProvider>
  ) : null
);
