import CheckIcon from '@mui/icons-material/Check';
import type { Theme } from '@mui/material';
import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';

import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import FormControl from '@mui/material/FormControl';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import Throttler from 'commons/addons/utils/throttler';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Alert } from 'components/models/base/alert';
import type { Priority, Status, Workflow } from 'components/models/base/workflow';
import { LABELS, PRIORITIES, STATUSES } from 'components/models/base/workflow';
import type { SearchResult } from 'components/models/ui/search';
import ForbiddenPage from 'components/routes/403';
import Classification from 'components/visual/Classification';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
const useStyles = makeStyles(() => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const THROTTLER = new Throttler(1000);

const MyMenuItem = withStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: theme.spacing(4)
    }
  })
)(MenuItem);

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
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { c12nDef, configuration, user: currentUser } = useALContext();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [workflow, setWorkflow] = useState<Workflow>(null);
  const [originalWorkflow, setOriginalWorkflow] = useState<Workflow>(null);
  const [badQuery, setBadQuery] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult<Alert>>(null);
  const [runWorkflow, setRunWorkflow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef(null);

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

  const disabled = useMemo<boolean>(
    () => loading || !modified || badQuery || workflow?.query === '' || workflow?.name === '',
    [badQuery, loading, modified, workflow?.name, workflow?.query]
  );

  const handleAdd = useCallback(
    (wf: Workflow, run: boolean) => {
      if (!currentUser.roles.includes('workflow_manage')) return;

      apiCall<{ success: boolean; workflow_id: string }>({
        url: `/api/v4/workflow/?run_workflow=${run}`,
        method: 'PUT',
        body: {
          ...wf,
          priority: !wf.priority ? null : wf.priority,
          status: !wf.status ? null : wf.status
        },
        onSuccess: ({ api_response }) => {
          showSuccessMessage(t('add.success'));
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
          setTimeout(() => window.dispatchEvent(new CustomEvent('alertRefresh', null)), 1500);
          onClose(api_response.workflow_id);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, t]
  );

  const handleUpdate = useCallback(
    (wf: Workflow, run: boolean) => {
      if (!currentUser.roles.includes('workflow_manage')) return;

      apiCall<{ success: boolean; workflow_id: string }>({
        url: `/api/v4/workflow/${id}/?run_workflow=${run}`,
        method: 'POST',
        body: {
          ...wf,
          priority: !wf.priority ? null : wf.priority,
          status: !wf.status ? null : wf.status
        },
        onSuccess: () => {
          showSuccessMessage(t('update.success'));
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
          onClose(id);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, id, t]
  );

  useEffect(() => {
    if (!id || !currentUser.roles.includes('workflow_manage')) return;

    apiCall<Workflow>({
      url: `/api/v4/workflow/${id}/`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, id, onClose]);

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

  useEffect(() => {
    THROTTLER.delay(() => {
      if (!!workflow?.query && currentUser.roles.includes('alert_view')) {
        apiCall<SearchResult<Alert>>({
          method: 'GET',
          url: `/api/v4/search/alert/?query=${encodeURIComponent(workflow?.query)}&rows=10&track_total_hits=true`,
          onSuccess: ({ api_response }) => {
            setResults(api_response);
            setBadQuery(false);
          },
          onFailure: () => {
            setResults({ items: [], offset: 0, rows: 10, total: 0 });
            setBadQuery(true);
          }
        });
      } else {
        setResults({ items: [], offset: 0, rows: 10, total: 0 });
        setBadQuery(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.query]);

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

        <div style={{ textAlign: 'left' }}>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Typography variant="h4">{t(id ? 'edit.title' : 'add.title')}</Typography>
                <Typography variant="caption">
                  {!id ? null : workflow ? id : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm
                style={{ display: 'flex', justifyContent: 'flex-end', columnGap: theme.spacing(1) }}
              >
                {id ? (
                  <>
                    <Tooltip title={t('cancel.button')}>
                      <IconButton
                        style={{
                          color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                        onClick={() => onClose(id)}
                      >
                        <DoDisturbAltOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('update.button')}>
                      <IconButton
                        style={{
                          color: !disabled
                            ? theme.palette.mode === 'dark'
                              ? theme.palette.success.light
                              : theme.palette.success.dark
                            : theme.palette.grey[750]
                        }}
                        disabled={disabled}
                        onClick={() => handleUpdate(workflow, runWorkflow)}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title={t('add.button')}>
                    <IconButton
                      style={{
                        color: !disabled
                          ? theme.palette.mode === 'dark'
                            ? theme.palette.success.light
                            : theme.palette.success.dark
                          : theme.palette.grey[750]
                      }}
                      disabled={disabled}
                      onClick={() => handleAdd(workflow, runWorkflow)}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </div>
        </div>

        <Grid container spacing={2} textAlign="start">
          <Grid item xs={12}>
            <Typography variant="subtitle2">{`${t('name')} ${t('required')}`}</Typography>
            {!workflow ? (
              <Skeleton style={{ height: '2.5rem' }} />
            ) : (
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                value={workflow.name}
                onChange={event => setWorkflow(wf => ({ ...wf, name: event.target.value }))}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{`${t('query')} ${t('required')}`}</Typography>
            {!workflow ? (
              <Skeleton style={{ height: '2.5rem' }} />
            ) : (
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                error={badQuery}
                value={workflow.query}
                onChange={event => setWorkflow(wf => ({ ...wf, query: event.target.value }))}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('labels')}</Typography>
            {!workflow ? (
              <Skeleton style={{ height: '2.5rem' }} />
            ) : (
              <Autocomplete
                fullWidth
                multiple
                freeSolo
                options={LABELS}
                value={workflow.labels}
                renderInput={params => <TextField {...params} variant="outlined" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip label={option} {...getTagProps({ index })} key={index} />)
                }
                onChange={(event, value) => setWorkflow(wf => ({ ...wf, labels: value.map(v => v.toUpperCase()) }))}
                isOptionEqualToValue={(option, value) => option.toUpperCase() === value.toUpperCase()}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('priority')}</Typography>
            {workflow ? (
              <FormControl size="small" fullWidth>
                <Select
                  id="priority"
                  fullWidth
                  value={workflow.priority}
                  onChange={event => setWorkflow(wf => ({ ...wf, priority: event.target.value as Priority }))}
                  variant="outlined"
                >
                  <MyMenuItem value="">{t('priority.null')}</MyMenuItem>
                  <MyMenuItem value="LOW">{t('priority.LOW')}</MyMenuItem>
                  <MyMenuItem value="MEDIUM">{t('priority.MEDIUM')}</MyMenuItem>
                  <MyMenuItem value="HIGH">{t('priority.HIGH')}</MyMenuItem>
                  <MyMenuItem value="CRITICAL">{t('priority.CRITICAL')}</MyMenuItem>
                </Select>
              </FormControl>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('status')}</Typography>
            {workflow ? (
              <FormControl size="small" fullWidth>
                <Select
                  id="priority"
                  fullWidth
                  value={workflow.status}
                  onChange={event => setWorkflow(wf => ({ ...wf, status: event.target.value as Status }))}
                  variant="outlined"
                >
                  <MyMenuItem value="">{t('status.null')}</MyMenuItem>
                  <MyMenuItem value="MALICIOUS">{t('status.MALICIOUS')}</MyMenuItem>
                  <MyMenuItem value="NON-MALICIOUS">{t('status.NON-MALICIOUS')}</MyMenuItem>
                  <MyMenuItem value="ASSESS">{t('status.ASSESS')}</MyMenuItem>
                  <MyMenuItem value="TRIAGE">{t('status.TRIAGE')}</MyMenuItem>
                </Select>
              </FormControl>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>

          {!id && (
            <Grid item xs={12}>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <FormControlLabel
                  control={<Checkbox onChange={() => setRunWorkflow(o => !o)} checked={runWorkflow}></Checkbox>}
                  label={
                    <Typography variant="body2">
                      {t('backport_workflow_prompt')} ({results?.total || 0} {t('backport_workflow_matching')})
                    </Typography>
                  }
                />
              )}
            </Grid>
          )}
        </Grid>
      </PageCenter>
    );
};

export const WorkflowCreate = React.memo(WrappedWorkflowCreate);
export default WorkflowCreate;
