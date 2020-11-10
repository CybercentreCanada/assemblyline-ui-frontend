import { CircularProgress, makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import SearchPager from 'components/visual/SearchPager';
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
  const [query, setQuery] = useState<SearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTION);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SearchQuery(location.pathname, location.search, pageSize, false));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.is_admin) {
      setSearching(true);
      apiCall({
        url: `/api/v4/user/list/?${query.buildQueryString()}`,
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

  const onClear = () => {
    history.push(location.pathname);
  };

  const onSearch = () => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      history.push(`${location.pathname}?${query.buildQueryString()}`);
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
            initValue={query ? query.getQuery() : ''}
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
                    history.push(`${location.pathname}?${query.buildQueryString()}`);
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
                    history.push(`${location.pathname}?${query.buildQueryString()}`);
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
                        {query.getQuery()
                          ? t(`filtered${userResults.total === 1 ? '' : 's'}`)
                          : t(`total${userResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={userResults.total}
                  setResults={userResults}
                  pageSize={PAGE_SIZE}
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
        {userResults !== null ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow style={{ whiteSpace: 'nowrap' }}>
                  <TableCell>{t('header.uid')}</TableCell>
                  <TableCell>{t('header.fullname')}</TableCell>
                  <TableCell>{t('header.groups')}</TableCell>
                  <TableCell>{t('header.classification')}</TableCell>
                  <TableCell>{t('header.active')}</TableCell>
                  <TableCell>{t('header.admin')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userResults.items.map(user => (
                  <TableRow key={user.id} onClick={() => history.push(`/admin/users/${user.uname}`)} hover>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{user.uname}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.groups.join(' | ')}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>
                      <Classification type="text" size="tiny" c12n={user.classification} format="short" />
                    </TableCell>
                    <TableCell>{user.is_active ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}</TableCell>
                    <TableCell>
                      {user.type.indexOf('admin') !== -1 ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
