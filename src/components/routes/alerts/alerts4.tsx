import { Box, Typography, useTheme } from '@material-ui/core';
import InfiniteList from 'components/elements/lists/infinite-list';
import Viewport from 'components/elements/viewport';
import React, { useState } from 'react';
import AlertListItem from './list/alert-list-item';
import useAlerts, { AlertItem } from './useAlerts';

const Alerts: React.FC = () => {
  const theme = useTheme();
  const { loading, items, onNextPage } = useAlerts();
  const [state, setState] = useState<{ open: boolean; selectedItem: AlertItem }>({ open: false, selectedItem: null });

  const rowRenderer = item => (
    <Box>
      <Typography variant="h6">{item.id}</Typography>
      <AlertListItem item={item} />
    </Box>
  );

  //
  return (
    <Viewport>
      <InfiniteList
        items={items}
        loading={loading}
        rowHeight={100}
        // selected={state.open && state.selectedItem ? state.selectedItem : null}
        onItemSelected={(item: AlertItem) => setState({ open: true, selectedItem: item })}
        onNextPage={onNextPage}
        onRenderItem={rowRenderer}
      />
    </Viewport>
  );
};

export default Alerts;
