import { Button, CircularProgress, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import SearchQuery, { SearchFilter } from 'components/visual/SearchBar/search-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertsFiltersSelected from './alerts-filters-selected';

const POSSIBLE_STATUS = ['ASSESS', 'MALICIOUS', 'NON-MALICIOUS'];
const POSSIBLE_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

interface AlertsWorkflowActionsProps {
  searchQuery: SearchQuery;
  affectedItemCount: number;
  labelFilters: SearchFilter[];
  onApplyBtnClick: (status: string, selectedPriority: string, selectedLabels: string[]) => void;
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  searchQuery,
  affectedItemCount,
  labelFilters,
  onApplyBtnClick
}) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [possibleLabels] = useState<string[]>(labelFilters.map(val => val.label));
  const [selectedStatus, setSelectedStatus] = useState<string>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>(null);
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
      onApplyBtnClick(selectedStatus, selectedPriority, selectedLabels);
    }
  };

  return (
    <div>
      <div style={{ margin: theme.spacing(1), marginBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('workflow.title')}</Typography>
      </div>
      <div style={{ margin: theme.spacing(1) }}>
        <Alert severity={affectedItemCount > 1 ? 'warning' : 'info'}>
          {affectedItemCount > 1
            ? t('workflow.impact.high').replace('{affectedItemCount}', affectedItemCount.toString())
            : t('workflow.impact.low')}
        </Alert>
      </div>

      <div style={{ margin: theme.spacing(1) }}>
        <div
          style={{
            wordBreak: 'break-all',
            marginTop: theme.spacing(1),
            padding: theme.spacing(2),
            color: theme.palette.primary.light,
            backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
          }}
        >
          <AlertsFiltersSelected searchQuery={searchQuery} disableActions hideGroupBy />
        </div>
      </div>

      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            classes={{ option: classes.option }}
            options={POSSIBLE_STATUS}
            value={selectedStatus}
            renderInput={params => <TextField {...params} label="Statuses" variant="outlined" />}
            onChange={(event, value) => onStatusChange(value as string)}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            classes={{ option: classes.option }}
            options={POSSIBLE_PRIORITY}
            value={selectedPriority}
            renderInput={params => <TextField {...params} label="Priorities" variant="outlined" />}
            onChange={(event, value) => onPriorityChange(value as string)}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple
            freeSolo
            classes={{ option: classes.option }}
            options={possibleLabels}
            value={selectedLabels}
            renderInput={params => <TextField {...params} label="Labels" variant="outlined" />}
            onChange={(event, value) => onLabelChange(value as string[])}
          />
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
        <Button
          variant="contained"
          color="primary"
          onClick={_onApplyBtnClick}
          startIcon={applying ? <CircularProgress size={20} /> : null}
          disabled={applying || !formValid}
        >
          {t('workflow.apply')}
        </Button>
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
