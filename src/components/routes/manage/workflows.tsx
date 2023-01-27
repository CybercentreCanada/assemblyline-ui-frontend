import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import SearchBar from 'commons/addons/search/SearchBar';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageHeader from 'commons/components/pages/PageHeader';
import PageFullWidth from 'commons_deprecated/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import WorkflowTable from 'components/visual/SearchResult/workflow';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from '../403';
import WorkflowDetail from './workflow_detail';

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

export default function Workflows() {
  const { t } = useTranslation(['manageWorkflows']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const [workflowResults, setWorkflowResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const [suggestions] = useState([
    ...Object.keys(indexes.workflow).filter(name => indexes.workflow[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query && currentUser.roles.includes('workflow_view')) {
      reload(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleReload() {
      reload(workflowResults ? workflowResults.offset : 0);
    }

    window.addEventListener('reloadWorkflows', handleReload);

    return () => {
      window.removeEventListener('reloadWorkflows', handleReload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, workflowResults]);

  const reload = offset => {
    query.set('rows', PAGE_SIZE);
    query.set('offset', offset);
    apiCall({
      method: 'POST',
      url: '/api/v4/search/workflow/',
      body: query.getParams(),
      onSuccess: api_data => {
        if (
          api_data.api_response.items.length === 0 &&
          api_data.api_response.offset !== 0 &&
          api_data.api_response.offset >= api_data.api_response.total
        ) {
          reload(Math.max(0, api_data.api_response.offset - api_data.api_response.rows));
        } else {
          setWorkflowResults(api_data.api_response);
        }
      },
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });
  };

  const onClear = useCallback(
    () => {
      navigate(location.pathname);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const onSearch = useCallback(
    () => {
      if (filterValue.current !== '') {
        query.set('query', filterValue.current);
        navigate(`${location.pathname}?${query.toString()}`);
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

  const setWorkflowID = useCallback(
    (wf_id: string) => {
      setGlobalDrawer(<WorkflowDetail workflow_id={wf_id} close={closeGlobalDrawer} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return currentUser.roles.includes('workflow_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          {currentUser.roles.includes('workflow_manage') && (
            <Grid item xs style={{ textAlign: 'right' }}>
              <Tooltip title={t('add_workflow')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                  }}
                  onClick={() => setGlobalDrawer(<WorkflowDetail workflow_id={null} close={closeGlobalDrawer} />)}
                  size="large"
                >
                  <AddCircleOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
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
                icon: <EventBusyOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('never_used'),
                props: {
                  onClick: () => {
                    query.set('query', 'hit_count:0');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <EventOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('old'),
                props: {
                  onClick: () => {
                    query.set('query', 'last_seen:[* TO now-3m]');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              }
            ]}
          >
            {workflowResults !== null && (
              <div className={classes.searchresult}>
                {workflowResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={workflowResults.total} />
                        {query.get('query')
                          ? t(`filtered${workflowResults.total === 1 ? '' : 's'}`)
                          : t(`total${workflowResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={workflowResults.total}
                  setResults={setWorkflowResults}
                  pageSize={pageSize}
                  index="workflow"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <WorkflowTable workflowResults={workflowResults} setWorkflowID={setWorkflowID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
