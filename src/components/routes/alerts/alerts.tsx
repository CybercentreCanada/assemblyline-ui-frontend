import { Box, Drawer, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import AlertsFilters from './list/alerts-filters';
import AlertsHeader from './list/alerts-header';
import AlertsSplitPanel from './list/alerts-split-panel';
import useAlerts from './useAlerts';

const Alerts: React.FC = () => {
  const theme = useTheme();
  const { loading, page, nextPage, previousPage } = useAlerts();
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' }>({ open: false, type: null });

  // const onListNextPage = () => nextPage();

  // const onListPreviousPage = () => previousPage;
  console.log(`current page: ${page.index}`);
  return (
    <Box>
      <Box pb={theme.spacing(0.25)}>
        <AlertsHeader
          onFilterBtnClick={() => console.log('filter...')}
          onExpandBtnClick={() => setDrawer({ open: true, type: 'filter' })}
        />
      </Box>
      <AlertsSplitPanel loading={loading} page={page} onListNextPage={nextPage} onListPreviousPage={previousPage} />
      <Drawer open={drawer.open} anchor="right" onClose={() => setDrawer({ ...drawer, open: false })}>
        {
          {
            filter: (
              <Box minWidth={600} p={theme.spacing(0.5)}>
                <AlertsFilters onApplyBtnClick={() => setDrawer({ ...drawer, open: false })} />
              </Box>
            )
          }[drawer.type]
        }
      </Drawer>
    </Box>
  );
};

export default Alerts;
