/* eslint-disable no-param-reassign */
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  makeStyles,
  Select,
  Typography,
  useTheme
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import { PageHeaderAction } from 'commons/components/layout/pages/PageHeader';
import MultiSelect, { MultiSelectItem } from 'components/elements/mui/multiselect';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginRight: theme.spacing(1),
    minWidth: 300
    // width: '100%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

const actions: PageHeaderAction[] = [
  {
    action: () => console.log(''),
    icon: <FilterListIcon />,
    btnProp: {
      title: 'Filter',
      color: 'primary',
      size: 'small',
      variant: 'contained'
    }
  },
  {
    action: () => console.log(''),
    icon: <AddIcon />,
    btnProp: {
      title: 'Workflow Filters',
      color: 'primary',
      size: 'small',
      variant: 'contained'
    }
  }
];

export interface AlertFilterSelections {
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
}

const AlertsFilters: React.FC<AlertsFiltersProps> = ({
  selectedFilters,
  statusFilters,
  priorityFilters,
  labelFilters,
  onApplyBtnClick
}) => {
  const theme = useTheme();
  const classes = useStyles();

  const [selectedStatusFilters, setSelectedStatusFilters] = useState<MultiSelectItem[]>(selectedFilters.statuses);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<MultiSelectItem[]>(selectedFilters.priorities);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<MultiSelectItem[]>(selectedFilters.labels);

  const onStatusFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedStatusFilters(selections);
  };

  const onPriorityFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedPriorityFilters(selections);
  };

  const onLabelFilterChange = (selections: MultiSelectItem[]) => {
    setSelectedLabelFilters(selections);
  };

  const _onApplyBntClick = () => {
    onApplyBtnClick({
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters
    });
  };

  return (
    <Box>
      <Typography variant="h6">Filter</Typography>
      <Divider />
      <Box mt={theme.spacing(0.4)} p={theme.spacing(0.1)}>
        <Box>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="timeconstraits-native-required">Time Constraint</InputLabel>
            <Select
              value={1}
              label="Time Constraint"
              onChange={event => console.log(event.target.value)}
              name="age"
              inputProps={{
                id: 'timeconstraits-native-required'
              }}
            >
              <option value={1}>None (slow)</option>
              <option value={2}>24 4ours</option>
              <option value={3}>4 Days</option>
              <option value={4}>1 Week</option>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="groupby-native-required">Group By</InputLabel>
            <Select
              value={1}
              label="Group By"
              onChange={event => console.log(event.target.value)}
              name="age"
              inputProps={{
                id: 'groupby-native-required'
              }}
            >
              <option value={1}>file.sha256</option>
              <option value={2}>file.md5</option>
              <option value={3}>file.name</option>
              <option value={4}>file.sha1</option>
              <option value={5}>priority</option>
              <option value={6}>status</option>
            </Select>
          </FormControl>
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
        <Button variant="contained" color="primary" onClick={_onApplyBntClick}>
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default AlertsFilters;
