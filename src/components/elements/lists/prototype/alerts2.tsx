import { useTheme } from '@material-ui/core';
import VirtualizedList from 'components/elements/lists/prototype/virtualized-list';
import AlertListItem from 'components/routes/alerts/list/alert-list-item';
import useAlerts from 'components/routes/alerts/useAlerts';
import React, { useState } from 'react';

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
