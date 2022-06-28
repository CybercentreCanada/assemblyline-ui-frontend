import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { useNewsFeed } from 'components/visual/NewsFeed';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;
const DEFAULT_USER = {
  avatar: null,
  groups: ['USERS'],
  is_active: true,
  type: ['user'],
  classification: null,
  email: '',
  name: '',
  new_pass: '',
  uname: '',
  api_quota: 10,
  submission_quota: 5
};

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

type User = {
  avatar: string;
  email: string;
  groups: string[];
  is_active: boolean;
  type: string[];
  classification: string;
  name: string;
  new_pass: string;
  uname: string;
  api_quota: number;
  submission_quota: number;
};

type UsersTableProps = {};

const WrappedAdminFeedSearchBar: React.FC<UsersTableProps> = () => {
  const { t } = useTranslation(['adminFeeds']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [userResults, setUserResults] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, c12nDef } = useALContext();
  const [newUser, setNewUser] = useState<User>(DEFAULT_USER);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
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
    setClassification(c12nDef.UNRESTRICTED);
    apiCall({
      url: '/api/v4/search/fields/user/',
      onSuccess: api_data => {
        setSuggestions([
          ...Object.keys(api_data.api_response).filter(name => api_data.api_response[name].indexed),
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

  const updateNewUser = (key, value) => {
    setNewUser({ ...newUser, [key]: value });
  };

  function setClassification(value) {
    setNewUser({ ...newUser, classification: value });
  }

  function toggleRole(role) {
    const newTypes = newUser.type;
    if (newTypes.indexOf(role) === -1) {
      newTypes.push(role);
    } else {
      newTypes.splice(newTypes.indexOf(role), 1);
    }
    setNewUser({ ...newUser, type: newTypes });
  }

  const handleAddUser = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/user/${newUser.uname}/`,
      body: newUser,
      onSuccess: api_data => {
        showSuccessMessage(t('newuser.success'));
        setDrawer(false);
        setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0`));
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const { feeds } = useNewsFeed();

  return (
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
          icon: <SupervisorAccountIcon fontSize={upMD ? 'medium' : 'small'} />,
          tooltip: t('admins'),
          props: {
            onClick: () => {
              query.set('query', 'type:admin');
              history.push(`${location.pathname}?${query.getDeltaString()}`);
            }
          }
        },
        {
          icon: <BlockIcon fontSize={upMD ? 'medium' : 'small'} />,
          tooltip: t('disabled'),
          props: {
            onClick: () => {
              query.set('query', 'is_active:false');
              history.push(`${location.pathname}?${query.getDeltaString()}`);
            }
          }
        }
      ]}
    >
      {feeds !== null && (
        <div className={classes.searchresult}>
          {feeds.length !== 0 && (
            <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
              {searching ? (
                <span>{t('searching')}</span>
              ) : (
                <span>
                  <SearchResultCount count={feeds.length} />
                  {query.get('query')
                    ? t(`filtered${feeds.length === 1 ? '' : 's'}`)
                    : t(`total${feeds.length === 1 ? '' : 's'}`)}
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
  );
};

export const AdminFeedSearchBar = React.memo(WrappedAdminFeedSearchBar);
export default AdminFeedSearchBar;
