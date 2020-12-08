import { Box, Drawer, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import StarIcon from '@material-ui/icons/Star';
import ListCarousel from 'commons/addons/elements/lists/carousel/ListCarousel';
import ListNavigator from 'commons/addons/elements/lists/navigator/ListNavigator';
import SimpleList from 'commons/addons/elements/lists/simplelist/SimpleList';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useDrawer from 'components/hooks/useDrawer';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SearchQuery, { SearchQueryFilters } from 'components/visual/SearchBar/search-query';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import AlertDetails from './alert-details';
import AlertListItem from './alert-list-item';
import AlertListItemActions from './alert-list-item-actions';
import AlertsFilters from './alerts-filters';
import AlertsFiltersFavorites from './alerts-filters-favorites';
import AlertsFiltersSelected from './alerts-filters-selected';
import AlertsWorkflowActions from './alerts-workflow-actions';
import useAlerts, { AlertItem } from './hooks/useAlerts';
import usePromiseAPI from './hooks/usePromiseAPI';

// Default size of a page to be used by the useAlert hook when fetching next load of data
//  when scrolling has hit threshold.
const PAGE_SIZE = 50;

export interface AlertDrawerState {
  open: boolean;
  type: 'filter' | 'favorites' | 'actions';
  actionData?: {
    query: SearchQuery;
    total: number;
  };
}

const ALERT_SIMPLELIST_ID = 'al.alerts.simplelist';

// Just indicates whether there are any filters currently set..
const hasFilters = (filters: SearchQueryFilters): boolean => {
  const { statuses, priorities, labels, queries } = filters;
  return statuses.length > 0 || priorities.length > 0 || labels.length > 0 || queries.length > 0;
};

// Some generated style classes
const useStyles = makeStyles(theme => ({
  pageTitle: {
    // paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    width: '600px',
    [theme.breakpoints.down('xs')]: {
      width: '100vw'
    }
  },
  searchresult: {
    marginTop: theme.spacing(1),
    fontStyle: 'italic'
  },
  modeToggler: {
    border: 'none',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginRight: '0px !important'
  }
}));

// The Alerts functional component.
const Alerts: React.FC = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const { setGlobalDrawer } = useDrawer();

  // Alerts hook.
  const {
    loading,
    alerts,
    total,
    countedTotal,
    fields,
    searchQuery,
    valueFilters,
    statusFilters,
    priorityFilters,
    labelFilters,
    updateQuery,
    onLoad,
    onLoadMore
  } = useAlerts(PAGE_SIZE);

  // API Promise hook
  const { onApplyWorkflowAction } = usePromiseAPI();

  // Define required states...
  const [searching, setSearching] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<AlertDrawerState>({
    open: false,
    type: null
  });

  // Define some references.
  const searchTextValue = useRef<string>(searchQuery.getQuery());

  // Media quries.
  const isLTEMd = useMediaQuery(theme.breakpoints.up('md'));

  // Handler searchbar onSearch callback
  const onSearch = (filterValue: string = '', inputEl: HTMLInputElement = null) => {
    // Tell the world we're searching for it...
    setSearching(true);

    // Reset scroll for each new search.
    setScrollReset(true);

    // Close drawer if its open.
    if (drawer.open) {
      setDrawer({ open: false, type: null });
    }

    // Update query and url before reloading data.
    searchQuery.setQuery(filterValue).apply();

    // Reload.
    onLoad((success: boolean) => {
      setSearching(false);
      inputEl.focus();
    });
  };

  // Handler for when clearing the SearchBar.
  const onClearSearch = () => {
    // Reset the query.
    searchQuery.reset().apply();

    // Update the search text field reference.
    searchTextValue.current = '';

    // Reset scroll for each new search.
    setScrollReset(true);

    // Refetch initial data.
    onLoad();
  };

  // Handler for when an item of the InfiniteList is selected
  const onItemSelected = useCallback(
    (item: AlertItem) => {
      setGlobalDrawer(
        <div>
          <div
            style={{
              position: 'sticky',
              top: 0,
              paddingTop: theme.spacing(1),
              marginTop: -theme.spacing(8),
              marginRight: -theme.spacing(1),
              float: 'right'
            }}
          >
            <ListNavigator id={ALERT_SIMPLELIST_ID} />
          </div>
          <ListCarousel id={ALERT_SIMPLELIST_ID} disableArrowUp disableArrowDown enableSwipe>
            <AlertDetails id={item.alert_id} />
          </ListCarousel>
        </div>,
        ALERT_SIMPLELIST_ID
      );
    },
    [setGlobalDrawer, theme]
  );

  // Handler for when loading more alerts [read bottom of scroll area]
  const _onLoadMore = useCallback(() => {
    setScrollReset(false);
    onLoadMore();
  }, [setScrollReset, onLoadMore]);

  // Hanlder for when clicking one the AlertsFilters 'Apply' button.
  const onApplyFilters = (filters: SearchQueryFilters) => {
    // Set the newly selected filters and up location url bar.
    searchQuery.setFilters(filters).apply();

    // Reinitialize the scroll.
    setScrollReset(true);

    // Fetch result based on new/updated query.
    onLoad();

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler for when clicking the 'Cancel' button on AlertsFiltersFilters
  const onCancelFilters = () => {
    setDrawer({ ...drawer, open: false });
  };

  // Handler for when the value of the search bar input field changes.
  // We don't track it in state as that is being done in SearchBar component itself.
  const onFilterValueChange = (inputValue: string) => {
    searchTextValue.current = inputValue;
  };

  // The SearchBar contentassist suggesions.
  const buildSearchSuggestions = () => {
    const _fields = fields.map(f => f.name);
    const words = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];
    return [..._fields, ...words];
  };

  // Handler/callback for when clicking the 'Add' btn on the AlertsFavorite component.
  const onFavoriteAdd = (filter: { query: string; name: string }) => {
    setDrawer({ ...drawer, open: false });
  };

  // Handler/callback for when clicking the 'Cancel' btn on the AlertsFavorite component.
  const onFavoriteCancel = () => {
    setDrawer({ ...drawer, open: false });
  };

  // Handler/callback for when deleting a favorite on the AlertsFavorite component.
  const onFavoriteDelete = (favorite: { name: string; query: string }) => {
    // console.log(favorite);
  };

  //
  const onFavoriteSelected = (favorite: { name: string; query: string }) => {
    // Update query with selected favorite.
    updateQuery(searchQuery.addFq(favorite.query).apply().build());

    // Reinitialize the scroll.
    setScrollReset(true);

    // Fetch result based on new/updated query
    onLoad();

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler/callback for when clicking the 'Apply' btn on the AlertsWorkflowActions component.
  const onWorkflowActionsApply = (selectedStatus: string, selectedPriority: string, selectedLabels: string[]) => {
    onApplyWorkflowAction(drawer.actionData.query, selectedStatus, selectedPriority, selectedLabels).then(() => {
      setDrawer({ ...drawer, open: false });
      onLoad();
    });
  };

  // Handler/callback for when clicking the 'Cancel' btn on the AlertsWorkflowActions component.
  const onWorkflowActionCancel = () => {
    setDrawer({ ...drawer, open: false });
  };

  // Memoized callback to render one line-item of the list....
  const onRenderListRow = useCallback((item: AlertItem) => {
    return <AlertListItem item={item} />;
  }, []);

  //
  const onDrawerClose = () => {
    setDrawer({ ...drawer, open: false, actionData: null });
  };

  // Handler for when the cursor on the list changes via keybaord event.
  const onListCursorChanges = (item: AlertItem) => {
    onItemSelected(item);
  };

  // Handler to render the action buttons of each list item.
  const onRenderListActions = useCallback(
    (item: AlertItem) => <AlertListItemActions item={item} currentQuery={searchQuery} setDrawer={setDrawer} />,
    [searchQuery]
  );

  return (
    <PageFullWidth margin={4}>
      <Drawer open={drawer.open} anchor="right" onClose={onDrawerClose}>
        <Box p={theme.spacing(0.5)} className={classes.drawerInner}>
          {
            {
              filter: (
                <AlertsFilters
                  searchQuery={searchQuery}
                  valueFilters={valueFilters}
                  statusFilters={statusFilters}
                  priorityFilters={priorityFilters}
                  labelFilters={labelFilters}
                  onApplyBtnClick={onApplyFilters}
                  onCancelBtnClick={onCancelFilters}
                />
              ),
              favorites: (
                <AlertsFiltersFavorites
                  initValue={searchTextValue.current}
                  onSelected={onFavoriteSelected}
                  onDeleted={onFavoriteDelete}
                  onSaved={onFavoriteAdd}
                  onCancel={onFavoriteCancel}
                />
              ),
              actions: drawer.actionData && (
                <AlertsWorkflowActions
                  query={drawer.actionData.query}
                  affectedItemCount={drawer.actionData.total}
                  statusFilters={statusFilters}
                  priorityFilters={priorityFilters}
                  labelFilters={labelFilters}
                  onApplyBtnClick={onWorkflowActionsApply}
                  onCancelBtnClick={onWorkflowActionCancel}
                />
              )
            }[drawer.type]
          }
        </Box>
      </Drawer>

      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('alerts')}</Typography>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={searchQuery.getQuery()}
            searching={searching || loading}
            suggestions={buildSearchSuggestions()}
            placeholder="Filter alerts..."
            onValueChange={onFilterValueChange}
            onClear={onClearSearch}
            onSearch={onSearch}
            buttons={[
              {
                icon: <StarIcon fontSize={upMD ? 'default' : 'small'} />,
                tooltip: t('favorites'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'favorites' })
                }
              },
              {
                icon: <FilterListIcon fontSize={upMD ? 'default' : 'small'} />,
                tooltip: t('filters'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'filter' })
                }
              },
              {
                icon: <BiNetworkChart fontSize={upMD ? 'default' : 'small'} />,
                tooltip: t('workflows'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'actions', actionData: { query: searchQuery, total } })
                }
              }
            ]}
          >
            <Box className={classes.searchresult}>
              {isLTEMd ? (
                <SearchResultLarge
                  loading={loading}
                  searching={searching}
                  total={total}
                  query={searchQuery}
                  onApplyFilters={onApplyFilters}
                />
              ) : (
                <SearchResultSmall loading={loading} searching={searching} total={total} query={searchQuery} />
              )}
            </Box>
          </SearchBar>
        </div>
      </PageHeader>

      <SimpleList
        id={ALERT_SIMPLELIST_ID}
        disableProgress
        scrollInfinite={countedTotal < total}
        scrollReset={scrollReset}
        scrollLoadNextThreshold={75}
        scrollTargetId="app-scrollct"
        loading={loading || searching}
        items={alerts}
        onItemSelected={onItemSelected}
        onRenderActions={onRenderListActions}
        onLoadNext={_onLoadMore}
        onCursorChange={onListCursorChanges}
      >
        {onRenderListRow}
      </SimpleList>
    </PageFullWidth>
  );
};

const SearchResultLarge = ({ searching, loading, total, query, onApplyFilters }) => {
  const theme = useTheme();
  const _searching = searching || loading;
  return (
    <div style={{ position: 'relative' }}>
      <AlertsFiltersSelected searchQuery={query} onChange={onApplyFilters} hideQuery />
      <div style={{ position: 'absolute', top: theme.spacing(0), right: theme.spacing(1) }}>
        {_searching ? '' : <span>{`${total} matching results.`}</span>}
      </div>
    </div>
  );
};

const SearchResultSmall = ({ searching, loading, total, query }) => {
  const theme = useTheme();
  const _searching = searching || loading;
  const filtered = hasFilters(query.parseFilters());
  return (
    <>
      <div style={{ marginTop: theme.spacing(2), alignItems: 'center' }}>
        {!_searching && filtered && (
          <>
            <FiFilter style={{ marginRight: theme.spacing(1) }} />
          </>
        )}
        {_searching ? '' : `${total} matching results.`}
      </div>
    </>
  );
};

export default Alerts;
