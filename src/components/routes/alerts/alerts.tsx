import { Box, Drawer, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';
import StarIcon from '@material-ui/icons/Star';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import FlexPort from 'components/elements/layout/flexers/FlexPort';
import FlexVertical from 'components/elements/layout/flexers/FlexVertical';
import useSplitLayout from 'components/elements/layout/hooks/useSplitLayout';
// import Booklist from 'components/elements/lists/booklist/booklist';
import SplitLayout from 'components/elements/layout/splitlayout/SplitLayout';
import SimpleList from 'components/elements/lists/simplelist/SimpleList';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery, { SearchQueryFilters } from 'components/elements/search/search-query';
import Classification from 'components/visual/Classification';
import React, { useCallback, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import AlertActionsMenu from './alert-actions-menu';
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

//
const ALERT_SPLITLAYOUT_ID = 'al.alerts.splitlayout';
const ALERT_SIMPLELIST_ID = 'al.alerts.simplelist';

// Just indicates whether there are any filters currently set..
const hasFilters = (filters: SearchQueryFilters): boolean => {
  const { statuses, priorities, labels, queries } = filters;
  return statuses.length > 0 || priorities.length > 0 || labels.length > 0 || queries.length > 0;
};

// Some generated style classes
const useStyles = makeStyles(theme => ({
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    width: '600px',
    [theme.breakpoints.down('xs')]: {
      width: '100vw'
    }
  },
  searchresult: {
    fontStyle: 'italic'
  }
}));

// The Alerts functional component.
const Alerts: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const {
    loading,
    alerts,
    total,
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
  const { onGetAlert, onApplyWorkflowAction } = usePromiseAPI();

  // Define required states...
  const [searching, setSearching] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);
  const [splitPanel, setSplitPanel] = useState<{ item: AlertItem }>({ item: null });
  const [drawer, setDrawer] = useState<AlertDrawerState>({
    open: false,
    type: null
  });

  // splitlayout hook
  const { openRight, closeRight } = useSplitLayout(ALERT_SPLITLAYOUT_ID);

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

    // Close right of split panel if open.
    closeRight();
    // if (splitPanel.open) {

    //   setSplitPanel({ ...splitPanel, open: false });
    // }

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

    // Close right of split panel if open.
    closeRight();

    // Refetch initial data.
    onLoad();
  };

  // Handler for when an item of the InfiniteList is selected.
  const onItemSelected = useCallback(
    (item: AlertItem) => {
      if (item) {
        onGetAlert(item.alert_id).then(alert => {
          openRight();
          setSplitPanel({ item: alert });
        });
      }
    },
    [onGetAlert, openRight]
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

    // Close right of split panel if open.
    closeRight();

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

    // Close right of split panel if open.
    closeRight();

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
  const onRenderListRow = useCallback((item: AlertItem) => <AlertListItem item={item} />, []);
  // const onRenderListRow = useCallback((item: AlertItem) => <AlertCardItem item={item} />, []);

  //
  const onDrawerClose = () => {
    setDrawer({ ...drawer, open: false, actionData: null });
  };

  // Handler for with close the right side of split panel.
  const onSplitLayoutCloseRight = () => {
    closeRight();
  };

  // Handler for when the cursor on the list changes via keybaord event.
  const onListCursorChanges = (cursor: number, item: AlertItem) => {
    onItemSelected(item);
  };

  // Handler to render the action buttons of each list item.
  const onRenderListActions = useCallback(
    (item: AlertItem) => <AlertListItemActions item={item} currentQuery={searchQuery} setDrawer={setDrawer} />,
    [searchQuery]
  );

  // Load up the filters already present in the URL..
  // useEffect(() => setQueryFilters(query), [query]);

  return (
    <FlexVertical>
      <div style={{ marginRight: theme.spacing(2), marginLeft: theme.spacing(2), position: 'relative' }}>
        <SearchBar
          initValue={searchQuery.getQuery()}
          searching={searching || loading}
          suggestions={buildSearchSuggestions()}
          onValueChange={onFilterValueChange}
          onClear={onClearSearch}
          onSearch={onSearch}
          buttons={[
            {
              icon: <StarIcon />,
              props: {
                onClick: () => setDrawer({ open: true, type: 'favorites' })
              }
            },
            {
              icon: <FilterListIcon />,
              props: {
                onClick: () => setDrawer({ open: true, type: 'filter' })
              }
            },
            {
              icon: <AccountTreeIcon />,
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
      <FlexPort>
        <SplitLayout
          id="al.alerts.splitlayout"
          disableManualResize
          initLeftWidthPerc={50}
          leftMinWidth={500}
          rightMinWidth={500}
          left={
            <SimpleList
              id="al.alerts.simplelist"
              scrollInfinite
              scrollReset={scrollReset}
              scrollLoadNextThreshold={75}
              loading={loading || searching}
              items={alerts}
              onItemSelected={onItemSelected}
              onRenderRow={onRenderListRow}
              onRenderActions={onRenderListActions}
              onLoadNext={_onLoadMore}
              onCursorChange={onListCursorChanges}
              disableProgress
            />
          }
          right={
            splitPanel.item ? (
              <Box p={2} pt={0} width="100%">
                <PageHeader
                  actions={[{ icon: <CloseIcon />, action: onSplitLayoutCloseRight }]}
                  backgroundColor={theme.palette.background.default}
                  elevation={0}
                >
                  <Box display="flex" alignItems="center">
                    <AlertActionsMenu />
                    <Box flex={1}>
                      <Classification c12n={splitPanel.item.classification} type="outlined" />
                    </Box>
                  </Box>
                </PageHeader>
                <AlertDetails item={splitPanel.item} />
              </Box>
            ) : null
          }
        />
      </FlexPort>
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
    </FlexVertical>
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
            <FiFilter />
            &nbsp;
          </>
        )}
        {_searching ? '' : `${total} matching results.`}
      </div>
    </>
  );
};

export default Alerts;
