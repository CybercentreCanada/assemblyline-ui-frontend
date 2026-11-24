import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useALContext from 'core/config/useALContext';
import { createAppRoute, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { WorkflowIndexed } from 'models/base/workflow';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { ForbiddenPage } from 'routes/forbidden/forbidden.page';
import WorkflowTable from 'routes/search/components/workflow';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

type SearchResults = {
  items: WorkflowIndexed[];
  offset: number;
  rows: number;
  total: number;
};

export const ManageWorkflowsContent = memo(() => {
  const { t } = useTranslation(['manageWorkflows']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/workflows'>();
  const search = useAppSearchSnapshot<'/manage/workflows'>();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [workflowResults, setWorkflowResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.workflow, ...DEFAULT_SUGGESTION }),
    [indexes.workflow]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(value => value !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
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

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    function reload() {
      navigate.here().update(s => ({ ...s, search: { ...s.search, offset: 0, refresh: !s.search.refresh } }));
    }

    window.addEventListener('reloadWorkflows', reload);
    return () => {
      window.removeEventListener('reloadWorkflows', reload);
    };
  }, [navigate]);

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
                  onClick={() => navigate.to().create({ route: '/manage/workflow/create' })}
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
            onChange={values =>
              navigate.here().update(s => ({
                ...s,
                search: { ...s.search, ...ManageWorkflowsRoute.search.full(values).toObject() }
              }))
            }
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
        <WorkflowTable workflowResults={workflowResults} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
});

export const ManageWorkflowsPage = memo(() => <ManageWorkflowsContent />);
ManageWorkflowsPage.displayName = 'ManageWorkflowsPage';

export const ManageWorkflowsRoute = createAppRoute({
  component: ManageWorkflowsPage,

  path: '/manage/workflows',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('last_seen desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    refresh: s.boolean(false).source('transient').ephemeral()
  }),

  ancestor: '/manage',
  shortname: () => ['app_route.manage_workflows.shortname', { ns: 'manageWorkflows' }],
  fullname: () => ['app_route.manage_workflows.fullname', { ns: 'manageWorkflows' }],
  shorticon: () => <BiNetworkChart fontSize="1.3rem" />,
  fullicon: () => <BiNetworkChart fontSize="1.3rem" />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('workflow_view')
});
