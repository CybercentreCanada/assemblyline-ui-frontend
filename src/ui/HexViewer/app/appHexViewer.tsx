import React from 'react';
import AppHexRoot from 'ui/HexViewer/app/appRoot';
import { AppStore } from '.';

export type DataProps = {
  data: string;
};

export default React.memo(({ data }: DataProps) => (
  <AppStore>
    <AppHexRoot data={data} />
  </AppStore>
));
