import AddIcon from '@mui/icons-material/Add';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
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
import CustomChip from 'components/visual/CustomChip';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useLocation } from 'react-router-dom';
import { AlertItem } from '../models/Alert';
import { buildSearchQuery } from '../utils/alertUtils';
import AlertFiltersSelected from './FiltersSelected';

const useStyles = makeStyles(theme => ({
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  },
  selectMenu: {
    backgroundColor: theme.palette.background.default
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
  labels: (Label | string)[];
  removed_labels: (Label | string)[];
};

type AlertWorkflowDrawerProps = {
  alerts: AlertItem[];
  query: SimpleSearchQuery;
  open: boolean;
  hideTC?: boolean;
  initialBody?: WorkflowBody;
  onClose?: () => void;
};

export const AlertWorkflowDrawer: React.FC<AlertWorkflowDrawerProps> = React.memo(
  ({
    alerts = [],
    query = new SimpleSearchQuery(''),
    open = false,
    hideTC = false,
    initialBody = { priority: null, status: null, labels: [], removed_labels: [] },
    onClose = () => null
  }: AlertWorkflowDrawerProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const classes = useStyles();
    const { apiCall } = useMyAPI();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();

    const [body, setBody] = useState<WorkflowBody>(initialBody);
    const [waiting, setWaiting] = useState<boolean>(false);

    const hasParams = useMemo<boolean>(() => query && (query.has('q') || query.has('fq')), [query]);

    const isSingleAlert = useMemo<boolean>(
      () => query && query.getAll('fq').some(fq => fq.startsWith('alert_id')),
      [query]
    );

    const validBody = useMemo<boolean>(
      () =>
        PRIORITIES.includes(body.priority) ||
        STATUSES.includes(body.status) ||
        body.labels.length > 0 ||
        body.removed_labels.length > 0,
      [body]
    );

    const handleWorkflowSubmit = useCallback(
      (_query: SimpleSearchQuery, _body: WorkflowBody, _alerts: AlertItem[]) => {
        apiCall({
          url: `/api/v4/alert/all/batch/?${_query.toString()}`,
          method: 'POST',
          body: _body,
          onSuccess: ({ api_response }) => {
            if (!api_response.success) {
              showErrorMessage(t('workflow.error'));
              return;
            } else {
              const detail: Partial<AlertItem>[] = _alerts.map(alert => ({
                ...alert,
                ...(!STATUSES.includes(_body.status) ? null : { status: _body.status }),
                ...(!PRIORITIES.includes(_body.priority) ? null : { priority: _body.priority }),
                label: [...alert.label.filter((label: Label) => !_body.removed_labels.includes(label)), ..._body.labels]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .sort()
              }));
              window.dispatchEvent(new CustomEvent<Partial<AlertItem>[]>('alertUpdate', { detail }));
              showSuccessMessage(t('workflow.success'));
            }
          },
          onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
          onEnter: () => setWaiting(true),
          onExit: () => {
            setWaiting(false);
            onClose();
            setBody(initialBody);
          }
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [initialBody, onClose, showErrorMessage, showSuccessMessage, t]
    );

    return (
      <>
        <Drawer
          open={open}
          anchor="right"
          onClose={() => {
            onClose();
            setBody(initialBody);
          }}
        >
          <div style={{ padding: theme.spacing(1) }}>
            <IconButton
              size="large"
              onClick={() => {
                onClose();
                setBody(initialBody);
              }}
            >
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
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
                    borderRadius: theme.spacing(0.5)
                  }}
                >
                  <AlertFiltersSelected query={query} disableActions hideGroupBy hideTC={hideTC} hideSort />
                </div>
              </div>
            )}

            <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
              <div style={{ marginBottom: theme.spacing(2) }}>
                <Autocomplete
                  classes={{ listbox: classes.selectMenu }}
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
                  classes={{ listbox: classes.selectMenu }}
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
                  classes={{ listbox: classes.selectMenu }}
                  fullWidth
                  multiple
                  freeSolo
                  disableCloseOnSelect
                  filterSelectedOptions
                  options={LABELS}
                  value={[...body.labels, ...body.removed_labels].sort()}
                  renderInput={props => <TextField {...props} label={t('labels')} variant="outlined" />}
                  onChange={(event, values: Label[]) =>
                    setBody(b => ({ ...b, labels: values.map(v => v.toUpperCase()) as Label[] }))
                  }
                  renderTags={(values, getTagProps, ownerState) =>
                    values.map((value, index) =>
                      body.labels.includes(value) ? (
                        <CustomChip
                          {...getTagProps({ index })}
                          icon={<AddIcon color="success" />}
                          label={value}
                          color="success"
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            setBody(b => ({
                              ...b,
                              labels: b.labels.filter(label => label !== value),
                              removed_labels: [...b.removed_labels, value]
                            }))
                          }
                          onDelete={() => setBody(b => ({ ...b, labels: b.labels.filter(label => label !== value) }))}
                        />
                      ) : (
                        <CustomChip
                          {...getTagProps({ index })}
                          icon={<RemoveIcon color="error" />}
                          label={value}
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            setBody(b => ({
                              ...b,
                              removed_labels: b.removed_labels.filter(label => label !== value),
                              labels: [...b.labels, value]
                            }))
                          }
                          onDelete={() =>
                            setBody(b => ({ ...b, removed_labels: b.removed_labels.filter(label => label !== value) }))
                          }
                        />
                      )
                    )
                  }
                  isOptionEqualToValue={(option, value) => option.toUpperCase() === value.toUpperCase()}
                />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
              <Tooltip title={t('workflow.apply')}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit(query, body, alerts)}
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

type Props = {
  alerts: AlertItem[];
};

const WrappedAlertWorkflows = ({ alerts = [] }: Props) => {
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

        <AlertWorkflowDrawer alerts={alerts} query={query} open={open} onClose={() => setOpen(false)} />
      </>
    );
};

export const AlertWorkflows = React.memo(WrappedAlertWorkflows);
export default AlertWorkflows;