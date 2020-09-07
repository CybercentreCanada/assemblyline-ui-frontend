import { Box, Drawer, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import InfiniteList from 'components/elements/lists/infinite-list';
import SplitPanel from 'components/elements/split-panel';
import Viewport from 'components/elements/viewport';
import React, { useState } from 'react';
import AlertActionsMenu from './alert-actions-menu';
import AlertDetails from './list/alert-details';
import AlertListItem from './list/alert-list-item';
import AlertsFilters from './list/alerts-filters';
import AlertsHeader from './list/alerts-header';
import useAlerts, { AlertItem } from './useAlerts';

const Alerts: React.FC = () => {
  const theme = useTheme();
  const { loading, items, onNextPage } = useAlerts();
  const [state, setState] = useState<{ open: boolean; selectedItem: AlertItem }>({ open: false, selectedItem: null });
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' }>({ open: false, type: null });

  const rowRenderer = item => (
    // <Box>
    //   <Typography variant="h6">{item.id}</Typography>
    //   <AlertListItem item={item} />
    // </Box>
    <AlertListItem item={item} />
  );

  console.log(`open[${state.open}],item[${state.selectedItem}]`);

  return (
    <Box>
      <Box pb={theme.spacing(0.25)}>
        <AlertsHeader
          onFilterBtnClick={() => console.log('filter...')}
          onExpandBtnClick={() => setDrawer({ open: true, type: 'filter' })}
        />
      </Box>
      <Viewport>
        <SplitPanel
          leftMinWidth={500}
          leftInitWidthPerc={60}
          rightMinWidth={600}
          rightDrawerBreakpoint={1100}
          rightDrawerWidth={900}
          rightDrawerBackgroundColor={theme.palette.background.default}
          rightOpen={state.open}
          left={
            <InfiniteList
              items={items}
              loading={loading}
              totalCount={12}
              rowHeight={97}
              selected={state.open && state.selectedItem ? state.selectedItem : null}
              onItemSelected={(item: AlertItem) => setState({ open: true, selectedItem: item })}
              onNextPage={onNextPage}
              onRenderItem={rowRenderer}
            />
          }
          right={
            state.selectedItem ? (
              <Box p={2} pt={0} width="100%">
                <PageHeader
                  mode="provided"
                  title={
                    <Box display="flex" alignItems="center">
                      <AlertActionsMenu />
                      <Typography variant="h6">{state.selectedItem.alert_id}</Typography>
                    </Box>
                  }
                  actions={[{ icon: <CloseIcon />, action: () => setState({ ...state, open: false }) }]}
                  backgroundColor={theme.palette.background.default}
                  elevation={0}
                  isSticky
                />
                <AlertDetails item={state.selectedItem} />
              </Box>
            ) : null
          }
        />
      </Viewport>
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
