/* eslint-disable no-param-reassign */
import { Button, Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { SearchFilter } from 'components/elements/search/search-query';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
// import { AlertFilterItem } from './hooks/useAlerts';

export const DEFAULT_TC = { value: '4d', label: '4 Days' };

export const DEFAULT_GROUPBY = { value: 'file.sha256', label: 'file.sha256' };

export const DEFAULT_FILTERS = {
  tc: DEFAULT_TC,
  groupBy: DEFAULT_GROUPBY,
  statuses: [],
  priorities: [],
  labels: [],
  queries: []
};

const decorateQueryFilters = (queryFilters: SearchFilter[], valueFilters) => {
  return queryFilters.map(qf => ({
    filter: qf,
    isValue: valueFilters.some(vf => vf.value === qf.value)
  }));
};

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

export interface AlertFilterSelections {
  tc: { value: string; label: string };
  groupBy: { value: string; label: string };
  statuses: SearchFilter[];
  priorities: SearchFilter[];
  labels: SearchFilter[];
  queries: SearchFilter[];
}

interface AlertsFiltersProps {
  selectedFilters: AlertFilterSelections;
  valueFilters: SearchFilter[];
  statusFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  labelFilters: SearchFilter[];
  onApplyBtnClick: (filters: AlertFilterSelections) => void;
  onClearBtnClick: () => void;
  onCancelBtnClick: () => void;
}

const AlertsFilters: React.FC<AlertsFiltersProps> = ({
  selectedFilters,
  valueFilters,
  statusFilters,
  priorityFilters,
  labelFilters,
  onApplyBtnClick,
  onClearBtnClick,
  onCancelBtnClick
}) => {
  const theme = useTheme();
  const classes = useStyles();

  const [selectedTc, setSelectedTc] = useState<{ value: string; label: string }>(selectedFilters.tc || DEFAULT_TC);
  const [selectedGroupBy, setSelectedGroupBy] = useState<{ value: string; label: string }>(
    selectedFilters.groupBy || DEFAULT_GROUPBY
  );
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<SearchFilter[]>(selectedFilters.statuses);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<SearchFilter[]>(selectedFilters.priorities);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<SearchFilter[]>(selectedFilters.labels);
  const [selectedQueryFilters, setSelectedQueryFilters] = useState<{ filter: SearchFilter; isValue: boolean }[]>(
    decorateQueryFilters(selectedFilters.queries, valueFilters)
  );

  // const [selectedValueFilters, setSelectedValueFilters] = useState<AlertFilterItem[]>(
  //   selectedFilters.queries.filter(svf => valueFilters.some(vf => vf.value === svf.value))
  // );
  // const [nonValueFilters] = useState<AlertFilterItem[]>(
  //   selectedFilters.queries.filter(svf => valueFilters.some(vf => vf.value !== svf.value))
  // );

  const onTcFilterChange = (value: { value: string; label: string }) => {
    setSelectedTc(value);
  };

  const onGroupByFilterChange = (value: { value: string; label: string }) => {
    setSelectedGroupBy(value);
  };

  const onStatusFilterChange = (selections: SearchFilter[]) => {
    setSelectedStatusFilters(selections);
  };

  const onPriorityFilterChange = (selections: SearchFilter[]) => {
    setSelectedPriorityFilters(selections);
  };

  const onLabelFilterChange = (selections: SearchFilter[]) => {
    setSelectedLabelFilters(selections);
  };

  const onValueFilterChange = (selections: SearchFilter[]) => {
    const _selections = selections.map(filter => ({ filter, isValue: true }));
    const nonValueFilters = selectedQueryFilters.filter(sf => !sf.isValue);
    setSelectedQueryFilters([..._selections, ...nonValueFilters]);
  };

  const _onApplyBtnClick = () => {
    console.log(selectedFilters);
    onApplyBtnClick({
      tc: selectedTc,
      groupBy: selectedGroupBy,
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters,
      queries: selectedQueryFilters.map(f => f.filter)
    });
  };

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  const renderOption = (item: SearchFilter) => {
    return (
      <div>
        <CustomChip label={item.object.count} size="tiny" /> {item.label}
      </div>
    );
  };

  // Apply updates to selected filters when compoonent is mounted.
  useEffect(() => {
    setSelectedTc(selectedFilters.tc || DEFAULT_TC);
    setSelectedGroupBy(selectedFilters.groupBy || DEFAULT_GROUPBY);
    setSelectedStatusFilters(selectedFilters.statuses);
    setSelectedPriorityFilters(selectedFilters.priorities);
    setSelectedLabelFilters(selectedFilters.labels);
    setSelectedQueryFilters(decorateQueryFilters(selectedFilters.queries, valueFilters));
  }, [selectedFilters, valueFilters]);

  return (
    <div>
      <Typography variant="h6">Filters</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1) }}>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
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
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
            classes={{ option: classes.option }}
            options={[
              DEFAULT_GROUPBY,
              { value: 'file.md5', label: 'file.md5' },
              { value: 'file.name', label: 'file.name' },
              { value: 'file.sha1', label: 'file.sha1' },
              { value: 'priority', label: 'priority' },
              { value: 'status', label: 'status' }
            ]}
            value={selectedGroupBy || DEFAULT_GROUPBY}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderInput={params => <TextField {...params} label="Group By" variant="outlined" />}
            onChange={(event, value) => onGroupByFilterChange(value as { value: string; label: string })}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={statusFilters}
            value={selectedStatusFilters}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Statuses" variant="outlined" />}
            onChange={(event, value) => onStatusFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={priorityFilters}
            value={selectedPriorityFilters}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Priorities" variant="outlined" />}
            onChange={(event, value) => onPriorityFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={labelFilters}
            value={selectedLabelFilters}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Labels" variant="outlined" />}
            onChange={(event, value) => onLabelFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={valueFilters}
            value={selectedQueryFilters.filter(filter => filter.isValue).map(f => f.filter)}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Values" variant="outlined" />}
            onChange={(event, value) => onValueFilterChange(value as SearchFilter[])}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: theme.spacing(1) }}>
        <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          Apply
        </Button>
        <div style={{ marginRight: theme.spacing(1) }} />
        <Button variant="contained" onClick={onClearBtnClick} size="small">
          Clear
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="contained" onClick={onCancelBtnClick} size="small">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AlertsFilters;
