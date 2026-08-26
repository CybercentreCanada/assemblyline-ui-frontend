import CheckIcon from '@mui/icons-material/Check';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import { Grid, useTheme } from '@mui/material';
import { useApiMutation, useApiQuery } from 'core/api';
import { useAppBlocker, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import lodashIsEqual from 'lodash/isEqual';
import type { SearchResult } from 'models/api/search';
import type { Alert } from 'models/base/alert';
import type { Priority, Status, Workflow } from 'models/base/workflow';
import { LABELS, PRIORITIES, STATUSES } from 'models/base/workflow';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';
import Classification from 'ui/Classification';
import { CheckboxInput } from 'ui/inputs/CheckboxInput';
import { ChipsInput } from 'ui/inputs/ChipsInput';
import { SelectInput } from 'ui/inputs/SelectInput';
import { TextAreaInput } from 'ui/inputs/TextAreaInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageHeader } from 'ui/layouts/PageHeader';

export const ManageWorkflowCreatePage = memo(() => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const paramID = useAppPathParams<'/manage/workflow/create/:id' | '/manage/workflow/create'>()?.id;
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/workflow/create/:id' | '/manage/workflow/create'>();
  const search = useAppSearchSnapshot<'/manage/workflow/create'>();
  const { c12nDef, configuration, user: currentUser } = useALContext();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [workflow, setWorkflow] = useState<Workflow>(null);
  const [originalWorkflow, setOriginalWorkflow] = useState<Workflow>(null);
  const [runWorkflow, setRunWorkflow] = useState<boolean>(false);

  const defaultWorkflow = useMemo<Workflow>(
    () => ({
      classification: c12nDef.UNRESTRICTED,
      creation_date: undefined,
      creator: '',
      description: '',
      edited_by: '',
      enabled: true,
      hit_count: 0,
      id: '',
      labels: [],
      last_edit: undefined,
      name: '',
      origin: configuration.ui.fqdn,
      priority: '',
      query: '',
      status: ''
    }),
    [c12nDef.UNRESTRICTED, configuration.ui.fqdn]
  );

  const modified = useMemo<boolean>(() => !lodashIsEqual(workflow, originalWorkflow), [originalWorkflow, workflow]);

  useAppBlocker(() => (modified ? 'unsaved_changes' : null), [modified]);

  const handleAdd = useApiMutation<[Workflow, boolean], { success: boolean; workflow_id: string }>(
    (wf: Workflow, run: boolean) => ({
      url: `/api/v4/workflow/?run_workflow=${run}`,
      method: 'PUT',
      body: {
        ...wf,
        priority: !wf.priority ? null : wf.priority,
        status: !wf.status ? null : wf.status
      },
      disabled: !currentUser.roles.includes('workflow_manage'),
      onSuccess: ({ api_response }) => {
        showSuccessMessage(t('add.success'));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
        setTimeout(() => window.dispatchEvent(new CustomEvent('alertRefresh', null)), 1500);
        navigate
          .here<'/manage/workflow/detail/:id'>({ ignoreBlocker: true })
          .create({ route: '/manage/workflow/detail/:id', path: { id: api_response.workflow_id } });
      }
    })
  );

  const handleUpdate = useApiMutation<[Workflow, boolean], { success: boolean; workflow_id: string }>(
    (wf: Workflow, run: boolean) => ({
      url: `/api/v4/workflow/${paramID}/?run_workflow=${run}`,
      method: 'POST',
      body: {
        ...wf,
        priority: !wf.priority ? null : wf.priority,
        status: !wf.status ? null : wf.status
      },
      disabled: !currentUser.roles.includes('workflow_manage'),
      onSuccess: () => {
        showSuccessMessage(t('update.success'));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
        navigate
          .here<'/manage/workflow/detail/:id'>({ ignoreBlocker: true })
          .create({ route: '/manage/workflow/detail/:id', path: { id: paramID } });
      }
    })
  );

  const handleFetch = useApiQuery<Workflow>({
    url: `/api/v4/workflow/${paramID}/`,
    disabled: !paramID || !currentUser.roles.includes('workflow_manage') || !originalWorkflow,
    onSuccess: ({ api_response }) => {
      const wf = {
        ...api_response,
        status: api_response.status || '',
        priority: api_response.priority || '',
        enabled: api_response.enabled === undefined ? true : api_response.enabled
      } as Workflow;
      setWorkflow(wf);
      setOriginalWorkflow(wf);
    },
    onFailure: api_data => {
      showErrorMessage(api_data.api_error_message);
      navigate.here().closePanel({ route: '/manage/workflows' });
    }
  });

  useEffect(() => {
    setOriginalWorkflow(defaultWorkflow);
    setWorkflow(defaultWorkflow);
  }, [defaultWorkflow]);

  useEffect(() => {
    setWorkflow(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        ...(search.get('classification') && { classification: search.get('classification') }),
        ...(search.get('name') && { name: search.get('name') }),
        ...(search.get('query') && { query: search.get('query') }),
        ...(Array.isArray(search.get('labels')) && { labels: search.get('labels') }),
        ...(PRIORITIES.includes(search.get('priority') as Priority) && {
          priority: search.get('priority') as Priority
        }),
        ...(STATUSES.includes(search.get('status') as Status) && { status: search.get('status') as Status }),
        ...(typeof search.get('enabled') === 'boolean' && { enabled: search.get('enabled') })
      };
    });
  }, [search?.toString()]);

  const handleResults = useApiQuery<SearchResult<Alert>>({
    url: `/api/v4/search/alert/?query=${encodeURIComponent(workflow?.query)}&rows=10&track_total_hits=true`,
    disabled: !workflow?.query || !currentUser.roles.includes('alert_view'),
    delay: 400,
    onFailure: () => null
  });

  const disabled = useMemo<boolean>(
    () =>
      !modified ||
      handleAdd.isPending ||
      handleFetch.isFetching ||
      handleUpdate.isPending ||
      workflow?.name === '' ||
      workflow?.query === '' ||
      handleResults.isDebouncing ||
      handleResults.isFetching ||
      !!handleResults.error,
    [
      modified,
      handleAdd.isPending,
      handleFetch.isFetching,
      handleUpdate.isPending,
      workflow?.name,
      workflow?.query,
      handleResults.isDebouncing,
      handleResults.isFetching,
      handleResults.error
    ]
  );

  return (
    <AppPageCenter>
      {/* <RouterPrompt when={modified && !loading} /> */}

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Classification
            type="picker"
            format="long"
            c12n={workflow?.classification || ''}
            setClassification={v => setWorkflow(wf => ({ ...wf, classification: v }))}
          />
        </div>
      )}

      <PageHeader
        primary={t(paramID ? 'edit.title' : 'add.title')}
        secondary={paramID}
        secondaryLoading={!workflow}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <>
            {paramID ? (
              <>
                <IconButton
                  tooltip={t('cancel.button')}
                  color="error"
                  onClick={() =>
                    navigate
                      .here<'/manage/workflow/detail/:id'>()
                      .create({ route: '/manage/workflow/detail/:id', path: { id: paramID } })
                  }
                >
                  <DoDisturbAltOutlinedIcon />
                </IconButton>

                <IconButton
                  tooltip={t('update.button')}
                  color="success"
                  disabled={disabled}
                  onClick={() => handleUpdate.mutate(workflow, runWorkflow)}
                >
                  <CheckIcon />
                </IconButton>
              </>
            ) : (
              <IconButton
                tooltip={t('add.button')}
                color="success"
                disabled={disabled}
                onClick={() => handleAdd.mutate(workflow, runWorkflow)}
              >
                <CheckIcon />
              </IconButton>
            )}
          </>
        }
      />

      <Grid container spacing={2} textAlign="start">
        <Grid size={{ xs: 12 }}>
          <TextInput
            label={t('name')}
            loading={!workflow || handleFetch.isFetching}
            value={!workflow ? null : workflow.name}
            coercers={c => c.required()}
            validators={v => v.required()}
            onChange={(event, value) => setWorkflow(wf => ({ ...wf, name: value }))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextAreaInput
            label={t('query')}
            loading={!workflow || handleFetch.isFetching}
            value={!workflow ? null : workflow.query}
            progress={handleResults.isDebouncing || handleResults.isFetching ? t('query.validating') : null}
            coercers={c => c.required()}
            validators={v => v.required()}
            validate={() => (handleResults.error ? { status: 'error', message: handleResults.error } : null)}
            minRows={1}
            maxRows={5}
            onChange={(event, value) => setWorkflow(wf => ({ ...wf, query: value }))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ChipsInput
            label={t('labels')}
            loading={!workflow || handleFetch.isFetching}
            value={!workflow ? null : workflow.labels}
            options={LABELS}
            onChange={(event, value) => setWorkflow(wf => ({ ...wf, labels: value.map(v => v.toUpperCase()) }))}
            isOptionEqualToValue={(option: string, value: string) => option.toUpperCase() === value.toUpperCase()}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectInput
            label={t('priority')}
            loading={!workflow || handleFetch.isFetching}
            value={!workflow ? null : workflow.priority}
            options={PRIORITIES.map(v => ({ primary: t(`priority.${v || 'null'}`), value: v }))}
            onChange={(event, value: Priority) => setWorkflow(wf => ({ ...wf, priority: value }))}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectInput
            label={t('status')}
            loading={!workflow || handleFetch.isFetching}
            value={!workflow ? null : workflow.status}
            options={STATUSES.map(v => ({ primary: t(`status.${v || 'null'}`), value: v }))}
            onChange={(event, value: Status) => setWorkflow(wf => ({ ...wf, status: value }))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CheckboxInput
            label={`${t('backport_workflow_prompt')} ${handleResults.data?.total || 0} ${t('backport_workflow_matching')}`}
            loading={!workflow || handleFetch.isFetching}
            preventRender={!!paramID}
            value={runWorkflow}
            onChange={(event, value) => setRunWorkflow(() => value)}
          />
        </Grid>
      </Grid>
    </AppPageCenter>
  );
});

