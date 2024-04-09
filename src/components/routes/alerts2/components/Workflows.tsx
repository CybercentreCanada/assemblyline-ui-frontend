import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
  Alert,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useLocation } from 'react-router-dom';
import { AlertItem } from '../models/Alert';
import { buildSearchQuery } from '../utils/buildSearchQuery';
import AlertFiltersSelected from './FiltersSelected';

const useStyles = makeStyles(theme => ({
  desc: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  asc: {
    transform: 'rotate(180deg)'
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1)
  },
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  }
}));

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUSES = ['ASSESS', 'MALICIOUS', 'NON-MALICIOUS'] as const;
const LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];
export type Label = (typeof LABELS)[number];

type WorkflowBody = {
  priority: Priority;
  status: Status;
  labels: Label[];
};

type AlertWorkflowDrawerProps = {
  query: SimpleSearchQuery;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
};

export const AlertWorkflowDrawer: React.FC<AlertWorkflowDrawerProps> = React.memo(
  ({
    query = new SimpleSearchQuery(''),
    open = false,
    onOpenChange = () => null,
    onComplete = () => null
  }: AlertWorkflowDrawerProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const classes = useStyles();
    const location = useLocation();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();

    const [body, setBody] = useState<WorkflowBody>({ priority: null, status: null, labels: [] });
    const [waiting, setWaiting] = useState<boolean>(false);

    const params = useMemo<object>(() => query.getParams(), [query]);

    const hasParams = useMemo<boolean>(() => query.has('q') || query.has('fq'), [query]);

    const isSingleAlert = useMemo<boolean>(() => query.getAll('fq').some(fq => fq.startsWith('alert_id')), [query]);

    const validBody = useMemo<boolean>(
      () =>
        PRIORITIES.includes(body.priority) ||
        STATUSES.includes(body.status) ||
        (body.labels.length > 0 && body.labels.every(l => LABELS.includes(l))),
      [body]
    );

    const handleWorkflowSubmit = useCallback(() => {
      apiCall({
        url: `/api/v4/alert/all/batch/?${query.toString()}`,
        method: 'POST',
        body: body,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) {
            showErrorMessage(t('workflow.error'));
            return;
          } else {
            console.log(api_response);
            new CustomEvent<AlertItem>('alertUpdate', { detail: { ...alert, owner: currentUser.username } });
            showSuccessMessage(t('workflow.success'));
          }
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          onComplete();
        }
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert, currentUser.username, onComplete, query, showErrorMessage, showSuccessMessage, t]);

    return (
      <>
        <Drawer open={open} anchor="right" onClose={() => onOpenChange(false)}>
          <div style={{ padding: theme.spacing(1) }}>
            <IconButton onClick={() => onOpenChange(false)} size="large">
              <CloseOutlinedIcon />
            </IconButton>
          </div>
          <div className={classes.drawerInner}>
            <div style={{ margin: theme.spacing(1), marginBottom: theme.spacing(2) }}>
              <Typography variant="h4">{t('workflow.title')}</Typography>
            </div>
            <div style={{ margin: theme.spacing(1) }}>
              <Alert severity={isSingleAlert ? 'info' : 'warning'}>
                {isSingleAlert
                  ? t('workflow.impact.low')
                  : hasParams
                  ? t('workflow.impact.high')
                  : t('workflow.impact.all')}
              </Alert>
            </div>

            {hasParams && (
              <div style={{ margin: theme.spacing(1) }}>
                <div
                  style={{
                    wordBreak: 'break-word',
                    marginTop: theme.spacing(1),
                    padding: theme.spacing(2),
                    color: theme.palette.primary.light,
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
                  }}
                >
                  <AlertFiltersSelected query={query} disableActions hideGroupBy hideSort />
                </div>
              </div>
            )}

            <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
              <div style={{ marginBottom: theme.spacing(2) }}>
                <Autocomplete
                  fullWidth
                  multiple={false}
                  options={STATUSES}
                  value={body.status}
                  onChange={(event: SyntheticEvent<Element, Event>, value: Status) =>
                    setBody(b => ({ ...b, status: value }))
                  }
                  renderInput={props => <TextField {...props} label={t('status')} variant="outlined" />}
                />
              </div>
              <div style={{ marginBottom: theme.spacing(2) }}>
                <Autocomplete
                  fullWidth
                  multiple={false}
                  options={PRIORITIES}
                  value={body.priority}
                  onChange={(event: SyntheticEvent<Element, Event>, value: Priority) =>
                    setBody(b => ({ ...b, priority: value }))
                  }
                  renderInput={props => <TextField {...props} label={t('priority')} variant="outlined" />}
                />
              </div>
              <div style={{ marginBottom: theme.spacing(2) }}>
                <Autocomplete
                  fullWidth
                  multiple
                  freeSolo
                  options={LABELS}
                  value={body.labels}
                  renderInput={props => <TextField {...props} label={t('labels')} variant="outlined" />}
                  onChange={(event, values: Label[]) => setBody(b => ({ ...b, labels: values }))}
                />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
              <Tooltip title={t('workflow.apply')}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit()}
                    startIcon={waiting ? <CircularProgress size={20} /> : null}
                    disabled={waiting || !validBody}
                  >
                    {t('apply')}
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
);

const WrappedAlertWorkflows = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const location = useLocation();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [open, setOpen] = useState<boolean>(false);

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const query = useMemo<SimpleSearchQuery>(
    () => buildSearchQuery({ search: location.search, singles: ['q', 'tc_start', 'tc'], multiples: ['fq'] }),
    [location.search]
  );

  if (!currentUser.roles.includes('alert_manage')) return null;
  else
    return (
      <>
        <Tooltip title={t('workflows')}>
          <span>
            <IconButton size="large" onClick={() => setOpen(true)} style={{ marginRight: 0 }}>
              <BiNetworkChart
                style={{
                  height: isMDUp ? theme.spacing(2.5) : theme.spacing(2),
                  width: isMDUp ? theme.spacing(2.5) : theme.spacing(2),
                  margin: theme.spacing(0.25)
                }}
              />
            </IconButton>
          </span>
        </Tooltip>

        <AlertWorkflowDrawer query={query} open={open} onOpenChange={o => setOpen(o)} />
      </>
    );
};

export const AlertWorkflows = React.memo(WrappedAlertWorkflows);
export default AlertWorkflows;
