import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import UsersTable from 'components/visual/SearchResult/users';
import SearchResultCount from 'components/visual/SearchResultCount';
import ChipInput from 'material-ui-chip-input';
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

export default function Users() {
  const { t } = useTranslation(['adminUsers']);
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
  const apiCall = useMyAPI();
  const classes = useStyles();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTION);
  const filterValue = useRef<string>('');

  const closeDrawer = () => {
    setDrawer(false);
  };

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

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          <Box mb={3}>
            <Typography variant="h5">{t('newuser.title')}</Typography>
          </Box>
          {c12nDef.enforce && (
            <Box mb={1}>
              <Classification
                type="picker"
                size="medium"
                format="long"
                c12n={newUser.classification}
                setClassification={setClassification}
                isUser
              />
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.uname')}</Typography>
              <TextField
                autoFocus
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('uname', event.target.value)}
                value={newUser.uname}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.name')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('name', event.target.value)}
                value={newUser.name}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">{t('newuser.groups')}</Typography>
              <ChipInput
                style={{ display: 'block' }}
                margin="dense"
                defaultValue={newUser.groups}
                onChange={chips => updateNewUser('groups', chips)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.new_pass')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('new_pass', event.target.value)}
                value={newUser.new_pass}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.email')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('email', event.target.value)}
                value={newUser.email}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">{t('newuser.roles')}</Typography>
              <div>
                <CustomChip
                  type="rounded"
                  size="small"
                  color={newUser.type.includes('user') ? 'primary' : 'default'}
                  onClick={() => toggleRole('user')}
                  label={t('role.normal_user')}
                />
                <CustomChip
                  type="rounded"
                  size="small"
                  color={newUser.type.includes('admin') ? 'primary' : 'default'}
                  onClick={() => toggleRole('admin')}
                  label={t('role.admin')}
                />
                <CustomChip
                  type="rounded"
                  size="small"
                  color={newUser.type.includes('signature_manager') ? 'primary' : 'default'}
                  onClick={() => toggleRole('signature_manager')}
                  label={t('role.signature_manager')}
                />
                <CustomChip
                  type="rounded"
                  size="small"
                  color={newUser.type.includes('signature_importer') ? 'primary' : 'default'}
                  onClick={() => toggleRole('signature_importer')}
                  label={t('role.signature_importer')}
                />
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.api_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('api_quota', event.target.value)}
                value={newUser.api_quota}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.submission_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                variant="outlined"
                onChange={event => updateNewUser('submission_quota', event.target.value)}
                value={newUser.submission_quota}
              />
            </Grid>
          </Grid>
          <Box my={2} textAlign="right">
            <Button
              disabled={buttonLoading || !newUser.uname}
              variant="contained"
              color="primary"
              onClick={handleAddUser}
            >
              {t('newuser.save')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </Box>
        </div>
      </Drawer>

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
                  setDrawer(true);
                }}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
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
            {userResults !== null && (
              <div className={classes.searchresult}>
                {userResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={userResults.total} />
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
