import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import SafelistTable from 'components/visual/SearchResult/safelist';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from '../403';
import SafelistNew from './safelist_add';
import SafelistDetail from './safelist_detail';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

export default function Safelist() {
  const { t } = useTranslation(['manageSafelist']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const [safelistResults, setSafelistResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();
  const [suggestions] = useState(
    indexes.safelist
      ? [...Object.keys(indexes.safelist).filter(name => indexes.safelist[name].indexed), ...DEFAULT_SUGGESTION]
      : [...DEFAULT_SUGGESTION]
  );
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (safelistResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      if (location.hash === '#new') {
        setGlobalDrawer(<SafelistNew close={closeGlobalDrawer} />);
      } else {
        setGlobalDrawer(<SafelistDetail safelist_id={location.hash.slice(1)} close={closeGlobalDrawer} />);
      }
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (query && currentUser.roles.includes('safelist_view')) {
      reload(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleReload() {
      reload(safelistResults ? safelistResults.offset : 0);
    }

    window.addEventListener('reloadSafelist', handleReload);

    return () => {
      window.removeEventListener('reloadSafelist', handleReload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, safelistResults]);

  const reload = offset => {
    query.set('rows', PAGE_SIZE);
    query.set('offset', offset);
    apiCall({
      method: 'POST',
      url: '/api/v4/search/safelist/',
      body: query.getParams(),
      onSuccess: api_data => {
        if (
          api_data.api_response.items.length === 0 &&
          api_data.api_response.offset !== 0 &&
          api_data.api_response.offset >= api_data.api_response.total
        ) {
          reload(Math.max(0, api_data.api_response.offset - api_data.api_response.rows));
        } else {
          setSafelistResults(api_data.api_response);
        }
      },
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });
  };

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
        // navigate(`${location.pathname}?${query.toString()}`);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
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

  const setSafelistID = useCallback(
    (wf_id: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${wf_id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return currentUser.roles.includes('safelist_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          {currentUser.roles.includes('safelist_manage') && (
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              <Tooltip title={t('add_safelist')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                  }}
                  onClick={() => navigate(`${location.pathname}${location.search ? location.search : ''}#new`)}
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
                icon: <PersonOutlineOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('user'),
                props: {
                  onClick: () => {
                    query.set('query', 'sources.type:user');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <LabelOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('tag'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:tag');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <BlockOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('disabled'),
                props: {
                  onClick: () => {
                    query.set('query', 'enabled:false');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              }
            ]}
          >
            {safelistResults !== null && (
              <div className={classes.searchresult}>
                {safelistResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={safelistResults.total} />
                        {query.get('query')
                          ? t(`filtered${safelistResults.total === 1 ? '' : 's'}`)
                          : t(`total${safelistResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={safelistResults.total}
                  setResults={setSafelistResults}
                  pageSize={pageSize}
                  index="safelist"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SafelistTable safelistResults={safelistResults} setSafelistID={setSafelistID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
