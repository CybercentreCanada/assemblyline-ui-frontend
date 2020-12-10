import { Box, Drawer, IconButton, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import FilterListIcon from '@material-ui/icons/FilterList';
import StarIcon from '@material-ui/icons/Star';
import ListCarousel from 'commons/addons/elements/lists/carousel/ListCarousel';
import ListNavigator from 'commons/addons/elements/lists/navigator/ListNavigator';
import SimpleList from 'commons/addons/elements/lists/simplelist/SimpleList';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useAppContext from 'components/hooks/useAppContext';
import useDrawer from 'components/hooks/useDrawer';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SearchQuery, { SearchQueryFilters } from 'components/visual/SearchBar/search-query';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { useHistory, useLocation } from 'react-router-dom';
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
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  searchresult: {
    marginTop: theme.spacing(1),
    fontStyle: 'italic',
    minHeight: theme.spacing(3)
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
  const { user: currentUser } = useAppContext();
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
    onLoad,
    onLoadMore,
    updateAlert
  } = useAlerts(PAGE_SIZE);

  // API Promise hook
  const { onApplyWorkflowAction } = usePromiseAPI();

  // Define required states...
  const [scrollReset, setScrollReset] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<AlertDrawerState>({
    open: false,
    type: null
  });
  const history = useHistory();
  const location = useLocation();

  // Define some references.
  const searchTextValue = useRef<string>('');

  useEffect(() => {
    if (searchQuery) {
      setScrollReset(true);
      searchTextValue.current = searchQuery.getQuery();
    }
  }, [searchQuery]);

  // Media quries.
  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  // Handler searchbar onSearch callback
  const onSearch = (filterValue: string = '', inputEl: HTMLInputElement = null) => {
    // Update query and url before reloading data.
    searchQuery.setQuery(filterValue);
    history.push(`${location.pathname}?${searchQuery.buildURLQueryString()}`);

    if (inputEl) inputEl.focus();
  };

  // Handler for when clearing the SearchBar.
  const onClearSearch = (inputEl: HTMLInputElement = null) => {
    // Reset the query.
    searchQuery.deleteQuery();
    history.push(`${location.pathname}?${searchQuery.buildURLQueryString()}`);

    // Update the search text field reference.
    searchTextValue.current = '';

    if (inputEl) inputEl.focus();
  };

  // Handler for when an item of the InfiniteList is selected
  const onItemSelected = useCallback(
    (item: AlertItem) => {
      if (item === null) {
        setGlobalDrawer(null);
      } else {
        if (isLGDown) {
          // Unfocus the simple list so the drawer does not try to refocus it when closing...
          document.getElementById(ALERT_SIMPLELIST_ID).blur();
        }
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
              <AlertDetails alert={item} />
            </ListCarousel>
          </div>
        );
      }
    },
    [setGlobalDrawer, theme, isLGDown]
  );

  // Handler for when loading more alerts [read bottom of scroll area]
  const _onLoadMore = useCallback(() => {
    setScrollReset(false);
    onLoadMore();
  }, [setScrollReset, onLoadMore]);

  // Hanlder for when clicking one the AlertsFilters 'Apply' button.
  const onApplyFilters = (filters: SearchQueryFilters) => {
    // Set the newly selected filters and up location url bar.
    searchQuery.setFilters(filters);
    history.push(`${location.pathname}?${searchQuery.buildURLQueryString()}`);

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

  // Handler/callback for when deleting a favorite on the AlertsFavorite component.
  const onFavoriteDelete = (favorite: { name: string; query: string }) => {
    // console.log(favorite);
  };

  //
  const onFavoriteSelected = (favorite: { name: string; query: string }) => {
    // Update query with selected favorite.
    searchQuery.addFq(favorite.query);
    history.push(`${location.pathname}?${searchQuery.buildURLQueryString()}`);

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler/callback for when clicking the 'Apply' btn on the AlertsWorkflowActions component.
  const onWorkflowActionsApply = (selectedStatus: string, selectedPriority: string, selectedLabels: string[]) => {
    onApplyWorkflowAction(drawer.actionData.query, selectedStatus, selectedPriority, selectedLabels).then(() => {
      setDrawer({ ...drawer, open: false });
      setScrollReset(true);
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
    (item: AlertItem, index: number) => (
      <AlertListItemActions
        item={item}
        currentQuery={searchQuery}
        setDrawer={setDrawer}
        onTakeOwnershipComplete={() => {
          updateAlert(index, { owner: currentUser.username });
        }}
      />
    ),
    [currentUser.username, searchQuery, updateAlert]
  );

  return (
    <PageFullWidth margin={4}>
      <Drawer open={drawer.open} anchor="right" onClose={onDrawerClose}>
        <div style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={onDrawerClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div className={classes.drawerInner}>
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
        </div>
      </Drawer>

      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('alerts')}</Typography>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={searchQuery ? searchQuery.getQuery() : ''}
            searching={loading}
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
              {isMDUp ? (
                <SearchResultLarge
                  searching={loading}
                  total={total}
                  query={searchQuery}
                  onApplyFilters={onApplyFilters}
                />
              ) : (
                <SearchResultSmall searching={loading} total={total} query={searchQuery} />
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
        loading={loading}
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

const SearchResultLarge = ({ searching, total, query, onApplyFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation('alerts');
  return (
    <div style={{ position: 'relative' }}>
      <AlertsFiltersSelected searchQuery={query} onChange={onApplyFilters} hideQuery />
      <div style={{ position: 'absolute', top: theme.spacing(0.5), right: theme.spacing(1) }}>
        {searching ? '' : <span>{`${total} ${total > 1 ? t('results') : t('result')}`}</span>}
      </div>
    </div>
  );
};

const SearchResultSmall = ({ searching, total, query }) => {
  const theme = useTheme();
  const { t } = useTranslation('alerts');
  const filtered = query ? hasFilters(query.parseFilters()) : false;
  return (
    <>
      <div style={{ marginTop: theme.spacing(2), alignItems: 'center' }}>
        {!searching && filtered && (
          <>
            <FiFilter style={{ marginRight: theme.spacing(1) }} />
          </>
        )}
        {searching ? '' : `${total} ${total > 1 ? t('results') : t('result')}`}
      </div>
    </>
  );
};

export default Alerts;
