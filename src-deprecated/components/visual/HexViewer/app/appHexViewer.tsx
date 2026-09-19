import AppHexRoot from 'components/visual/HexViewer/app/appRoot';
import React from 'react';
import { AppStore } from '.';

export type DataProps = {
  data: string;
};

export default React.memo(({ data }: DataProps) => (
  <AppStore>
    <AppHexRoot data={data} />
  </AppStore>
));
