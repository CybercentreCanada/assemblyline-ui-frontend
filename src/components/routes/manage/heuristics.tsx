import { makeStyles, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
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

export default function Heuristics() {
  const { t } = useTranslation(['manageHeuristics']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useALContext();
  const [heuristicResults, setHeuristicResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const { setGlobalDrawer } = useDrawer();
  const [suggestions] = useState([
    ...Object.keys(indexes.heuristic).filter(name => indexes.heuristic[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query) {
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
        history.push(`${location.pathname}?${query.toString()}`);
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
      setGlobalDrawer(<HeuristicDetail heur_id={heur_id} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <PageFullWidth margin={4}>
      {useMemo(
        () => (
          <>
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
          </>
        ),
        [classes.searchresult, heuristicResults, onClear, onSearch, pageSize, query, searching, suggestions, t, theme]
      )}

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <HeuristicsTable heuristicResults={heuristicResults} setHeuristicID={setHeuristicID} />
      </div>
    </PageFullWidth>
  );
}
