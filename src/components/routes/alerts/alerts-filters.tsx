/* eslint-disable no-param-reassign */
import { Box, Button, Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import MultiSelect, { MultiSelectItem } from 'components/elements/mui/multiselect';
import React, { useEffect, useState } from 'react';

const DEFAULT_TC = { value: '4d', label: '4 Days' };

const DEFAULT_GROUPBY = { value: 'file.sha256', label: 'file.sha256' };

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

export interface AlertFilterSelections {
  tc: { value: string; label: string };
  groupBy: { value: string; label: string };
  statuses: MultiSelectItem[];
  priorities: MultiSelectItem[];
  labels: MultiSelectItem[];
}

interface AlertsFiltersProps {
  selectedFilters: AlertFilterSelections;
  statusFilters: MultiSelectItem[];
  priorityFilters: MultiSelectItem[];
  labelFilters: MultiSelectItem[];
  onApplyBtnClick: (filters: AlertFilterSelections) => void;
  onClearBtnClick: () => void;
}

const AlertsFilters: React.FC<AlertsFiltersProps> = ({
  selectedFilters,
  statusFilters,
  priorityFilters,
  labelFilters,
  onApplyBtnClick,
  onClearBtnClick
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const [selectedTc, setSelectedTc] = useState<{ value: string; label: string }>(selectedFilters.tc);
  const [selectedGroupBy, setSelectedGroupBy] = useState<{ value: string; label: string }>(selectedFilters.groupBy);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<MultiSelectItem[]>(selectedFilters.statuses);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<MultiSelectItem[]>(selectedFilters.priorities);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<MultiSelectItem[]>(selectedFilters.labels);

  const onTcFilterChange = (value: { value: string; label: string }) => {
    setSelectedTc(value);
  };

  const onGroupByFilterChange = (value: { value: string; label: string }) => {
    setSelectedGroupBy(value);
  };

  const onStatusFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedStatusFilters(selections);
  };

  const onPriorityFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedPriorityFilters(selections);
  };

  const onLabelFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedLabelFilters(selections);
  };

  const _onApplyBtnClick = () => {
    onApplyBtnClick({
      tc: selectedTc,
      groupBy: selectedGroupBy,
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters
    });
  };

  useEffect(() => {
    setSelectedTc(selectedFilters.tc);
    setSelectedGroupBy(selectedFilters.groupBy);
    setSelectedStatusFilters(selectedFilters.statuses);
    setSelectedPriorityFilters(selectedFilters.priorities);
    setSelectedLabelFilters(selectedFilters.labels);
  }, [selectedFilters]);

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

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
              { value: '1w', label: '1 Week' }
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
          <MultiSelect
            label="Statuses"
            selections={selectedStatusFilters}
            items={statusFilters}
            onChange={onStatusFilterChange}
          />
        </Box>
        <Box mt={2}>
          <MultiSelect
            label="Priorities"
            selections={selectedPriorityFilters}
            items={priorityFilters}
            onChange={onPriorityFilterChange}
          />
        </Box>
        <Box mt={2}>
          <MultiSelect
            label="Labels"
            selections={selectedLabelFilters}
            items={labelFilters}
            onChange={onLabelFilterChange}
          />
        </Box>
        <Box mt={2}>
          <Typography>Personal Filters</Typography>
          <Divider />
        </Box>
        <Box mt={2}>
          <Typography>Global Filters</Typography>
          <Divider />
        </Box>
      </Box>
      <Box mt={1}>
        <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          Apply
        </Button>
        <Box mr={1} display="inline-block" />
        <Button variant="contained" onClick={onClearBtnClick}>
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default AlertsFilters;
