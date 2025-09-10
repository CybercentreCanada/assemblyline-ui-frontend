import CheckIcon from '@mui/icons-material/Check';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import { Grid, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import { useAPIMutation } from 'components/core/Query/API/useAPIMutation';
import { useAPIQuery } from 'components/core/Query/API/useAPIQuery';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Alert } from 'components/models/base/alert';
import type { Priority, Status, Workflow } from 'components/models/base/workflow';
import { LABELS, PRIORITIES, STATUSES } from 'components/models/base/workflow';
import type { SearchResult } from 'components/models/ui/search';
import ForbiddenPage from 'components/routes/403';
import { IconButton } from 'components/visual/Buttons/IconButton';
import Classification from 'components/visual/Classification';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextAreaInput } from 'components/visual/Inputs/TextAreaInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';

type Params = {
  id: string;
};

type Props = {
  id?: string;
  onClose?: (id?: string) => void;
};

const WrappedWorkflowCreate = ({ id: propID = null, onClose = () => null }: Props) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const { id: paramID } = useParams<Params>();
  const theme = useTheme();
  const location = useLocation();
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

  const id = useMemo(() => propID || paramID, [paramID, propID]);

  const modified = useMemo<boolean>(() => !_.isEqual(workflow, originalWorkflow), [originalWorkflow, workflow]);

  const handleAdd = useAPIMutation<[Workflow, boolean], { success: boolean; workflow_id: string }>(
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
        onClose(api_response.workflow_id);
      }
    })
  );

  const handleUpdate = useAPIMutation<[Workflow, boolean], { success: boolean; workflow_id: string }>(
    (wf: Workflow, run: boolean) => ({
      url: `/api/v4/workflow/${id}/?run_workflow=${run}`,
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
        onClose(id);
      }
    })
  );

  const handleFetch = useAPIQuery<Workflow>({
    url: `/api/v4/workflow/${id}/`,
    disabled: !id || !currentUser.roles.includes('workflow_manage') || !originalWorkflow,
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
      onClose();
    }
  });

  useEffect(() => {
    setOriginalWorkflow(defaultWorkflow);
    setWorkflow(defaultWorkflow);
  }, [defaultWorkflow]);

  useEffect(() => {
    const state = location?.state as Workflow;
    if (!state) return;
    setWorkflow(wf => ({
      ...wf,
      ...(state?.classification && { classification: state.classification }),
      ...(state?.name && { name: state.name }),
      ...(state?.query && { query: state.query }),
      ...(Array.isArray(state?.labels) && { labels: state.labels }),
      ...(PRIORITIES.includes(state?.priority) && { priority: state.priority }),
      ...(STATUSES.includes(state?.status) && { status: state.status }),
      ...(state?.enabled && { enabled: state.enabled })
    }));
  }, [location?.state]);

  const handleResults = useAPIQuery<SearchResult<Alert>>({
    url: `/api/v4/search/alert/?query=${encodeURIComponent(workflow?.query)}&rows=10&track_total_hits=true`,
    disabled: !workflow?.query || !currentUser.roles.includes('alert_view'),
    delay: 1000
  });

  const disabled = useMemo<boolean>(
    () =>
      !modified ||
      handleAdd.isPending ||
      handleFetch.isFetching ||
      handleUpdate.isPending ||
      workflow?.name === '' ||
      workflow?.query === '',
    [modified, handleAdd.isPending, handleFetch.isFetching, handleUpdate.isPending, workflow?.name, workflow?.query]
  );

  if (!currentUser.roles.includes('workflow_manage')) return <ForbiddenPage />;
  else
    return (
      <PageCenter margin={2} width="100%">
        {/* <RouterPrompt when={modified && !loading} /> */}

        {c12nDef.enforce && (
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Classification type="picker" c12n={!workflow ? null : workflow.classification} />
          </div>
        )}

        <PageHeader
          primary={t(id ? 'edit.title' : 'add.title')}
          secondary={id}
          secondaryLoading={!workflow}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(2) } }
          }}
          actions={
            <>
              {id ? (
                <>
                  <IconButton tooltip={t('cancel.button')} color="error" onClick={() => onClose(id)}>
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
              required
              onChange={(event, value) => setWorkflow(wf => ({ ...wf, name: value }))}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextAreaInput
              label={t('query')}
              loading={!workflow || handleFetch.isFetching}
              value={!workflow ? null : workflow.query}
              minRows={1}
              maxRows={5}
              required
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
              preventRender={!!id}
              value={runWorkflow}
              onChange={(event, value) => setRunWorkflow(() => value)}
            />
          </Grid>
        </Grid>
      </PageCenter>
    );
};

export const WorkflowCreate = React.memo(WrappedWorkflowCreate);
export default WorkflowCreate;
