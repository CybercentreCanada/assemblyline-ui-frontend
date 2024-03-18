import ClearIcon from '@mui/icons-material/Clear';
import makeStyles from '@mui/styles/makeStyles';

import ReplayIcon from '@mui/icons-material/Replay';
import { Alert, Button, Chip, CircularProgress, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SearchQuery, { SearchFilter } from 'components/visual/SearchBar/search-query';
import React, { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertsFiltersSelected from './alerts-filters-selected';

const POSSIBLE_STATUS = ['ASSESS', 'MALICIOUS', 'NON-MALICIOUS'];
const POSSIBLE_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const DEFAULT_LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
];

const useStyles = makeStyles(theme => ({
  existing_label: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
    marginRight: theme.spacing(0.5)
  },
  removed_label: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark : theme.palette.error.light,
    marginRight: theme.spacing(0.5)
  },
  added_label: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
    marginRight: theme.spacing(0.5)
  }
}));

interface AlertsWorkflowActionsProps {
  searchQuery: SearchQuery;
  alert: any;
  labelFilters: SearchFilter[];
  onApplyBtnClick: (
    status: string,
    selectedPriority: string,
    selectedLabels: string[],
    addedLabels: string[],
    removedLabels: string[]
  ) => void;
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  searchQuery,
  alert,
  labelFilters,
  onApplyBtnClick
}) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [possibleLabels] = useState<string[]>([
    ...DEFAULT_LABELS,
    ...labelFilters.filter(lbl => DEFAULT_LABELS.indexOf(lbl.label) === -1).map(val => val.label)
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const currentLabels = alert.labels;
  const [selectedLabels, setSelectedLabels] = useState<string[]>(currentLabels);
  const [addedLabels, setAddedLabels] = useState<string[]>([]);
  const [removedLabels, setRemovedLabels] = useState<string[]>([]);

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

  const renderLabelTags = (values: string[]) => {
    return values.map(value => (
      <Chip
        label={value}
        // Render existing labels as neutral, adding labels as positive, removed labels as negative
        className={
          removedLabels.indexOf(value) > -1
            ? classes.removed_label
            : addedLabels.indexOf(value) > -1
            ? classes.added_label
            : classes.existing_label
        }
        onDelete={() => onLabelDelete(value)}
        deleteIcon={removedLabels.indexOf(value) > -1 ? <ReplayIcon /> : <ClearIcon />}
      />
    ));
  };

  const onLabelChange = (selections: string[], reason: string) => {
    if (reason === 'clear') {
      // On clear, we'll reset all the label lists to factory values
      setSelectedLabels(currentLabels);
      setAddedLabels([]);
      setRemovedLabels([]);
    } else {
      setSelectedLabels(selections.map(val => val.toUpperCase()));
      setAddedLabels(
        selections.filter(s => {
          return currentLabels.indexOf(s) === -1;
        })
      );
    }
    validateForm(selectedStatus, selectedPriority, [...addedLabels, ...removedLabels]);
  };

  const onLabelDelete = (name: string) => {
    // If we're trying to undo removing an existing label, then we need to revert it's visual state
    if (removedLabels.indexOf(name) > -1) {
      // Remove from removed label list only
      setRemovedLabels(
        removedLabels.filter(label => {
          return label !== name;
        })
      );
    }
    // If the label being deleted was a new label, then we can get rid of it
    else if (addedLabels.indexOf(name) > -1) {
      // Remove from added label list
      setAddedLabels(
        addedLabels.filter(label => {
          return label !== name;
        })
      );

      // Remove from selected label list
      setSelectedLabels(
        selectedLabels.filter(label => {
          return label !== name;
        })
      );
    }
    // If the label being deleted was an existing label, then we need to change it's visual state but not completely remove it from view
    else if (currentLabels.indexOf(name) > -1) {
      setRemovedLabels([...removedLabels, name]);
    }
    validateForm(selectedStatus, selectedPriority, [...addedLabels, ...removedLabels]);
  };

  const _onApplyBtnClick = () => {
    if (formValid) {
      setApplying(true);
      onApplyBtnClick(
        selectedStatus,
        selectedPriority,
        selectedLabels.filter(label => {
          return removedLabels.indexOf(label) === -1;
        }),
        addedLabels,
        removedLabels
      );
    }
  };

  const emptyFilters = () => {
    const filters = searchQuery.parseFilters();
    if (
      filters.tc === '' &&
      filters.labels.length === 0 &&
      filters.priorities.length === 0 &&
      filters.queries.length === 0 &&
      filters.statuses.length === 0
    ) {
      return true;
    }

    return false;
  };

  const query = searchQuery.getQuery();

  return (
    <div>
      <div style={{ margin: theme.spacing(1), marginBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('workflow.title')}</Typography>
      </div>
      <div style={{ margin: theme.spacing(1) }}>
        <Alert severity={query && query.startsWith('alert_id') && alert ? 'info' : 'warning'}>
          {query || !emptyFilters()
            ? query && query.startsWith('alert_id') && alert
              ? t('workflow.impact.low')
              : t('workflow.impact.high')
            : t('workflow.impact.all')}
        </Alert>
      </div>

      {(query || !emptyFilters()) && (
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
            <AlertsFiltersSelected searchQuery={searchQuery} disableActions hideGroupBy />
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
            options={possibleLabels.filter(label => {
              // Filter out labels that already have been selected
              return selectedLabels.indexOf(label) === -1;
            })}
            value={selectedLabels}
            renderInput={params => <TextField {...params} label={t('labels')} variant="outlined" />}
            onChange={(event, value, reason) => onLabelChange(value as string[], reason)}
            renderTags={(value, getTagProps, ownerState) => renderLabelTags(value)}
          />
          <div style={{ display: 'inline-flex' }}>
            <Chip
              className={classes.existing_label}
              label="existing_label"
              size="small"
              style={{ marginTop: theme.spacing(2) }}
            />
            <Chip
              className={classes.added_label}
              label="label_added"
              size="small"
              style={{ marginTop: theme.spacing(2) }}
            />
            <Chip
              className={classes.removed_label}
              label="label_removed"
              size="small"
              style={{ marginTop: theme.spacing(2) }}
            />
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
        <Tooltip title={t('workflow.apply')}>
          <Button
            variant="contained"
            color="primary"
            onClick={_onApplyBtnClick}
            startIcon={applying ? <CircularProgress size={20} /> : null}
            disabled={applying || !formValid}
          >
            {t('apply')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
