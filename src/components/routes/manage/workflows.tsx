import { Drawer, Grid, IconButton, makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import EventBusyOutlinedIcon from '@material-ui/icons/EventBusyOutlined';
import EventOutlinedIcon from '@material-ui/icons/EventOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SimpleSearchQuery from 'components/elements/search/simple-search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchPager from 'components/visual/SearchPager';
import WorkflowTable from 'components/visual/SearchResult/workflow';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import WorkflowDetail from './workflow_detail';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
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

export default function Workflows() {
  const { t } = useTranslation(['manageWorkflows']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [wid, setWid] = useState(null);
  const { indexes } = useAppContext();
  const [workflowResults, setWorkflowResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const apiCall = useMyAPI();
  const classes = useStyles();
  const [suggestions] = useState([
    ...Object.keys(indexes.workflow).filter(name => {
      return indexes.workflow[name].indexed;
    }),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  const closeDrawer = () => {
    setDrawer(false);
  };

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query) {
      reload(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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

  const setWorkflowID = (wf_id: string) => {
    setDrawer(true);
    setWid(wf_id);
  };

  const handleWorkflowDone = () => {
    setDrawer(false);
    setWid(null);
    setTimeout(() => reload(workflowResults ? workflowResults.offset : 0), 1000);
  };

  return (
    <PageFullWidth margin={4}>
      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          <WorkflowDetail workflow_id={wid} close={handleWorkflowDone} />
        </div>
      </Drawer>

      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right' }}>
            <Tooltip title={t('add_workflow')}>
              <IconButton
                style={{ color: theme.palette.action.active }}
                onClick={() => {
                  setWid(null);
                  setDrawer(true);
                }}
              >
                <AddCircleOutlineOutlinedIcon />
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
                icon: (
                  <Tooltip title={t('never_used')}>
                    <EventBusyOutlinedIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'hit_count:0');
                    history.push(`${location.pathname}?${query.toString()}`);
                  }
                }
              },
              {
                icon: (
                  <Tooltip title={t('old')}>
                    <EventOutlinedIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'last_seen:[* TO now-3m]');
                    history.push(`${location.pathname}?${query.toString()}`);
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
                        {workflowResults.total}&nbsp;
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
  );
}