export const ManageWorkflowCreateRoute = createAppRoute({
  component: ManageWorkflowCreatePage,

  path: '/manage/workflow/create/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/manage/workflows',
  shortname: location => [
    'app_route.manage_workflow_create_id.shortname',
    { ns: 'manageWorkflowDetail', id: location.path.id }
  ],
  fullname: location => [
    'app_route.manage_workflow_create_id.fullname',
    { ns: 'manageWorkflowDetail', id: location.path.id }
  ],
  shorticon: () => <CreateOutlinedIcon />,
  fullicon: () => <CreateOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('workflow_manage')
});

export const ManageWorkflowCreateRootRoute = createAppRoute({
  component: ManageWorkflowCreatePage,

  path: '/manage/workflow/create',
  search: s => ({
    classification: s.string('').source('transient').ephemeral(),
    name: s.string('').source('transient').ephemeral(),
    query: s.string('').source('transient').ephemeral(),
    labels: s.filters([]).source('transient').ephemeral(),
    priority: s.string('').source('transient').ephemeral(),
    status: s.string('').source('transient').ephemeral(),
    enabled: s.boolean(true).source('transient').ephemeral()
  }),

  ancestor: '/manage/workflows',
  shortname: () => ['app_route.manage_workflow_create_root.shortname', { ns: 'manageWorkflowDetail' }],
  fullname: () => ['app_route.manage_workflow_create_root.fullname', { ns: 'manageWorkflowDetail' }],
  shorticon: () => <CreateOutlinedIcon />,
  fullicon: () => <CreateOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('workflow_manage')
});
