import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Grid, IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import { FileResult } from 'components/visual/SearchResult/files';
import RetrohuntTable from 'components/visual/SearchResult/retrohunt';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { RetrohuntCreate } from './retrohunt/create';
import { RetrohuntDetail } from './retrohunt/detail';

const PAGE_SIZE = 25;

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
  hits?: FileResult[];
  id?: string;
  pending_candidates?: any;
  pending_indices?: any;
  phase?: RetrohuntPhase;
  progress?: [number, number];
  raw_query?: string;
  tags?: object;
  total_hits?: number;
  total_indices?: number;
  truncated?: boolean;
  yara_signature?: string;
};

type SearchResults = {
  items: RetrohuntResult[];
  offset: number;
  rows: number;
  total: number;
};

const RELOAD_DELAY = 5000;

export default function Retrohunt() {
  const { t } = useTranslation(['retrohunt']);
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const { apiCall } = useMyAPI();
  const { setGlobalDrawer, globalDrawerOpened } = useDrawer();
  const { user: currentUser, indexes, configuration } = useALContext();

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResults>(null);
  const [pageSize] = useState<number>(PAGE_SIZE);
  const [searching, setSearching] = useState<boolean>(false);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const timer = useRef<boolean>(false);

  const [suggestions] = useState([
    ...Object.keys(indexes.retrohunt).filter(name => indexes.retrohunt[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);

  const filterValue = useRef<string>('');

  const handleReload = useCallback(
    (offset: number) => {
      query.set('rows', PAGE_SIZE);
      query.set('offset', offset);
      query.set('fl', 'created,creator,description,classification,total_hits,phase,progress,finished');
      apiCall({
        method: 'POST',
        url: '/api/v4/search/retrohunt/',
        body: query.getParams(),
        onSuccess: api_data => {
          const { items, total, rows, offset: ofs } = api_data.api_response;
          if (items.length === 0 && ofs !== 0 && ofs >= total) {
            handleReload(Math.max(0, ofs - rows));
          } else {
            setRetrohuntResults(api_data.api_response);
          }
        },
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  const handleCreateRetrohunt = useCallback(
    (retrohunt: RetrohuntResult) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${retrohunt?.code}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleOpenCreatePage = useCallback(() => {
    if (currentUser.roles.includes('retrohunt_run')) {
      navigate(`${location.pathname}?${query.toString()}`);
      setGlobalDrawer(<RetrohuntCreate isDrawer onCreateRetrohunt={handleCreateRetrohunt} />);
    }
  }, [currentUser.roles, handleCreateRetrohunt, location.pathname, navigate, query, setGlobalDrawer]);

  const handleClear = useCallback(
    () => navigate(`${location.pathname}${location.hash}`),
    [navigate, location.pathname, location.hash]
  );

  const handleSearch = useCallback(() => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    } else {
      handleClear();
    }
  }, [query, navigate, location.pathname, location.hash, handleClear]);

  const handleFilterValueChange = useCallback((inputValue: string) => {
    filterValue.current = inputValue;
  }, []);

  const handleRowClick = useCallback(
    (retrohunt: RetrohuntResult) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${retrohunt?.code}`);
    },
    [location, navigate]
  );

  useEffect(() => {
    setSearching(true);
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.roles.includes('retrohunt_view')) {
      handleReload(0);
    }
  }, [currentUser.roles, handleReload, query]);

  useEffect(() => {
    function reload() {
      handleReload(retrohuntResults ? retrohuntResults.offset : 0);
    }
    window.addEventListener('reloadRetrohunts', reload);
    return () => {
      window.removeEventListener('reloadRetrohunts', reload);
    };
  }, [handleReload, retrohuntResults]);

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
        handleReload(retrohuntResults ? retrohuntResults.offset : 0);
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
              onClear={handleClear}
              onSearch={handleSearch}
              onValueChange={handleFilterValueChange}
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
                          {query.get('query')
                            ? t(`filtered${retrohuntResults.total === 1 ? '' : 's'}`)
                            : t(`total${retrohuntResults.total === 1 ? '' : 's'}`)}
                        </span>
                      )}
                    </Typography>
                  )}

                  <SearchPager
                    total={retrohuntResults.total}
                    setResults={setRetrohuntResults}
                    pageSize={pageSize}
                    index="retrohunt"
                    query={query}
                    setSearching={setSearching}
                  />
                </div>
              )}
            </SearchBar>
          </div>
        </PageHeader>

        <div className={classes.tableContainer}>
          <RetrohuntTable retrohuntResults={retrohuntResults} onRowClick={item => handleRowClick(item)} />
        </div>
      </PageFullWidth>
    );
}
