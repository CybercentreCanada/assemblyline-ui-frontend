import { Grid } from '@material-ui/core';
import React from 'react';
import AlertCard, { AlertItem } from './alert-card';

type AlertListProps = {
  items: AlertItem[];
};

const AlertGrid: React.FC<AlertListProps> = ({ items }) => {
  return (
    <Grid container spacing={3}>
      {items.map(alert => (
        <Grid key={alert.sid} item xs={12} sm={12} md={12} lg={6} xl={4}>
          <AlertCard item={alert} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AlertGrid;
