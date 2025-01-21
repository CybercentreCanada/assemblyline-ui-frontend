import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import type { SearchParams } from 'components/core/SearchParams/SearchParams';
import { createSearchParams } from 'components/core/SearchParams/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/core/SearchParams/SearchParamsContext';
import type { SearchParamsResult } from 'components/core/SearchParams/SearchParser';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { WorkflowIndexed } from 'components/models/base/workflow';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import WorkflowTable from 'components/visual/SearchResult/workflow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import WorkflowCreate from './create';
import WorkflowDetail from './detail';

type SearchResults = {
  items: WorkflowIndexed[];
  offset: number;
  rows: number;
  total: number;
};

const WORKFLOWS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string('last_seen desc').ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  refresh: p.boolean(false).hidden().ignored()
}));

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
    (body: SearchParamsResult<WorkflowsParams>) => {
      if (!currentUser.roles.includes('workflow_view')) return;

      apiCall({
        url: '/api/v4/search/workflow/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setWorkflowResults(api_response as SearchResults),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const setWorkflowID = useCallback(
    (wf_id: string) => navigate(`${location.pathname}${location.search}#/detail/${wf_id}`),
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !workflowResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    const url = new URL(`${window.location.origin}${location.hash.slice(1)}`);

    if (url.pathname.startsWith('/detail/')) {
      setGlobalDrawer(
        <WorkflowDetail
          id={url.pathname.slice('/detail/'.length)}
          onClose={() => navigate(`${location.pathname}${location.search}`)}
        />
      );
    } else if (url.pathname.startsWith('/create/')) {
      setGlobalDrawer(
        <WorkflowCreate
          id={url.pathname.slice('/create/'.length)}
          onClose={id =>
            id
              ? navigate(`${location.pathname}${location.search}#/detail/${id}`)
              : navigate(`${location.pathname}${location.search}`)
          }
        />
      );
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search);
  }, [handleReload, search]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadWorkflows', reload);
    return () => {
      window.removeEventListener('reloadWorkflows', reload);
    };
  }, [setSearchObject]);

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
                  onClick={() => navigate(`${location.pathname}${location.search}#/create/`)}
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
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: { title: t('never_used') },
                icon: { children: <EventBusyOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'hit_count:0'] }))
                }
              },
              {
                tooltip: { title: t('old') },
                icon: { children: <EventOutlinedIcon /> },
                button: {
                  onClick: () =>
                    setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'last_seen:[* TO now-3m]'] }))
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
  <SearchParamsProvider params={WORKFLOWS_PARAMS}>
    <WorkflowsSearch />
  </SearchParamsProvider>
);

export const WorkflowsPage = React.memo(WrappedWorkflowsPage);
export default WorkflowsPage;
