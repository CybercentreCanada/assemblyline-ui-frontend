import { Card, Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import useUser from 'commons/components/hooks/useAppUser';
import useClipboard from 'commons/components/hooks/useClipboard';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import ErrorsTable from 'components/visual/SearchResult/errors';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import Moment from 'react-moment';
import { Redirect, useHistory, useLocation } from 'react-router-dom';

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
  clipboardIcon: {
    marginLeft: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer',
      transform: 'scale(1.1)'
    }
  }
}));

function ErrorDetail({ error }) {
  const { t, i18n } = useTranslation(['adminErrorViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const { copy } = useClipboard();

  const errorMap = {
    'MAX DEPTH REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX RETRY REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    EXCEPTION: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'TASK PRE-EMPTED': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE DOWN': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE BUSY': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX FILES REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    UNKNOWN: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />
  };

  return (
    <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid container spacing={1} style={{ paddingBottom: theme.spacing(1) }}>
        <Grid item xs={6} sm={8}>
          <Typography variant="h5">{error.response.service_name}</Typography>
          <Typography variant="caption">
            {`${error.response.service_version}${
              error.response.service_tool_version && ` (${error.response.service_tool_version})`
            }`}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <div style={{ display: 'inline-block', textAlign: 'start' }}>
            <Typography component="div" variant="body1">
              <Moment fromNow locale={i18n.language}>
                {error.created}
              </Moment>
            </Typography>
            <Typography component="div" variant="caption">
              <Moment format="YYYY-MM-DD HH:mm:ss">{error.created}</Moment>
            </Typography>
          </div>
        </Grid>
      </Grid>

      <Grid container spacing={1} style={{ paddingBottom: theme.spacing(1) }}>
        <Grid item xs={6} sm={8}>
          <span style={{ verticalAlign: 'middle' }}>{errorMap[error.type]}&nbsp;</span>
          <span style={{ verticalAlign: 'middle' }}>{t(`type.${error.type}`)}</span>
        </Grid>
        <Grid item xs={6} sm={4} style={{ alignSelf: 'center' }}>
          <span style={{ verticalAlign: 'middle' }}>{t(`fail.${error.response.status}`)}</span>
        </Grid>
      </Grid>

      <div style={{ marginBottom: theme.spacing(1) }}>
        <label>{t('message')}</label>
        <Card variant="outlined">
          <pre
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              whiteSpace: 'pre-wrap',
              minHeight: '10rem'
            }}
          >
            {error.response.message}
          </pre>
        </Card>
      </div>

      {error.response.service_debug_info && (
        <div style={{ marginBottom: theme.spacing(1) }}>
          <label>{t('debug_info')}</label>
          <Card variant="outlined">
            <pre
              style={{
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                whiteSpace: 'pre-wrap'
              }}
            >
              {error.response.service_debug_info}
            </pre>
          </Card>
        </div>
      )}

      <div style={{ marginBottom: theme.spacing(1) }}>
        <label>{t('file_info')}</label>
        <div style={{ wordBreak: 'break-all' }}>
          {error.sha256}
          <BsClipboard className={classes.clipboardIcon} onClick={() => copy(error.sha256, 'drawerTop')} />
        </div>
      </div>
    </div>
  );
}

export default function ErrorViewer() {
  const { t } = useTranslation(['adminErrorViewer']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [errorResults, setErrorResults] = useState(null);
  const classes = useStyles();
  const history = useHistory();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const theme = useTheme();
  const apiCall = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTION);
  const location = useLocation();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const filterValue = useRef<string>('');
  const { setGlobalDrawer } = useDrawer();

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0`));
  }, [location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.is_admin) {
      query.set('rows', pageSize);
      query.set('offset', 0);
      setSearching(true);
      apiCall({
        url: `/api/v4/error/list/?${query.toString()}`,
        onSuccess: api_data => {
          setErrorResults(api_data.api_response);
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
      url: '/api/v4/search/fields/error/',
      onSuccess: api_data => {
        setSuggestions([
          ...Object.keys(api_data.api_response).filter(name => api_data.api_response[name].indexed),
          ...DEFAULT_SUGGESTION
        ]);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setError = useCallback(
    error => {
      setGlobalDrawer(<ErrorDetail error={error} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return currentUser.is_admin ? (
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
            buttons={[
              {
                icon: <ReportProblemOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('exception'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:(EXCEPTION OR UNKNOWN)');
                    history.push(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <CancelOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('canceled'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:(SERVICE* OR TASK*)');
                    history.push(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <PanToolOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('maxed'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:MAX*');
                    history.push(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              }
            ]}
          >
            {errorResults !== null && (
              <div className={classes.searchresult}>
                {errorResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={errorResults.total} />
                        {query.get('query')
                          ? t(`filtered${errorResults.total === 1 ? '' : 's'}`)
                          : t(`total${errorResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  method="GET"
                  url="/api/v4/error/list/"
                  total={errorResults.total}
                  setResults={setErrorResults}
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
        <ErrorsTable errorResults={errorResults} onClick={setError} />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
