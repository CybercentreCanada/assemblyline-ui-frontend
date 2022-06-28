import { Grid, GridSize } from '@material-ui/core';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { ReactChild, useCallback } from 'react';

type DataRowProps = {
  children: ReactChild;
  header: string;
  hide?: boolean;
  xs: boolean | GridSize;
  sm: boolean | GridSize;
  lg: boolean | GridSize;
};

const WrappedDataRow: React.FC<DataRowProps> = ({ children, header = '', hide = false, xs = 2, sm = 2, lg = 2 }) => {
  const inverse = useCallback(
    (value: boolean | GridSize): boolean | GridSize =>
      (typeof value === 'number' ? 12 - value : value) as boolean | GridSize,
    []
  );

  return !hide ? (
    <>
      <Grid item xs={xs} sm={sm} lg={lg}>
        <span style={{ fontWeight: 500 }}>{header}</span>
      </Grid>
      <Grid item xs={inverse(xs)} sm={inverse(sm)} lg={inverse(lg)} style={{ wordBreak: 'break-word' }}>
        {children}
      </Grid>
    </>
  ) : (
    <></>
  );
};

export const DataRow = React.memo(WrappedDataRow);
