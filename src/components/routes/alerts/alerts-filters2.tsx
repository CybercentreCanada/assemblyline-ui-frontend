/* eslint-disable no-param-reassign */
import { Grid, makeStyles, TextField, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { AlertFilterItem } from './useAlerts';

export const DEFAULT_TC = { value: '4d', label: '4 Days' };

export const DEFAULT_GROUPBY = { value: 'file.sha256', label: 'file.sha256' };

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

export interface AlertFilterSelections {
  tc: { value: string; label: string };
  groupBy: { value: string; label: string };
  values: AlertFilterItem[];
  statuses: AlertFilterItem[];
  priorities: AlertFilterItem[];
  labels: AlertFilterItem[];
}

interface AlertsFiltersProps {
  selectedFilters: AlertFilterSelections;
  valueFilters: AlertFilterItem[];
  statusFilters: AlertFilterItem[];
  priorityFilters: AlertFilterItem[];
  labelFilters: AlertFilterItem[];
  onApplyBtnClick: (filters: AlertFilterSelections) => void;
  onClearBtnClick: () => void;
}

const AlertsFilters2: React.FC<AlertsFiltersProps> = ({
  selectedFilters,
  valueFilters,
  statusFilters,
  priorityFilters,
  labelFilters,
  onApplyBtnClick,
  onClearBtnClick
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const [selectedTc, setSelectedTc] = useState<{ value: string; label: string }>(selectedFilters.tc || DEFAULT_TC);
  const [selectedGroupBy, setSelectedGroupBy] = useState<{ value: string; label: string }>(
    selectedFilters.groupBy || DEFAULT_GROUPBY
  );
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<AlertFilterItem[]>(selectedFilters.statuses);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<AlertFilterItem[]>(selectedFilters.priorities);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<AlertFilterItem[]>(selectedFilters.labels);
  const [selectedValueFilters, setSelectedValueFilters] = useState<AlertFilterItem[]>(selectedFilters.values);

  const onTcFilterChange = (value: { value: string; label: string }) => {
    setSelectedTc(value);
  };

  const onGroupByFilterChange = (value: { value: string; label: string }) => {
    setSelectedGroupBy(value);
  };

  const onStatusFilterChange = (selections: AlertFilterItem[]) => {
    setSelectedStatusFilters(selections);
  };

  const onPriorityFilterChange = (selections: AlertFilterItem[]) => {
    setSelectedPriorityFilters(selections);
  };

  const onLabelFilterChange = (selections: AlertFilterItem[]) => {
    setSelectedLabelFilters(selections);
  };

  const onValueFilterChange = (selections: AlertFilterItem[]) => {
    setSelectedValueFilters(selections);
  };

  const _onApplyBtnClick = () => {
    onApplyBtnClick({
      tc: selectedTc,
      groupBy: selectedGroupBy,
      values: selectedValueFilters,
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters
    });
  };

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  const renderOption = (item: AlertFilterItem) => {
    // return <Chip label={item.} />;
    return item.label;
  };

  // Apply updates to selected filters when compoonent is mounted.
  useEffect(() => {
    setSelectedTc(selectedFilters.tc || DEFAULT_TC);
    setSelectedGroupBy(selectedFilters.groupBy || DEFAULT_GROUPBY);
    setSelectedStatusFilters(selectedFilters.statuses);
    setSelectedPriorityFilters(selectedFilters.priorities);
    setSelectedLabelFilters(selectedFilters.labels);
    setSelectedValueFilters(selectedFilters.values);
  }, [selectedFilters]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}>
        <Autocomplete
          fullWidth
          size="small"
          classes={{ option: classes.option }}
          options={[
            { value: '', label: 'None (slow)' },
            { value: '24h', label: '24 hours' },
            DEFAULT_TC,
            { value: '7d', label: '1 Week' }
          ]}
          value={selectedTc || DEFAULT_TC}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderInput={params => <TextField {...params} label="Time Constraint" variant="outlined" />}
          onChange={(event, value) => onTcFilterChange(value as { value: string; label: string })}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Autocomplete
          fullWidth
          size="small"
          classes={{ option: classes.option }}
          options={[
            { value: '', label: 'None (slow)' },
            { value: '24h', label: '24 hours' },
            DEFAULT_TC,
            { value: '7d', label: '1 Week' }
          ]}
          value={selectedTc || DEFAULT_TC}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderInput={params => <TextField {...params} label="Time Constraint" variant="outlined" />}
          onChange={(event, value) => onTcFilterChange(value as { value: string; label: string })}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Autocomplete
          fullWidth
          multiple
          size="small"
          classes={{ option: classes.option }}
          options={statusFilters}
          value={selectedStatusFilters}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderInput={params => <TextField {...params} variant="standard" label="Statuses" />}
          onChange={(event, value) => onStatusFilterChange(value as AlertFilterItem[])}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Autocomplete
          fullWidth
          multiple
          size="small"
          classes={{ option: classes.option }}
          options={priorityFilters}
          value={selectedPriorityFilters}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderInput={params => <TextField {...params} variant="standard" label="Priorities" />}
          onChange={(event, value) => onPriorityFilterChange(value as AlertFilterItem[])}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Autocomplete
          fullWidth
          multiple
          size="small"
          classes={{ option: classes.option }}
          options={labelFilters}
          value={selectedLabelFilters}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderOption={renderOption}
          renderInput={params => <TextField {...params} variant="standard" label="Labels" />}
          onChange={(event, value) => onLabelFilterChange(value as AlertFilterItem[])}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Autocomplete
          fullWidth
          multiple
          size="small"
          classes={{ option: classes.option }}
          options={valueFilters}
          value={selectedValueFilters}
          getOptionLabel={option => option.label}
          getOptionSelected={isSelected}
          renderInput={params => <TextField {...params} variant="standard" label="Values" />}
          onChange={(event, value) => onValueFilterChange(value as AlertFilterItem[])}
        />
      </Grid>
    </Grid>
  );
};

export default AlertsFilters2;
