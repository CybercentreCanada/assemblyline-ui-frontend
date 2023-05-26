import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import RetrohuntTable, { RetrohuntResult } from 'components/visual/SearchResult/retrohunt';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { RetrohuntDetail } from './retrohunt/detail';

const PAGE_SIZE = 25;

type SearchResults = {
  items: RetrohuntResult[];
  offset: number;
  rows: number;
  total: number;
};

export default function Retrohunt() {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const location = useLocation();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser, indexes, configuration } = useALContext();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResults>(null);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);

  const [suggestions] = useState([
    ...Object.keys(indexes.retrohunt).filter(name => indexes.retrohunt[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);

  const filterValue = useRef<string>('');

  const onReload = useCallback(
    (offset: number) => {
      query.set('rows', PAGE_SIZE);
      query.set('offset', offset);
      apiCall({
        method: 'POST',
        url: '/api/v4/search/retrohunt/',
        body: query.getParams(),
        onSuccess: api_data => {
          const { items, total, rows, offset: ofs } = api_data.api_response;
          if (items.length === 0 && ofs !== 0 && ofs >= total) {
            onReload(Math.max(0, ofs - rows));
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

  const onClear = useCallback(
    () => {
      navigate(location.pathname);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const onSearch = useCallback(
    () => {
      if (filterValue.current !== '') {
        query.set('query', filterValue.current);
        navigate(`${location.pathname}?${query.toString()}`);
      } else {
        onClear();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, location.pathname, onClear]
  );

  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  const openRetrohuntDrawer = useCallback(
    (code: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${code}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.roles.includes('retrohunt_view')) {
      onReload(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleReload() {
      onReload(retrohuntResults ? retrohuntResults.offset : 0);
    }
    window.addEventListener('reloadRetrohunts', handleReload);
    return () => {
      window.removeEventListener('reloadRetrohunts', handleReload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, retrohuntResults]);

  useEffect(() => {
    if (retrohuntResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(
        <RetrohuntDetail retrohuntCode={location.hash.substr(1)} close={closeGlobalDrawer} pageType="drawer" />
      );
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  if (!configuration?.datastore?.retrohunt?.enabled) return <Navigate to="/notfound" replace />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullWidth margin={4}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('title')}</Typography>
            </Grid>
            {currentUser.roles.includes('retrohunt_run') && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                <Tooltip title={t('tooltip.add')}>
                  <IconButton
                    style={{
                      color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                    }}
                    onClick={() => openRetrohuntDrawer('new')}
                    size="large"
                  >
                    <AddCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </div>

        <PageHeader isSticky>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <SearchBar
              initValue={query ? query.get('query', '') : ''}
              placeholder={t('filter')}
              searching={searching}
              suggestions={suggestions}
              onValueChange={onFilterValueChange}
              onClear={onClear}
              onSearch={onSearch}
              buttons={[
                {
                  icon: <EventBusyOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                  tooltip: t('never_used'),
                  props: {
                    onClick: () => {
                      query.set('query', 'hit_count:0');
                      navigate(`${location.pathname}?${query.getDeltaString()}`);
                    }
                  }
                },
                {
                  icon: <EventOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                  tooltip: t('old'),
                  props: {
                    onClick: () => {
                      query.set('query', 'last_seen:[* TO now-3m]');
                      navigate(`${location.pathname}?${query.getDeltaString()}`);
                    }
                  }
                }
              ]}
            >
              {retrohuntResults !== null && (
                <div
                  style={{
                    fontStyle: 'italic',
                    paddingTop: theme.spacing(0.5),
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}
                >
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

        <div
          style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}
        >
          <RetrohuntTable retrohuntResults={retrohuntResults} onRowClick={code => openRetrohuntDrawer(code)} />
        </div>
      </PageFullWidth>
    );
}
