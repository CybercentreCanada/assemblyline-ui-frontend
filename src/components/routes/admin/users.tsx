import { makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SimpleSearchQuery from 'components/elements/search/simple-search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchPager from 'components/visual/SearchPager';
import UsersTable from 'components/visual/SearchResult/users';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  }
}));

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

export default function Users() {
  const { t } = useTranslation(['adminUsers']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { user: currentUser } = useAppContext();
  const [userResults, setUserResults] = useState(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTION);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0`));
  }, [location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.is_admin) {
      query.set('rows', pageSize);
      query.set('offset', 0);
      setSearching(true);
      apiCall({
        url: `/api/v4/user/list/?${query.toString()}`,
        onSuccess: api_data => {
          setUserResults(api_data.api_response);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    apiCall({
      url: '/api/v4/search/fields/user/',
      onSuccess: api_data => {
        setSuggestions([
          ...Object.keys(api_data.api_response).filter(name => {
            return api_data.api_response[name].indexed;
          }),
          ...DEFAULT_SUGGESTION
        ]);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClear = () => {
    history.push(location.pathname);
  };

  const onSearch = () => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      history.push(`${location.pathname}?${query.toString()}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(8) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query') : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={suggestions}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[
              {
                icon: (
                  <Tooltip title={t('admins')}>
                    <SupervisorAccountIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'type:admin');
                    history.push(`${location.pathname}?${query.toString()}`);
                  }
                }
              },

              {
                icon: (
                  <Tooltip title={t('disabled')}>
                    <BlockIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'is_active:false');
                    history.push(`${location.pathname}?${query.toString()}`);
                  }
                }
              }
            ]}
          >
            {userResults !== null && (
              <div className={classes.searchresult}>
                {userResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        {userResults.total}&nbsp;
                        {query.get('query')
                          ? t(`filtered${userResults.total === 1 ? '' : 's'}`)
                          : t(`total${userResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  method="GET"
                  url="/api/v4/user/list/"
                  total={userResults.total}
                  setResults={setUserResults}
                  pageSize={pageSize}
                  index="user"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <UsersTable userResults={userResults} />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
