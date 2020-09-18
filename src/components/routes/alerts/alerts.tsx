import { Box, Drawer, makeStyles, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import InfiniteList from 'components/elements/lists/infinite-list';
import SplitPanel from 'components/elements/panels/split-panel';
import Viewport from 'components/elements/panels/viewport';
import SearchBar from 'components/elements/search/search-bar';
import React, { useState } from 'react';
import AlertActionsMenu from './alert-actions-menu';
import AlertDetails from './alert-details';
import AlertListItem from './alert-list-item';
import AlertsFilters from './alerts-filters';
import useAlerts, { AlertItem } from './useAlerts';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      width: '100vw',
      top: 0,
      right: 0,
      bottom: 0
    }
  },
  searchresult: {
    fontStyle: 'italic'
  }
}));

const Alerts: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { loading, items, total, fields, query, onLoad, onLoadMore, onGet } = useAlerts(PAGE_SIZE);
  const [searching, setSearching] = useState<boolean>(false);
  const [splitPanel, setSplitPanel] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' }>({ open: false, type: null });

  //
  const _onSearch = (filterValue: string = '', inputEl: HTMLInputElement = null) => {
    // Tell the world we're searching for it...
    setSearching(true);

    // Close drawer if its open.
    if (drawer.open) {
      setDrawer({ open: false, type: null });
    }

    // Update query and url before reloading data.
    query.setOffset('0').setQuery(filterValue).apply();

    // Reload.
    onLoad();

    // Artificial delay, cause we like spinning...
    setTimeout(() => {
      setSearching(false);

      if (inputEl) {
        inputEl.focus();
      }
    }, 1000);
  };

  const onClearSearch = () => {
    // TODO: scroll to top.
    query.setOffset('0').setQuery('').apply();
    onLoad();
  };

  const onItemSelected = (item: AlertItem) => {
    if (item) {
      onGet(item.alert_id, alert => {
        setSplitPanel({ open: true, item: alert });
      });
    } else {
      setSplitPanel({ ...splitPanel, open: false });
    }
  };

  return (
    <Box>
      <Box pb={theme.spacing(0.25)}>
        <SearchBar
          initValue={query.getQuery()}
          searching={searching}
          suggestions={fields.map(f => f.name)}
          onClear={onClearSearch}
          onSearch={_onSearch}
          buttons={[
            {
              icon: <ExpandMoreIcon />,
              props: {
                onClick: () => setDrawer({ open: true, type: 'filter' })
              }
            }
          ]}
        >
          <Box className={classes.searchresult}>
            {searching || loading ? (searching ? '...searching' : '...loading') : `${total} matching results.`}
          </Box>
        </SearchBar>
      </Box>
      <Viewport>
        <SplitPanel
          leftMinWidth={500}
          leftInitWidthPerc={60}
          rightMinWidth={600}
          rightDrawerBreakpoint={1100}
          rightDrawerWidth={900}
          rightDrawerBackgroundColor={theme.palette.background.default}
          rightOpen={splitPanel.open}
          left={
            <InfiniteList
              items={items}
              loading={items.length && (loading || searching)}
              pageSize={PAGE_SIZE}
              rowHeight={93}
              selected={splitPanel.open && splitPanel.item ? splitPanel.item : null}
              onItemSelected={onItemSelected}
              onMoreItems={onLoadMore}
              onRenderItem={(item: AlertItem) => <AlertListItem item={item} />}
            />
          }
          right={
            splitPanel.item ? (
              <Box p={2} pt={0} width="100%">
                <PageHeader
                  mode="provided"
                  title={
                    <Box display="flex" alignItems="center">
                      <AlertActionsMenu />
                      <Typography variant="h6">{splitPanel.item.alert_id}</Typography>
                    </Box>
                  }
                  actions={[
                    { icon: <CloseIcon />, action: () => setSplitPanel({ open: false, item: splitPanel.item }) }
                  ]}
                  backgroundColor={theme.palette.background.default}
                  elevation={0}
                  isSticky
                />
                <AlertDetails item={splitPanel.item} />
              </Box>
            ) : null
          }
        />
      </Viewport>
      <Drawer
        open={drawer.open}
        anchor="right"
        onClose={() => setDrawer({ ...drawer, open: false })}
        className={classes.drawer}
      >
        {
          {
            filter: (
              <Box minWidth={600} p={theme.spacing(0.5)}>
                <AlertsFilters onApplyBtnClick={_onSearch} />
              </Box>
            )
          }[drawer.type]
        }
      </Drawer>
    </Box>
  );
};

export default Alerts;
