/* eslint-disable no-param-reassign */
import { Box, Button, Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { AlertFilterItem } from './hooks/useAlerts';
import { Favorite } from './hooks/useFavorites';

export const DEFAULT_TC = { value: '4d', label: '4 Days' };

export const DEFAULT_GROUPBY = { value: 'file.sha256', label: 'file.sha256' };

export const DEFAULT_FILTERS = {
  tc: DEFAULT_TC,
  groupBy: DEFAULT_GROUPBY,
  values: [],
  statuses: [],
  priorities: [],
  labels: [],
  favorites: []
};

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
  favorites: Favorite[];
}

interface AlertsFiltersProps {
  selectedFilters: AlertFilterSelections;
  valueFilters: AlertFilterItem[];
  statusFilters: AlertFilterItem[];
  priorityFilters: AlertFilterItem[];
  labelFilters: AlertFilterItem[];
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
      labels: selectedLabelFilters,
      favorites: selectedFilters.favorites
    });
  };

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  const renderOption = (item: AlertFilterItem) => {
    return (
      <Box>
        <CustomChip label={item.object.count} size="tiny" /> {item.label}
      </Box>
    );
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
    <Box>
      <Typography variant="h6">Filters</Typography>
      <Divider />
      <Box mt={theme.spacing(0.4)} p={theme.spacing(0.1)}>
        <Box>
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
        </Box>
        <Box mt={2}>
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
        </Box>
        <Box mt={2}>
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
            onChange={(event, value) => onStatusFilterChange(value as AlertFilterItem[])}
          />
        </Box>
        <Box mt={2}>
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
            onChange={(event, value) => onPriorityFilterChange(value as AlertFilterItem[])}
          />
        </Box>
        <Box mt={2}>
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
            onChange={(event, value) => onLabelFilterChange(value as AlertFilterItem[])}
          />
        </Box>
        <Box mt={2}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={valueFilters}
            value={selectedValueFilters}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Values" variant="outlined" />}
            onChange={(event, value) => onValueFilterChange(value as AlertFilterItem[])}
          />
        </Box>
        {/* <Box mt={2}>
          <Typography>Personal Filters</Typography>
          <Divider />
        </Box>
        <Box mt={2}>
          <Typography>Global Filters</Typography>
          <Divider />
        </Box> */}
      </Box>
      <Box mt={1} display="flex" flexDirection="row">
        <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          Apply
        </Button>
        <Box mr={1} />
        <Button variant="contained" onClick={onClearBtnClick} size="small">
          Clear
        </Button>
        <Box flex={1} />
        <Button variant="contained" onClick={onCancelBtnClick} size="small">
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AlertsFilters;
