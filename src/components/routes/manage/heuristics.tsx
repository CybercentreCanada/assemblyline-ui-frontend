import { useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import HeuristicsTable from 'components/visual/SearchResult/heuristics';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import ForbiddenPage from '../403';
import HeuristicDetail from './heuristic_detail';

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
    [theme.breakpoints.down('lg')]: {
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

export default function Heuristics() {
  const { t } = useTranslation(['manageHeuristics']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes, user: currentUser } = useALContext();
  const [heuristicResults, setHeuristicResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawer } = useDrawer();
  const [suggestions] = useState([
    ...Object.keys(indexes.heuristic).filter(name => indexes.heuristic[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (heuristicResults !== null && globalDrawer === null && location.hash) {
      history.push(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawer]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<HeuristicDetail heur_id={location.hash.substr(1)} />);
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (query && currentUser.roles.includes('heuristic_view')) {
      query.set('rows', PAGE_SIZE);
      query.set('offset', 0);
      setSearching(true);
      apiCall({
        method: 'POST',
        url: '/api/v4/search/heuristic/',
        body: query.getParams(),
        onSuccess: api_data => {
          setHeuristicResults(api_data.api_response);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onClear = useCallback(
    () => {
      history.push(location.pathname);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const onSearch = useCallback(
    () => {
      if (filterValue.current !== '') {
        query.set('query', filterValue.current);
        history.push(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
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

  const setHeuristicID = useCallback(
    (heur_id: string) => {
      history.push(`${location.pathname}${location.search ? location.search : ''}#${heur_id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return currentUser.roles.includes('heuristic_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
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
            {heuristicResults !== null && (
              <div className={classes.searchresult}>
                {heuristicResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={heuristicResults.total} />
                        {query.get('query')
                          ? t(`filtered${heuristicResults.total === 1 ? '' : 's'}`)
                          : t(`total${heuristicResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={heuristicResults.total}
                  setResults={setHeuristicResults}
                  pageSize={pageSize}
                  index="heuristic"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <HeuristicsTable heuristicResults={heuristicResults} setHeuristicID={setHeuristicID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
