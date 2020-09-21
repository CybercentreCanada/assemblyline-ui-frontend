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
import MultiSelectList from 'components/elements/mui/multiselect-list';
import React from 'react';

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

type AlertsFiltersProps = {
  statuses: any;
  priorities: any;
  labels: any;
  onApplyBtnClick: () => void;
};

const AlertsFilters: React.FC<AlertsFiltersProps> = ({ statuses, priorities, labels, onApplyBtnClick }) => {
  const theme = useTheme();
  const classes = useStyles();
  // console.log(labels);
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
          <MultiSelectList
            label="Statuses"
            items={Object.keys(statuses).map((l, i) => ({
              id: i,
              label: `${statuses[l]}x ${l}`,
              value: `label:"${l}"`
            }))}
            onChange={selections => console.log(selections)}
          />
        </Box>
        <Box mt={2}>
          <MultiSelectList
            label="Priorities"
            items={Object.keys(priorities).map((l, i) => ({
              id: i,
              label: `${priorities[l]}x ${l}`,
              value: `label:"${l}"`
            }))}
            onChange={selections => console.log(selections)}
          />
        </Box>
        <Box mt={2}>
          <MultiSelectList
            label="Labels"
            items={Object.keys(labels).map((l, i) => ({ id: i, label: `${labels[l]}x ${l}`, value: `label:"${l}"` }))}
            onChange={selections => console.log(selections)}
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
        <Button variant="contained" color="primary" onClick={onApplyBtnClick}>
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default AlertsFilters;
