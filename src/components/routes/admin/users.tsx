/* eslint-disable @typescript-eslint/no-unused-vars */
import BlockIcon from '@mui/icons-material/Block';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

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
  roles?: string[];
};

export default function Users() {
  const { t } = useTranslation(['adminUsers']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const [userResults, setUserResults] = useState(null);
  const [newUser, setNewUser] = useState<User>(DEFAULT_USER);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const { showSuccessMessage } = useMySnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
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

  useEffectOnce(() => {
    if (currentUser.is_admin) {
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
    }
  });

  const onClear = () => {
    navigate(location.pathname);
  };

  const onSearch = () => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      navigate(`${location.pathname}?${query.toString()}`);
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

  function setType(userType) {
    const newRoles = configuration.user.role_dependencies[userType];
    if (newRoles) {
      setNewUser({ ...newUser, type: [userType], roles: [...newRoles] });
    } else {
      setNewUser({ ...newUser, type: [userType] });
    }
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
          <IconButton onClick={closeDrawer} size="large">
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
              <Autocomplete
                sx={{ display: 'block', margin: theme.spacing(2, 0) }}
                multiple
                freeSolo
                size="small"
                options={[]}
                defaultValue={newUser.groups}
                renderInput={params => <TextField {...params} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                }
                onChange={(event, chips) => updateNewUser('groups', chips)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.new_pass')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                type="password"
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
              <Typography variant="caption">{t('newuser.user_type')}</Typography>
              <div>
                {configuration.user.types.map((uType, type_id) => (
                  <CustomChip
                    key={type_id}
                    type="rounded"
                    size="small"
                    color={newUser.type.includes(uType) ? 'primary' : 'default'}
                    disabled={uType === 'custom'}
                    onClick={() => setType(uType)}
                    label={t(`user_type.${uType}`)}
                  />
                ))}
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption">{t('newuser.api_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
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
                size="small"
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
                  color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
                onClick={() => {
                  setDrawer(true);
                }}
                size="large"
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
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <BlockIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('disabled'),
                props: {
                  onClick: () => {
                    query.set('query', 'is_active:false');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
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
    <Navigate to="/forbidden" replace />
  );
}
