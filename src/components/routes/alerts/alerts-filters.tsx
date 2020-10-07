/* eslint-disable no-param-reassign */
import {
  Button,
  Divider,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { SearchFilter } from 'components/elements/search/search-query';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Default TimeConstraint(TC) value..
export const DEFAULT_TC = { value: '4d', label: '4 Days' };

// Default GroupBy value.
export const DEFAULT_GROUPBY = { value: 'file.sha256', label: 'file.sha256' };

//
const GROUPBY_OPTIONS = [
  { value: 'file.md5', label: 'file.md5' },
  { value: 'file.name', label: 'file.name' },
  DEFAULT_GROUPBY,
  { value: 'priority', label: 'priority' },
  { value: 'status', label: 'status' }
];

//
const TC_OPTIONS = [
  { value: '', label: 'None (slow)' },
  { value: '24h', label: '24 hours' },
  DEFAULT_TC,
  { value: '7d', label: '1 Week' }
];

// Default filters.
export const DEFAULT_FILTERS = {
  tc: DEFAULT_TC,
  groupBy: DEFAULT_GROUPBY,
  statuses: [],
  priorities: [],
  labels: [],
  queries: []
};

// Decorate each filter in the specified 'queryFilters' list and indicate whether they are a valueFilter.
const decorateQueryFilters = (queryFilters: SearchFilter[], valueFilters) => {
  return queryFilters.map(qf => ({
    filter: qf,
    isValue: valueFilters.some(vf => vf.value === qf.value)
  }));
};

// Some styles.
const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

// Specification interface defining the state of the current filter selections.
export interface AlertFilterSelections {
  tc: { value: string; label: string };
  groupBy: { value: string; label: string };
  statuses: SearchFilter[];
  priorities: SearchFilter[];
  labels: SearchFilter[];
  queries: SearchFilter[];
}

// Specificatino interface of this component's properties.
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

// Implementation of th AlertsFilter component.
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
  // Hooks...
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation('alerts');

  // Define some states for controlled components..
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

  // Handler[onChange]: for the 'TC' Autocomplete component.
  const onTcFilterChange = (value: string) => {
    const selectedValue = TC_OPTIONS.find(o => o.value === value);
    console.log(selectedValue);
    setSelectedTc(selectedValue);
  };

  // Handler[onChange]: for the 'Group By' Autocomplete component.
  const onGroupByFilterChange = (value: string) => {
    const selectedValue = GROUPBY_OPTIONS.find(o => o.value === value);
    setSelectedGroupBy(selectedValue);
  };

  // Handler[onChange]: for the 'Status' Autocomplete component.
  const onStatusFilterChange = (selections: SearchFilter[]) => {
    setSelectedStatusFilters(selections);
  };

  // Handler[onChange]: for the 'Priority' Autocomplete component.
  const onPriorityFilterChange = (selections: SearchFilter[]) => {
    setSelectedPriorityFilters(selections);
  };

  // Handler[onChange]: for the 'Label' Autocomplete component.
  const onLabelFilterChange = (selections: SearchFilter[]) => {
    setSelectedLabelFilters(selections);
  };

  // Handler[onChange]: for the 'Value' Autocomplete component.
  const onValueFilterChange = (selections: SearchFilter[]) => {
    const _selections = selections.map(filter => ({ filter, isValue: true }));
    const nonValueFilters = selectedQueryFilters.filter(sf => !sf.isValue);
    setSelectedQueryFilters([..._selections, ...nonValueFilters]);
  };

  // Handler: when clicking on 'Apply' button.
  const _onApplyBtnClick = () => {
    onApplyBtnClick({
      tc: selectedTc,
      groupBy: selectedGroupBy,
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters,
      queries: selectedQueryFilters.map(f => f.filter)
    });
  };

  // Indicates if an Autocomplete option is selected.
  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  // Render method of a single Autocomplete component option.
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

  console.log(selectedTc);

  return (
    <div>
      <Typography variant="h6">{t('page.alerts.filters')}</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        {/* <div style={{ marginBottom: theme.spacing(2) }}>
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
        </div> */}
        <div style={{ marginBottom: theme.spacing(2) }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Time Constraint</InputLabel>
            <Select
              label="Time Constraint"
              displayEmpty
              value={selectedTc ? selectedTc.value : DEFAULT_TC.value}
              onChange={event => onTcFilterChange(event.target.value as string)}
            >
              {TC_OPTIONS.map(o => (
                <MenuItem className={classes.option} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Group By</InputLabel>
            <Select
              label="Group By"
              value={selectedGroupBy ? selectedGroupBy.value : DEFAULT_GROUPBY.value}
              onChange={event => onGroupByFilterChange(event.target.value as string)}
            >
              {GROUPBY_OPTIONS.map(o => (
                <MenuItem className={classes.option} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
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
        <div style={{ marginBottom: theme.spacing(2) }}>
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
        <div style={{ marginBottom: theme.spacing(2) }}>
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
        <div style={{ marginBottom: theme.spacing(2) }}>
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
          {t('page.alerts.filters.apply')}
        </Button>
        <div style={{ marginRight: theme.spacing(1) }} />
        <Button variant="contained" onClick={onClearBtnClick} size="small">
          {t('page.alerts.filters.clear')}
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="contained" onClick={onCancelBtnClick} size="small">
          {t('page.alerts.filters.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default AlertsFilters;
