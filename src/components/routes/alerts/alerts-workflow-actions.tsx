import { Button, CircularProgress, Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import CloseIcon from '@material-ui/icons/ExitToApp';
import SaveIcon from '@material-ui/icons/Save';
import { Alert, Autocomplete } from '@material-ui/lab';
import SearchQuery, {
  EMPTY_SEARCHFILTER,
  SearchFilter,
  SearchFilterType
} from 'components/elements/search/search-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertsFiltersSelected from './alerts-filters-selected';

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

interface AlertsWorkflowActionsProps {
  query: SearchQuery;
  affectedItemCount: number;
  statusFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  labelFilters: SearchFilter[];
  onApplyBtnClick: (status: string, selectedPriority: string, selectedLabels: string[]) => void;
  onCancelBtnClick: () => void;
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  query,
  affectedItemCount,
  statusFilters,
  priorityFilters,
  labelFilters,
  onApplyBtnClick,
  onCancelBtnClick
}) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<SearchFilter>(null);
  const [selectedPriority, setSelectedPriority] = useState<SearchFilter>(null);
  const [selectedLabels, setSelectedLabels] = useState<SearchFilter[]>([]);

  const validate = (status: SearchFilter, priority: SearchFilter, labels: SearchFilter[]) => {
    const valid = (status || priority || (labels && labels.length > 0)) as boolean;
    setFormValid(valid);
  };

  const onStatusChange = (selection: SearchFilter) => {
    validate(selection, selectedPriority, selectedLabels);
    setSelectedStatus(selection);
  };

  const onPriorityChange = (selection: SearchFilter) => {
    validate(selectedStatus, selection, selectedLabels);
    setSelectedPriority(selection);
  };

  const onLabelChange = (selections: SearchFilter[]) => {
    validate(selectedStatus, selectedPriority, selections);
    setSelectedLabels(selections);
  };

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  const extractFilterValue = (filter: SearchFilter): string => {
    if (filter.type === SearchFilterType.BLANK) {
      return null;
    }
    return filter.value.split(':')[1];
  };

  const _onApplyBtnClick = () => {
    if (formValid) {
      setApplying(true);
      onApplyBtnClick(
        extractFilterValue(selectedStatus),
        extractFilterValue(selectedPriority),
        selectedLabels.map(l => extractFilterValue(l))
      );
    }
  };

  const onClearBtnClick = () => {
    setFormValid(false);
    setSelectedStatus(null);
    setSelectedPriority(null);
    setSelectedLabels([]);
  };

  const renderOption = (item: SearchFilter) => {
    if (item.type === SearchFilterType.BLANK) {
      return <div>&nbsp;</div>;
    }
    return <div>{item.label}</div>;
  };

  console.log('hello?????');

  return (
    <div>
      <Typography variant="h6">Workflow Actions</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1) }}>
        <Alert severity="info">
          {`The workflow action will be applied to all ${affectedItemCount} alerts in the current view matching to following filters:`}
        </Alert>
      </div>

      <div style={{ margin: theme.spacing(1) }}>
        <div
          style={{
            marginTop: theme.spacing(1),
            padding: theme.spacing(2),
            color: theme.palette.primary.light,
            backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
          }}
        >
          <AlertsFiltersSelected searchQuery={query} disableActions />
        </div>
      </div>

      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            classes={{ option: classes.option }}
            options={[EMPTY_SEARCHFILTER, ...statusFilters]}
            value={selectedStatus}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Statuses" variant="outlined" />}
            onChange={(event, value) => onStatusChange(value as SearchFilter)}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            classes={{ option: classes.option }}
            options={[EMPTY_SEARCHFILTER, ...priorityFilters]}
            value={selectedPriority}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Priorities" variant="outlined" />}
            onChange={(event, value) => onPriorityChange(value as SearchFilter)}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={labelFilters}
            value={selectedLabels}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Labels" variant="outlined" />}
            onChange={(event, value) => onLabelChange(value as SearchFilter[])}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: theme.spacing(1) }}>
        <Button
          variant="contained"
          color="primary"
          onClick={_onApplyBtnClick}
          startIcon={applying ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={applying || !formValid}
        >
          {t('page.alerts.filters.apply')}
        </Button>
        <div style={{ marginRight: theme.spacing(1) }} />
        <Button variant="contained" onClick={onClearBtnClick} disabled={applying} startIcon={<ClearAllIcon />}>
          {t('page.alerts.filters.clear')}
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="contained" onClick={onCancelBtnClick} startIcon={<CloseIcon />}>
          {t('page.alerts.filters.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
