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
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { SyntheticEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

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

const POSSIBLE_STATUS = ['ASSESS', 'MALICIOUS', 'NON-MALICIOUS'] as const;
const POSSIBLE_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const DEFAULT_LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
] as const;

const WrappedAlertWorkflows = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState<boolean>(false);

  const query = useMemo<SimpleSearchQuery>(() => new SimpleSearchQuery(location.search), [location.search]);

  const queryParam = useMemo<string>(() => (query.has('q') ? query.get('q') : ''), [query]);

  const filtersEmpty = useMemo<boolean>(
    () => true,
    // (!query.has('tc') || query.get('tc', '') === '') &&
    // (!query.has('q') || query.get('q', '') === '') &&
    // (query.getAll('fq', []) as string[]).every(filter => {
    //   if(filter.startsWith('status:'))
    // })
    // (!query.has('tc') || query.get('tc', '') === ''),
    [query]
  );

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const [formValid, setFormValid] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [possibleLabels] = useState<string[]>([
    ...DEFAULT_LABELS
    // ...labelFilters.filter(lbl => DEFAULT_LABELS.indexOf(lbl.label) === -1).map(val => val.label)
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const validateForm = (status: string, priority: string, labels: string[]) => {
    const valid = (status || priority || (labels && labels.length > 0)) as boolean;
    setFormValid(valid);
  };

  const onStatusChange = (selection: string) => {
    validateForm(selection, selectedPriority, selectedLabels);
    setSelectedStatus(selection);
  };

  const onPriorityChange = (selection: string) => {
    validateForm(selectedStatus, selection, selectedLabels);
    setSelectedPriority(selection);
  };

  const onLabelChange = (selections: string[]) => {
    validateForm(selectedStatus, selectedPriority, selections);
    setSelectedLabels(selections.map(val => val.toUpperCase()));
  };

  const _onApplyBtnClick = () => {
    if (formValid) {
      setApplying(true);
      // onApplyBtnClick(selectedStatus, selectedPriority, selectedLabels);
    }
  };

  const emptyFilters = () => {
    // const filters = searchQuery.parseFilters();
    // if (
    //   filters.tc === '' &&
    //   filters.labels.length === 0 &&
    //   filters.priorities.length === 0 &&
    //   filters.queries.length === 0 &&
    //   filters.statuses.length === 0
    // ) {
    //   return true;
    // }
    // return false;
  };

  // const query = searchQuery.getQuery();

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

      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        <div style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={() => setOpen(false)} size="large">
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div className={classes.drawerInner}>
          <div style={{ margin: theme.spacing(1), marginBottom: theme.spacing(2) }}>
            <Typography variant="h4">{t('workflow.title')}</Typography>
          </div>
          <div style={{ margin: theme.spacing(1) }}>
            <Alert severity={queryParam && queryParam.startsWith('alert_id') && alert ? 'info' : 'warning'}>
              {query || !filtersEmpty
                ? queryParam && queryParam.startsWith('alert_id') && alert
                  ? t('workflow.impact.low')
                  : t('workflow.impact.high')
                : t('workflow.impact.all')}
            </Alert>
          </div>

          {(queryParam || !filtersEmpty) && (
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
                {/* <AlertsFiltersSelected searchQuery={searchQuery} disableActions hideGroupBy /> */}
              </div>
            </div>
          )}

          <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
            <div style={{ marginBottom: theme.spacing(2) }}>
              <Autocomplete
                fullWidth
                multiple={false}
                options={POSSIBLE_STATUS}
                value={selectedStatus}
                onChange={(event: SyntheticEvent<Element, Event>, value: string) => onStatusChange(value as string)}
                renderInput={params => <TextField {...params} label={t('status')} variant="outlined" />}
              />
            </div>
            <div style={{ marginBottom: theme.spacing(2) }}>
              <Autocomplete
                fullWidth
                multiple={false}
                options={POSSIBLE_PRIORITY}
                value={selectedPriority}
                onChange={(event: SyntheticEvent<Element, Event>, value: string) => onPriorityChange(value as string)}
                renderInput={params => <TextField {...params} label={t('priority')} variant="outlined" />}
              />
            </div>
            <div style={{ marginBottom: theme.spacing(2) }}>
              <Autocomplete
                fullWidth
                multiple
                freeSolo
                options={possibleLabels}
                value={selectedLabels}
                renderInput={params => <TextField {...params} label={t('labels')} variant="outlined" />}
                onChange={(event, value) => onLabelChange(value as string[])}
              />
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
            <Tooltip title={t('workflow.apply')}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={_onApplyBtnClick}
                  startIcon={applying ? <CircularProgress size={20} /> : null}
                  disabled={applying || !formValid}
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
};

export const AlertWorkflows = React.memo(WrappedAlertWorkflows);
export default AlertWorkflows;
