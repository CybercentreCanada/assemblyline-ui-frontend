import { Grid, IconButton, makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { AdminFeedTable, useNewsFeed } from 'components/visual/NewsFeed';
import { AdminFeedDrawer, AdminFeedDrawerHandle } from 'components/visual/NewsFeed/components/admin/AdminFeedDrawer';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory, useLocation } from 'react-router-dom';

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

export default function NewsFeeds() {
  const { t } = useTranslation(['adminFeeds']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, c12nDef } = useALContext();
  const [userResults, setUserResults] = useState(null);
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

  // const test = new Date('Tue, 21 Jun 2022 11:06:08 +0000');

  // console.log(test.getFullYear());

  const feedDrawerRef = useRef<AdminFeedDrawerHandle>(null);

  useEffect(() => {
    // feedDrawerRef.current.onOpen();
  }, []);

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <AdminFeedDrawer ref={feedDrawerRef} />

      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right' }}>
            <Tooltip title={t('add_user')}>
              <IconButton
                style={{
                  color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
                onClick={() => {
                  feedDrawerRef.current.add();
                }}
              >
                <AddCircleOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}></div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <AdminFeedTable
          userResults={userResults}
          onRowClick={(index: number) => feedDrawerRef.current.edit(feeds[index].metadata.url, index)}
        />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
