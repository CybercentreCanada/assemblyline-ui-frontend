/* eslint-disable @typescript-eslint/no-unused-vars */
import { Grid, useTheme } from '@mui/material';
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
import ApikeysTable, { ApikeySearchResults } from 'components/visual/SearchResult/apikeys';
import SearchResultCount from 'components/visual/SearchResultCount';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ApikeyDetail from './apikey_detail';

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
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

export default function Apikeys() {
  const { t } = useTranslation(['apikeys']);
  const [pageSize] = useState<number>(PAGE_SIZE);
  const [searching, setSearching] = useState<boolean>(false);
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const [apikeySearchResults, setApikeySearchResults] = useState<ApikeySearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);
  const filterValue = useRef<string>('');

  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer, subscribeCloseDrawer } = useDrawer();

  const setApikeyID = useCallback(
    (key_id: string) => {
      navigate(`${location.pathname}${location.search || ''}#${key_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  const onClear = useCallback(() => {
    navigate(location.pathname);
  }, [navigate, location.pathname]);

  const onSearch = useCallback(() => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      navigate(`${location.pathname}?${query.toString()}`);
    } else {
      onClear();
    }
  }, [filterValue.current, query, navigate, location.pathname]);

  const onFilterValueChange = useCallback((inputValue: string) => {
    filterValue.current = inputValue;
  }, []);

  useEffect(() => {
    function reload() {
      if (!location.hash) closeGlobalDrawer();
    }

    function closeApikeyDrawer() {
      navigate('/admin/apikeys');
      setTimeout(() => reload(), 1000);
    }

    if (!location.hash) closeGlobalDrawer();
    else {
      setGlobalDrawer(<ApikeyDetail key_id={location.hash.slice(1)} close={closeGlobalDrawer} />);
      subscribeCloseDrawer(closeApikeyDrawer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0`));
  }, [location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.is_admin) {
      query.set('rows', pageSize);
      query.set('offset', 0);
      setSearching(true);
      apiCall({
        url: `/api/v4/apikey/list/?${query.toString()}`,
        onSuccess: api_data => {
          setApikeySearchResults(api_data.api_response);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location.hash]);

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('apikeys.title')}</Typography>
          </Grid>
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
          >
            {apikeySearchResults !== null && (
              <div className={classes.searchresult}>
                {apikeySearchResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" sx={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('apikeys')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={apikeySearchResults.total} />
                        {query.get('query')
                          ? t(`filtered${apikeySearchResults.total === 1 ? '' : 's'}`)
                          : t(`total${apikeySearchResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ApikeysTable apikeySearchResults={apikeySearchResults} setApikeyID={setApikeyID} />
      </div>
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
