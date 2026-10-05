import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import { useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import PageContainer from 'core/template/components/AppPageContainer';
import PageFullWidth from 'deprecated/legacy/commons/components/pages/PageFullWidth';
import {
  createSearchParams,
  SearchParamsProvider,
  useSearchParams
} from 'deprecated/legacy/components/core/SearchParams/createSearchParams';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import useDrawer from 'deprecated/legacy/components/hooks/useDrawer';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { WorkflowIndexed } from 'models/base/workflow';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import ForbiddenPage from 'routes/forbidden/forbidden';
import WorkflowCreate from 'routes/manage-workflow-create/manage-workflow-create.route';
import WorkflowDetail from 'routes/manage-workflow-detail/manage-workflow-detail.route';
import { PageHeader } from 'ui/layouts/PageHeader';
import SearchHeader from 'ui/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import WorkflowTable from 'routes/search/components/workflow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

type SearchResults = {
  items: WorkflowIndexed[];
  offset: number;
  rows: number;
  total: number;
};

const WORKFLOWS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('last_seen desc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('snapshot').ephemeral()
}));

type WorkflowsParams = typeof WORKFLOWS_PARAMS;

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

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.workflow, ...DEFAULT_SUGGESTION }),
    [indexes.workflow]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  const handleReload = useCallback(
    (body: typeof search) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

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
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          currentUser.roles.includes('workflow_manage') && (
            <Grid size={{ xs: 'grow' }} style={{ textAlign: 'right', flexGrow: 0 }}>
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
          )
        }
      />

      <PageContainer isSticky>
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
                tooltip: {
                  title: search.has('filters', 'hit_count:0')
                    ? t('filter.never_used.remove')
                    : t('filter.never_used.add')
                },
                icon: { children: <EventBusyOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'hit_count:0') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('hit_count:0')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'last_seen:[* TO now-3M]') ? t('filter.old.remove') : t('filter.old.add')
                },
                icon: { children: <EventOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'last_seen:[* TO now-3M]') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('last_seen:[* TO now-3M]')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

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
