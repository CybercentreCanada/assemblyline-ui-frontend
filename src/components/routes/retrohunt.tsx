import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Grid, IconButton, Pagination, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { RetrohuntCreate } from 'components/routes/retrohunt/create';
import { RetrohuntDetail } from 'components/routes/retrohunt/detail';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import RetrohuntTable from 'components/visual/SearchResult/retrohunt';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  header: {
    paddingBottom: theme.spacing(2)
  },
  headerButton: {
    textAlign: 'right',
    flexGrow: 0
  },
  headerIconButton: {
    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
  },
  searchContainer: {
    paddingTop: theme.spacing(1)
  },
  searchBar: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  tableContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5)
  }
}));

export type RetrohuntIndex = null | 'hot' | 'archive' | 'hot_and_archive';

export type RetrohuntPhase = null | 'filtering' | 'yara' | 'finished';

export type RetrohuntHit = {
  key: string;
  classification?: string;
  sha256: string;
  expiry_ts?: string;
  search: string;
};

export type RetrohuntResult = {
  indices: RetrohuntIndex;
  classification?: string;
  search_classification?: string;
  creator: string;
  description: string;
  expiry_ts?: string;

  start_group?: number;
  end_group?: number;

  created_time: string;
  started_time: string;
  completed_time: string;

  key: string;
  raw_query?: string;
  yara_signature?: string;

  errors?: string[];
  warnings?: string[];
  finished: boolean;
  truncated: boolean;

  total_hits?: number;
  total_errors?: number;

  // to remove
  [key: string]: any;
};

export type SearchResults = {
  items: RetrohuntResult[];
  offset: number;
  rows: number;
  total: number;
};

const PAGE_SIZE = 25;

const MAX_TRACKED_RECORDS = 10000;

const RELOAD_DELAY = 5000;

const DEFAULT_PARAMS: object = {
  query: '*',
  offset: 0,
  rows: PAGE_SIZE
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

export default function RetrohuntPage() {
  const { t } = useTranslation(['retrohunt']);
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { setGlobalDrawer, globalDrawerOpened } = useDrawer();
  const { user: currentUser, indexes, configuration } = useALContext();

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResults>(null);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const filterValue = useRef<string>('');
  const timer = useRef<boolean>(false);

  const suggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.retrohunt).filter(name => indexes.retrohunt[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.retrohunt]
  );

  const pageCount = useMemo<number>(
    () =>
      retrohuntResults && 'total' in retrohuntResults
        ? Math.ceil(Math.min(retrohuntResults.total, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [retrohuntResults]
  );

  const handleQueryChange = useCallback(
    (key: string, value: string | number) => {
      query.set(key, value);
      const q = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
      navigate(`${location.pathname}?${q.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleQueryRemove = useCallback(
    (key: string | string[]) => {
      if (typeof key === 'string') query.delete(key);
      else key.forEach(k => query.delete(k));
      const q = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
      navigate(`${location.pathname}?${q.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleReload = useCallback(
    (curQuery: SimpleSearchQuery) => {
      if (curQuery && currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/`,
          body: curQuery.getParams(),
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              curQuery.set('offset', Math.floor(total / rows) * rows);
              handleReload(curQuery);
            } else {
              setRetrohuntResults(api_data.api_response);
            }
          },
          onEnter: () => setSearching(true),
          onExit: () => setSearching(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuration?.retrohunt?.enabled, currentUser.roles]
  );

  const handleCreateRetrohunt = useCallback(
    (retrohunt: RetrohuntResult) => {
      navigate(`${location.pathname}${location.search}#${retrohunt?.key}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleOpenCreatePage = useCallback(() => {
    if (currentUser.roles.includes('retrohunt_run') && configuration?.retrohunt?.enabled) {
      setGlobalDrawer(<RetrohuntCreate isDrawer onCreateRetrohunt={handleCreateRetrohunt} />);
      navigate(`${location.pathname}?${query.getDeltaString()}`);
    }
  }, [
    configuration?.retrohunt?.enabled,
    currentUser.roles,
    handleCreateRetrohunt,
    location.pathname,
    navigate,
    query,
    setGlobalDrawer
  ]);

  const handleRowClick = useCallback(
    (item: RetrohuntResult) => {
      const hashSearch = new URL(`${window.location.origin}/${location.hash.slice(1)}`);
      navigate(`${location.pathname}${location.search}#${item?.key}${hashSearch.search}`);
    },
    [location, navigate]
  );

  useEffect(() => {
    if (query) handleReload(query);
  }, [handleReload, query]);

  useEffect(() => {
    function reload() {
      handleReload(query);
    }
    window.addEventListener('reloadRetrohunts', reload);
    return () => {
      window.removeEventListener('reloadRetrohunts', reload);
    };
  }, [handleReload, query]);

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  }, [location.search]);

  useEffect(() => {
    if (retrohuntResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<RetrohuntDetail id={location.hash.substr(1)} isDrawer />);
    }
  }, [location.hash, setGlobalDrawer]);

  useEffect(() => {
    if (!timer.current && retrohuntResults && retrohuntResults.items.some(item => !item?.finished)) {
      timer.current = true;
      setTimeout(() => {
        handleReload(query);
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [handleReload, query, retrohuntResults]);

  if (!configuration?.retrohunt?.enabled) return <Navigate to="/notfound" replace />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullWidth margin={4}>
        <div className={classes.header}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('title')}</Typography>
            </Grid>
            {currentUser.roles.includes('retrohunt_run') && (
              <Grid className={classes.headerButton} item xs>
                <Tooltip title={t('tooltip.add')}>
                  <IconButton className={classes.headerIconButton} onClick={handleOpenCreatePage} size="large">
                    <AddCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </div>

        <PageHeader isSticky>
          <div className={classes.searchContainer}>
            <SearchBar
              initValue={query ? query.get('query', '') : ''}
              placeholder={t('filter')}
              searching={searching}
              suggestions={suggestions}
              onValueChange={value => {
                filterValue.current = value;
              }}
              onClear={() => handleQueryRemove(['query', 'rows', 'offset'])}
              onSearch={() => {
                if (filterValue.current !== '') {
                  handleQueryChange('query', filterValue.current);
                  handleQueryChange('offset', 0);
                } else handleQueryRemove(['query', 'rows', 'offset']);
              }}
            >
              {retrohuntResults !== null && (
                <div className={classes.searchBar}>
                  {retrohuntResults.total !== 0 && (
                    <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                      {searching ? (
                        <span>{t('searching')}</span>
                      ) : (
                        <span>
                          <SearchResultCount count={retrohuntResults.total} />
                          {query.get('query') || query.get('filters')
                            ? t(`filtered${retrohuntResults.total === 1 ? '' : 's'}`)
                            : t(`total${retrohuntResults.total === 1 ? '' : 's'}`)}
                        </span>
                      )}
                    </Typography>
                  )}

                  {pageCount > 1 && (
                    <Pagination
                      page={Math.ceil(1 + query.get('offset') / PAGE_SIZE)}
                      onChange={(e, value) => handleQueryChange('offset', (value - 1) * PAGE_SIZE)}
                      count={pageCount}
                      shape="rounded"
                      size="small"
                    />
                  )}
                </div>
              )}
            </SearchBar>
          </div>
        </PageHeader>

        <div className={classes.tableContainer}>
          <RetrohuntTable
            retrohuntResults={retrohuntResults}
            onRowClick={handleRowClick}
            onSort={({ name, field }) => handleQueryChange(name, field)}
          />
        </div>
      </PageFullWidth>
    );
}
