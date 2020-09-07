import { useTheme } from '@material-ui/core';
import VirtualizedList from 'components/elements/lists/virtualized-list';
import React, { useState } from 'react';
import AlertListItem from './list/alert-list-item';
import useAlerts from './useAlerts';

const Alerts: React.FC = () => {
  const theme = useTheme();
  const { loading, page, nextPage, previousPage } = useAlerts();
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' }>({ open: false, type: null });

  // const onListNextPage = () => nextPage();

  // const onListPreviousPage = () => previousPage;

  console.log(`current page: ${page.index}`);
  return (
    <VirtualizedList
      items={page.items}
      loaded={!loading}
      onNextPage={nextPage}
      onRenderItem={i => <AlertListItem item={i} />}
    />
  );
};

export default Alerts;
