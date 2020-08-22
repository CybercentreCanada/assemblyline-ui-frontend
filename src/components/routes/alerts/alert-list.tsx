import { Grid } from '@material-ui/core';
import React from 'react';
import Alert, { AlertItem } from './alert';

type AlertListProps = {
  items: AlertItem[];
};

const AlertList: React.FC<AlertListProps> = ({ items }) => {
  return (
    <Grid container spacing={3}>
      {items.map(alert => (
        <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
          <Alert item={alert} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AlertList;
