import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import StarIcon from '@mui/icons-material/Star';
import { AlertTitle, Box, Drawer, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ListCarousel from 'commons/addons/lists/carousel/ListCarousel';
import ListNavigator from 'commons/addons/lists/navigator/ListNavigator';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useDrawer from 'components/hooks/useDrawer';
import { CustomUser } from 'components/hooks/useMyUser';
import InformativeAlert from 'components/visual/InformativeAlert';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SearchQuery, { SearchQueryFilters } from 'components/visual/SearchBar/search-query';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchResultCount from 'components/visual/SearchResultCount';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from '../403';
import AlertDetails from './alert-details';
import AlertListItem from './alert-list-item';
import AlertListItemActions, { PossibleVerdict } from './alert-list-item-actions';
import AlertsSorts from './alert-sorts';
import AlertsFilters from './alerts-filters';
import AlertsFiltersFavorites from './alerts-filters-favorites';
import AlertsFiltersSelected from './alerts-filters-selected';
import AlertsWorkflowActions from './alerts-workflow-actions';
import useAlerts, { AlertItem } from './hooks/useAlerts';
import useFavorites from './hooks/useFavorites';
import usePromiseAPI from './hooks/usePromiseAPI';

// Default size of a page to be used by the useAlert hook when fetching next load of data
//  when scrolling has hit threshold.
const PAGE_SIZE = 50;

export interface AlertDrawerState {
  open: boolean;
  type: 'filter' | 'favorites' | 'actions' | 'sort';
  actionData?: {
    query: SearchQuery;
    alert?: {
      index: number;
      alert_id: string;
      priority: string;
      status: string;
      labels: string[];
    };
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
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
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
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer } = useDrawer();

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
  const navigate = useNavigate();
  const location = useLocation();
  const { userFavorites, globalFavorites } = useFavorites();

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
    navigate(`${location.pathname}?${searchQuery.buildURLQueryString()}${location.hash}`);

    if (inputEl) inputEl.focus();
  };

  // Handler for when clearing the SearchBar.
  const onClearSearch = (inputEl: HTMLInputElement = null) => {
    // Reset the query.
    searchQuery.deleteQuery();
    navigate(`${location.pathname}?${searchQuery.buildURLQueryString()}${location.hash}`);

    // Update the search text field reference.
    searchTextValue.current = '';

    if (inputEl) inputEl.focus();
  };

  const onVerdictComplete = useCallback(
    (index: number, item: AlertItem, verdict: PossibleVerdict) => {
      const changes = { verdict: { ...item.verdict } };
      if (verdict === 'malicious') {
        if (changes.verdict.malicious.indexOf(currentUser.username) === -1) {
          changes.verdict.malicious.push(currentUser.username);
        }
        if (changes.verdict.non_malicious.indexOf(currentUser.username) !== -1) {
          changes.verdict.non_malicious.splice(changes.verdict.non_malicious.indexOf(currentUser.username), 1);
        }
      } else {
        if (changes.verdict.non_malicious.indexOf(currentUser.username) === -1) {
          changes.verdict.non_malicious.push(currentUser.username);
        }
        if (changes.verdict.malicious.indexOf(currentUser.username) !== -1) {
          changes.verdict.malicious.splice(changes.verdict.malicious.indexOf(currentUser.username), 1);
        }
      }
      updateAlert(index, changes);
      window.dispatchEvent(new CustomEvent('alertUpdate', { detail: { id: item.id, changes } }));
    },
    [currentUser.username, updateAlert]
  );

  const onTakeOwnershipComplete = useCallback(
    (index: number, item: AlertItem) => {
      const changes = { owner: currentUser.username };
      updateAlert(index, changes);
      window.dispatchEvent(new CustomEvent('alertUpdate', { detail: { id: item.id, changes } }));
    },
    [currentUser.username, updateAlert]
  );

  // Handler for when an item of the InfiniteList is selected
  const onItemSelected = useCallback(
    (item: AlertItem, index: number) => {
      if (item !== null && item !== undefined) {
        if (isLGDown) {
          // Unfocus the simple list so the drawer does not try to refocus it when closing...
          document.getElementById(ALERT_SIMPLELIST_ID).blur();
        }
        navigate(`${location.pathname}${location.search}#${item.alert_id}`);
      }
    },
    [isLGDown, location.pathname, location.search, navigate]
  );

  // Handler for when loading more alerts [read bottom of scroll area]
  const _onLoadMore = useCallback(() => {
    setScrollReset(false);
    onLoadMore();
  }, [setScrollReset, onLoadMore]);

  // Hanlder for when clicking one the AlertsFilters 'Apply' button.
  const onApplyFilters = (filters: SearchQueryFilters, query?: string) => {
    // Set the newly selected filters and up location url bar.
    if (query !== undefined && query !== null) searchQuery.setQuery(query);
    searchQuery.setFilters(filters);
    navigate(`${location.pathname}?${searchQuery.buildURLQueryString()}${location.hash}`);

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler for when the value of the search bar input field changes.
  // We don't track it in state as that is being done in SearchBar component itself.
  const onFilterValueChange = (inputValue: string) => {
    searchTextValue.current = inputValue;
  };

  // The SearchBar contentassist suggesions.
  const buildSearchSuggestions = () => {
    const _fields = fields.map(f => f.name);
    return [..._fields, ...DEFAULT_SUGGESTION];
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
    navigate(`${location.pathname}?${searchQuery.buildURLQueryString()}${location.hash}`);

    // Close the Filters drawer.
    if (drawer.open) {
      setDrawer({ ...drawer, open: false });
    }
  };

  // Handler/callback for when clicking the 'Apply' btn on the AlertsWorkflowActions component.
  const onWorkflowActionsApply = (selectedStatus: string, selectedPriority: string, selectedLabels: string[]) => {
    onApplyWorkflowAction(drawer.actionData.query, selectedStatus, selectedPriority, selectedLabels).then(() => {
      setDrawer({ ...drawer, open: false });
      const { alert } = drawer.actionData;
      if (alert) {
        const changes = {
          status: selectedStatus || alert.status,
          priority: selectedPriority || alert.priority,
          label: [...Array.from(new Set([...alert.labels, ...selectedLabels]))]
        };
        updateAlert(alert.index, changes);
        window.dispatchEvent(new CustomEvent('alertUpdate', { detail: { id: alert.alert_id, changes } }));
      } else {
        setScrollReset(true);
        onLoad();
      }
    });
  };

  // Memoized callback to render one line-item of the list....
  const onRenderListRow = useCallback((item: AlertItem) => <AlertListItem item={item} />, []);

  //
  const onDrawerClose = () => {
    setDrawer({ ...drawer, open: false, actionData: null });
  };

  // Handler for when the cursor on the list changes via keybaord event.
  const onListCursorChanges = (item: AlertItem, index: number) => {
    onItemSelected(item, index);
  };

  // Handler to render the action buttons of each list item.
  const onRenderListActions = useCallback(
    (item: AlertItem, index: number) =>
      currentUser.roles.includes('submission_view') ||
      currentUser.roles.includes('alert_manage') ||
      item.group_count ? (
        <AlertListItemActions
          item={item}
          index={index}
          currentQuery={searchQuery}
          setDrawer={setDrawer}
          onTakeOwnershipComplete={() => onTakeOwnershipComplete(index, item)}
          onVerdictComplete={verdict => onVerdictComplete(index, item, verdict)}
        />
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onTakeOwnershipComplete, onVerdictComplete, searchQuery]
  );

  const handleSortSubmit = useCallback(
    (sort: string) => {
      const query = new SimpleSearchQuery(location.search);
      query.set('sort', sort);
      navigate(`${location.pathname}?${query.toString([])}${location.hash}`);
      if (drawer.open) {
        setDrawer({ ...drawer, open: false });
      }
    },
    [drawer, location.hash, location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (location.hash) {
      const item = alerts.find(a => a.alert_id === location.hash.slice(1));
      const index = alerts.findIndex(a => a.alert_id === location.hash.slice(1));

      setGlobalDrawer(
        <div>
          <div
            style={{
              alignItems: 'start',
              display: 'flex',
              float: 'right',
              height: theme.spacing(8),
              marginTop: theme.spacing(-8),
              marginRight: theme.spacing(-1),
              position: 'sticky',
              top: theme.spacing(1),
              zIndex: 10
            }}
          >
            {item && index >= 0 && (
              <AlertListItemActions
                item={item}
                index={index}
                currentQuery={searchQuery}
                setDrawer={setDrawer}
                onTakeOwnershipComplete={() => onTakeOwnershipComplete(index, item)}
                onVerdictComplete={verdict => onVerdictComplete(index, item, verdict)}
                type="drawer"
              />
            )}
            <ListNavigator id={ALERT_SIMPLELIST_ID} />
          </div>
          <ListCarousel id={ALERT_SIMPLELIST_ID} disableArrowUp disableArrowDown enableSwipe>
            <AlertDetails id={location.hash.slice(1)} />
          </ListCarousel>
        </div>
      );
    }
  }, [alerts, location.hash, onTakeOwnershipComplete, onVerdictComplete, searchQuery, setGlobalDrawer, theme]);

  useEffect(() => {
    if (alerts !== null && alerts.length > 0 && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  return currentUser.roles.includes('alert_view') ? (
    <PageFullWidth margin={4}>
      <Drawer open={drawer.open} anchor="right" onClose={onDrawerClose}>
        <div style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={onDrawerClose} size="large">
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
                  userFavorites={userFavorites}
                  globalFavorites={globalFavorites}
                  onApplyBtnClick={onApplyFilters}
                />
              ),
              sort: <AlertsSorts onSubmit={handleSortSubmit} />,
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
                  searchQuery={drawer.actionData.query}
                  alert={drawer.actionData.alert}
                  labelFilters={labelFilters}
                  onApplyBtnClick={onWorkflowActionsApply}
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
                icon: <StarIcon fontSize={isMDUp ? 'medium' : 'small'} />,
                tooltip: t('favorites'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'favorites' })
                }
              },
              {
                icon: <SortIcon fontSize={isMDUp ? 'medium' : 'small'} />,
                tooltip: t('sorts'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'sort' })
                }
              },
              {
                icon: <FilterListIcon fontSize={isMDUp ? 'medium' : 'small'} />,
                tooltip: t('filters'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'filter' })
                }
              },
              {
                icon: (
                  <>
                    <BiNetworkChart
                      style={{
                        height: isMDUp ? theme.spacing(2.5) : theme.spacing(2),
                        width: isMDUp ? theme.spacing(2.5) : theme.spacing(2),
                        margin: theme.spacing(0.25)
                      }}
                    />
                  </>
                ),
                tooltip: t('workflows'),
                props: {
                  onClick: () => setDrawer({ open: true, type: 'actions', actionData: { query: searchQuery } })
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
        emptyValue={
          <div style={{ width: '100%' }}>
            <InformativeAlert>
              <AlertTitle>{t('no_alerts_title')}</AlertTitle>
              {t('no_alerts_desc')}
            </InformativeAlert>
          </div>
        }
        onItemSelected={onItemSelected}
        onRenderActions={onRenderListActions}
        onLoadNext={_onLoadMore}
        onCursorChange={onListCursorChanges}
      >
        {onRenderListRow}
      </SimpleList>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const SearchResultLarge = ({ searching, total, query, onApplyFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation('alerts');
  return (
    <div style={{ position: 'relative' }}>
      <AlertsFiltersSelected searchQuery={query} onChange={onApplyFilters} hideQuery />
      <div style={{ position: 'absolute', top: theme.spacing(0.5), right: theme.spacing(1) }}>
        {searching ? (
          ''
        ) : (
          <span>
            <SearchResultCount count={total} />
            {total > 1 ? t('results') : t('result')}
          </span>
        )}
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
        {searching ? (
          ''
        ) : (
          <span>
            <SearchResultCount count={total} />
            {total > 1 ? t('results') : t('result')}
          </span>
        )}
      </div>
    </>
  );
};

export default Alerts;
