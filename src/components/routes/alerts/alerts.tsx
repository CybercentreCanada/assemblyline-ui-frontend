import { Box, Drawer, makeStyles, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';
import StarIcon from '@material-ui/icons/Star';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SimpleList from 'components/elements/lists/simplelist/simplelist';
// import Booklist from 'components/elements/lists/booklist/booklist';
import SplitPanel from 'components/elements/panels/split-panel';
import Viewport from 'components/elements/panels/viewport';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery, { SearchFilter } from 'components/elements/search/search-query';
import Classification from 'components/visual/Classification';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FcWorkflow } from 'react-icons/fc';
import AlertActionsMenu from './alert-actions-menu';
import AlertDetails from './alert-details';
import AlertListItem from './alert-list-item';
import AlertsFilters, { AlertFilterSelections, DEFAULT_FILTERS } from './alerts-filters';
import AlertsFiltersFavorites from './alerts-filters-favorites';
import AlertsFiltersSelected from './alerts-filters-selected';
import AlertsWorkflowActions from './alerts-workflow-actions';
import useAlerts, { AlertItem } from './hooks/useAlerts';

const PAGE_SIZE = 50;

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

const Alerts: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const {
    loading,
    buffer,
    // book,
    total,
    fields,
    query,
    valueFilters,
    statusFilters,
    priorityFilters,
    labelFilters,
    // updateBook,
    onLoad,
    onLoadMore,
    onGet
  } = useAlerts(PAGE_SIZE);
  // Define required states...
  const [searching, setSearching] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);
  const [splitPanel, setSplitPanel] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' | 'favorites' | 'actions' }>({
    open: false,
    type: null
  });
  const [selectedFilters, setSelectedFilters] = useState<AlertFilterSelections>(DEFAULT_FILTERS);

  // Define some references.
  const searchTextValue = useRef<string>(query.getQuery());

  // Parse the filters [fq: param] and set them as  the 'selectedFilters'.
  const setQueryFilters = (_query: SearchQuery) => {
    const searchQueryFilters = _query.parseFilters();
    const statuses = searchQueryFilters.filter(f => f.type === 'status');
    const priorities = searchQueryFilters.filter(f => f.type === 'priority');
    const labels = searchQueryFilters.filter(f => f.type === 'label');
    const queries = searchQueryFilters.filter(f => f.type === 'query');
    setSelectedFilters(filters => ({
      ...filters,
      statuses: statuses || filters.statuses,
      priorities: priorities || filters.priorities,
      labels: labels || filters.labels,
      queries: queries || filters.queries
    }));
  };

  //
  const onSearch = (filterValue: string = '', inputEl: HTMLInputElement = null) => {
    // Tell the world we're searching for it...
    setSearching(true);

    // Reset scroll for each new search.
    setScrollReset(true);

    // Close right of split panel if open.
    if (splitPanel.open) {
      setSplitPanel({ ...splitPanel, open: false });
    }

    // Close drawer if its open.
    if (drawer.open) {
      setDrawer({ open: false, type: null });
    }

    // Update query and url before reloading data.
    query.setQuery(filterValue).apply();

    // Reload.
    onLoad(() => {
      setSearching(false);
      inputEl.focus();
    });
  };

  // Handler for when clearing the SearchBar.
  const onClearSearch = () => {
    // Reset the query.
    query.reset().apply();
    //
    setSelectedFilters(DEFAULT_FILTERS);
    // Reset scroll for each new search.
    setScrollReset(true);
    // Close right of split panel if open.
    if (splitPanel.open) {
      setSplitPanel({ ...splitPanel, open: false });
    }
    // Refetch initial data.
    onLoad();
  };

  // Handler for when an item of the InfiniteList is selected.
  const onItemSelected = useCallback(
    (item: AlertItem) => {
      if (item) {
        onGet(item.alert_id, alert => {
          setSplitPanel({ open: true, item: alert });
        });
      } else {
        setSplitPanel(_sp => ({ ..._sp, open: false }));
      }
    },
    [onGet]
  );

  // Handler for when loading more alerts [read bottom of scroll area]
  const _onLoadMore = useCallback(() => {
    setScrollReset(false);
    onLoadMore();
  }, [setScrollReset, onLoadMore]);

  // Hanlder for when clicking one the AlertsFilters 'Apply' button.
  const onApplyFilters = (filters: AlertFilterSelections) => {
    // console.log(filters);

    // update the state of the selected filters so they are intialized next time drawer opens.
    setSelectedFilters(filters);

    // Add a [fq] parameter for status/priority/label.
    const addFq = (item: SearchFilter) => query.addFq(item.value);
    query.clearFq();
    query.setTc(filters.tc.value);
    query.setGroupBy(filters.groupBy.value);
    filters.statuses.forEach(addFq);
    filters.priorities.forEach(addFq);
    filters.labels.forEach(addFq);
    filters.queries.forEach(addFq);
    query.apply();

    // Reinitialize the scroll.
    setScrollReset(true);

    // Fetch result based on new/updated query.
    onLoad();

    // Close right of split panel if open.
    if (splitPanel.open) {
      setSplitPanel({ ...splitPanel, open: false });
    }

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler for when clicking the 'Clear' button on AlertsFilter.
  const onClearFilters = () => {
    setDrawer({ ...drawer, open: false });
    onClearSearch();
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

  //
  const onFavoriteAdd = (filter: { query: string; name: string }) => {
    setDrawer({ ...drawer, open: false });
  };

  //
  const onFavoriteCancel = () => {
    setDrawer({ ...drawer, open: false });
  };

  //
  const onFavoriteDelete = (favorite: { name: string; query: string }) => {
    // console.log(favorite);
  };

  //
  const onFavoriteSelected = (favorite: { name: string; query: string }) => {
    // Update the query parameter.
    query.addFq(favorite.query).apply();

    // Set query filters to selectedFilters state.
    setQueryFilters(query);

    // Reinitialize the scroll.
    setScrollReset(true);

    // Fetch result based on new/updated query.
    onLoad();

    // Close right of split panel if open.
    if (splitPanel.open) {
      setSplitPanel({ ...splitPanel, open: false });
    }

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Memoized callback to render one line-item of the list.
  const onRenderListRow = useCallback((item: AlertItem) => <AlertListItem item={item} />, []);

  //
  const onDrawerClose = () => {
    setDrawer({ ...drawer, open: false });
  };

  // Handler for with close the right side of split panel.
  const onSplitPanelRightClose = () => {
    setSplitPanel({ open: false, item: splitPanel.item });
  };

  // Load up the filters already present in the URL.
  useEffect(() => setQueryFilters(query), [query]);

  return (
    <Box>
      <Box pb={theme.spacing(0.25)}>
        <SearchBar
          initValue={query.getQuery()}
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
              icon: <FcWorkflow />,
              props: {
                onClick: () => setDrawer({ open: true, type: 'actions' })
              }
            }
          ]}
        >
          <Box className={classes.searchresult}>
            <AlertsFiltersSelected filters={selectedFilters} onChange={onApplyFilters} />
            <Box mt={1}>
              {searching || loading ? (searching ? '...searching' : '...loading') : `${total} matching results.`}
            </Box>
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
            // <MetaList
            //   loading={loading || searching}
            //   buffer={buffer}
            //   rowHeight={92}
            //   scrollReset={scrollReset}
            //   onSelection={onItemSelected}
            //   onNext={_onLoadMore}
            //   onRenderItem={onRenderListRow}
            // />.
            <SimpleList
              loading={loading || searching}
              items={buffer.items}
              scrollReset={scrollReset}
              scrollLoadNextThreshold={75}
              onItemSelected={onItemSelected}
              onRenderRow={onRenderListRow}
              onLoadNext={_onLoadMore}
              disableProgress
            />

            // <Booklist.
            //   loading={loading || searching}
            //   book={book}
            //   onItemSelected={onItemSelected}
            //   onPageChange={updateBook}
            //   onRenderRow={onRenderListRow}
            //   onLoadNext={_onLoadMore}
            // />
          }
          right={
            splitPanel.item ? (
              <Box p={2} pt={0} width="100%">
                <PageHeader
                  mode="provided"
                  title={
                    <Box display="flex" alignItems="center">
                      <AlertActionsMenu />
                      <Box flex={1}>
                        <Classification c12n={splitPanel.item.classification} type="outlined" />
                      </Box>
                    </Box>
                  }
                  actions={[{ icon: <CloseIcon />, action: onSplitPanelRightClose }]}
                  backgroundColor={theme.palette.background.default}
                  elevation={0}
                />
                <AlertDetails item={splitPanel.item} />
              </Box>
            ) : null
          }
        />
      </Viewport>
      <Drawer open={drawer.open} anchor="right" onClose={onDrawerClose}>
        <Box p={theme.spacing(0.5)} className={classes.drawerInner}>
          {
            {
              filter: (
                <AlertsFilters
                  selectedFilters={selectedFilters}
                  valueFilters={valueFilters}
                  statusFilters={statusFilters}
                  priorityFilters={priorityFilters}
                  labelFilters={labelFilters}
                  onApplyBtnClick={onApplyFilters}
                  onClearBtnClick={onClearFilters}
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
              actions: (
                <AlertsWorkflowActions
                  query={query.getQuery()}
                  affectedItemCount={buffer.total()}
                  selectedFilters={selectedFilters}
                  statusFilters={statusFilters}
                  priorityFilters={priorityFilters}
                  labelFilters={labelFilters}
                />
              )
            }[drawer.type]
          }
        </Box>
      </Drawer>
    </Box>
  );
};

export default Alerts;
