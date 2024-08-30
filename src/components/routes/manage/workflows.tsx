import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import type { WorkflowResult } from 'components/visual/SearchResult/workflow';
import WorkflowTable from 'components/visual/SearchResult/workflow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import WorkflowDetail from './workflow_detail';

type SearchResults = {
  items: WorkflowResult[];
  offset: number;
  rows: number;
  total: number;
};

const WORKFLOWS_PARAMS = {
  query: '',
  rows: 25,
  offset: 0,
  sort: 'last_seen desc',
  filters: [],
  track_total_hits: 10000
};

type WorkflowsParams = SearchParams<typeof WORKFLOWS_PARAMS>;

const WorkflowsSearch = () => {
  const { t } = useTranslation(['manageWorkflows']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<WorkflowsParams>();

  const [workflowResults, setWorkflowResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.workflow).filter(name => indexes.workflow[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.workflow]
  );

  const handleReload = useCallback(
    (body: WorkflowsParams) => {
      if (!search || !currentUser.roles.includes('workflow_view')) return;

      apiCall({
        url: '/api/v4/search/workflow/',
        method: 'POST',
        body: body,
        onSuccess: ({ api_response }) => setWorkflowResults(api_response as SearchResults),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, search]
  );

  const setWorkflowID = useCallback(
    (wf_id: string) => navigate(`${location.pathname}${location.search || ''}#${wf_id}`),
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !workflowResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(
        <WorkflowDetail
          workflow_id={location.hash === '#new' ? null : location.hash.slice(1)}
          close={closeGlobalDrawer}
          mode={location.hash === '#new' ? 'write' : 'read'}
        />
      );
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search.set(o => ({ ...o, query: o.query || '*' })).toObject());
  }, [handleReload, search]);

  useEffect(() => {
    function reload() {
      handleReload(search.set(o => ({ ...o, query: o.query || '*' })).toObject());
    }

    window.addEventListener('reloadWorkflows', reload);

    return () => {
      window.removeEventListener('reloadWorkflows', reload);
    };
  }, [handleReload, search]);

  return currentUser.roles.includes('workflow_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          {currentUser.roles.includes('workflow_manage') && (
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              <Tooltip title={t('add_workflow')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                  }}
                  onClick={() => navigate(`${location.pathname}${location.search ? location.search : ''}#new`)}
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
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={workflowResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${workflowResults?.total === 1 ? '' : 's'}`)
                : t(`total${workflowResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: { title: t('never_used') },
                icon: { children: <EventBusyOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'hit_count:0'] }))
                }
              },
              {
                tooltip: { title: t('old') },
                icon: { children: <EventOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'last_seen:[* TO now-3m]'] }))
                }
              }
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <WorkflowTable workflowResults={workflowResults} setWorkflowID={setWorkflowID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedWorkflowsPage = () => (
  <SearchParamsProvider defaultValue={WORKFLOWS_PARAMS} hidden={['rows', 'offset']} enforced={['rows']}>
    <WorkflowsSearch />
  </SearchParamsProvider>
);

export const WorkflowsPage = React.memo(WrappedWorkflowsPage);
export default WorkflowsPage;
