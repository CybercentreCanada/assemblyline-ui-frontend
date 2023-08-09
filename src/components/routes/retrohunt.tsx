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

export type RetrohuntPhase = null | 'filtering' | 'yara' | 'finished';

export type RetrohuntResult = {
  archive_only?: boolean;
  classification?: string;
  code?: string;
  created?: string;
  creator?: string;
  description?: string;
  errors?: string[];
  finished?: boolean;
  hits?: string[];
  id?: string;
  percentage?: number;
  phase?: RetrohuntPhase;
  progress?: [number, number];
  raw_query?: string;
  tags?: object;
  total_errors?: number;
  total_hits?: number;
  truncated?: boolean;
  ttl?: number;
  yara_signature?: string;
};

type SearchResults = {
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
  rows: PAGE_SIZE,
  fl: 'archive_only,classification,code,created,creator,description,finished,id,percentage,phase,progress,total_errors,total_hits,truncated'
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

export default function Retrohunt() {
  const { t } = useTranslation(['retrohunt']);
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { setGlobalDrawer, globalDrawerOpened } = useDrawer();
  const { user: currentUser, indexes, configuration } = useALContext();

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResults>(null);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
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

  const handleQueryChange = useCallback((key: string, value: string | number) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.set(key, value);
      return q;
    });
  }, []);

  const handleQueryRemove = useCallback((key: string | string[]) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      if (typeof key === 'string') q.delete(key);
      else key.forEach(k => q.delete(k));
      return q;
    });
  }, []);

  const handleReload = useCallback(
    () => {
      if (query && currentUser.roles.includes('retrohunt_view')) {
        const curQuery = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/`,
          body: curQuery.getParams(),
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              handleQueryChange('offset', Math.floor(total / rows) * rows);
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
    [currentUser.roles, handleQueryChange, query]
  );

  const handleCreateRetrohunt = useCallback(
    (retrohunt: RetrohuntResult) => {
      navigate(`${location.pathname}${location.search}#${retrohunt?.code}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleOpenCreatePage = useCallback(() => {
    if (currentUser.roles.includes('retrohunt_run')) {
      setGlobalDrawer(<RetrohuntCreate isDrawer onCreateRetrohunt={handleCreateRetrohunt} />);
      navigate(`${location.pathname}?${query.getDeltaString()}`);
    }
  }, [currentUser.roles, handleCreateRetrohunt, location.pathname, navigate, query, setGlobalDrawer]);

  useEffect(() => {
    if (query) handleReload();
  }, [handleReload, query]);

  useEffect(() => {
    const search = query.getDeltaString() === '' ? '' : `?${query.getDeltaString()}`;
    navigate(`${location.pathname}${search}${location.hash}`);
  }, [location.hash, location.pathname, navigate, query]);

  useEffect(() => {
    function reload() {
      handleReload();
    }
    window.addEventListener('reloadRetrohunts', reload);
    return () => {
      window.removeEventListener('reloadRetrohunts', reload);
    };
  }, [handleReload]);

  useEffect(() => {
    if (retrohuntResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<RetrohuntDetail code={location.hash.substr(1)} isDrawer />);
    }
  }, [location.hash, setGlobalDrawer]);

  useEffect(() => {
    if (!timer.current && retrohuntResults && retrohuntResults.items.some(item => !item?.finished)) {
      timer.current = true;
      setTimeout(() => {
        handleReload();
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [handleReload, retrohuntResults]);

  if (!configuration?.datastore?.retrohunt?.enabled) return <Navigate to="/notfound" replace />;
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
            onRowClick={item => navigate(`${location.pathname}${location.search}#${item?.code}`)}
            onSort={({ name, field }) => handleQueryChange(name, field)}
          />
        </div>
      </PageFullWidth>
    );
}
