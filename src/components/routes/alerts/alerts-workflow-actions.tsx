import { Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import { SearchFilter } from 'components/elements/search/search-query';
import React, { useState } from 'react';
import { AlertFilterSelections } from './alerts-filters';
import AlertsFiltersSelected from './alerts-filters-selected';

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

interface AlertsWorkflowActionsProps {
  query: string;
  affectedItemCount: number;
  selectedFilters: AlertFilterSelections;
  statusFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  labelFilters: SearchFilter[];
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  query,
  affectedItemCount,
  selectedFilters,
  statusFilters,
  priorityFilters,
  labelFilters
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [selectedStatuses, setSelectedStatuses] = useState<SearchFilter[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<SearchFilter[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<SearchFilter[]>([]);

  const onStatusChange = (selections: SearchFilter[]) => {
    setSelectedStatuses(selections);
  };

  const onPriorityChange = (selections: SearchFilter[]) => {
    setSelectedPriorities(selections);
  };

  const onLabelChange = (selections: SearchFilter[]) => {
    setSelectedLabels(selections);
  };

  const isSelected = (option, value): boolean => {
    return option.value === value.value;
  };

  const renderOption = (item: SearchFilter) => {
    return (
      <div>
        {/* <CustomChip label={item.object.count} size="tiny" /> {item.label} */}
        {item.label}
      </div>
    );
  };

  return (
    <div>
      <Typography variant="h6">Workflow Actions</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        <Alert severity="info">
          {`The workflow action will be applied to all ${affectedItemCount} alerts in the current view matching to following filters:`}
        </Alert>
      </div>

      <div style={{ margin: theme.spacing(1) }}>
        <div
          style={{
            marginTop: theme.spacing(2),
            padding: theme.spacing(2),
            color: theme.palette.primary.light,
            backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
          }}
        >
          <AlertsFiltersSelected query={query} filters={selectedFilters} onChange={() => null} disableActions />
        </div>
      </div>

      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={statusFilters}
            value={selectedStatuses}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Statuses" variant="outlined" />}
            onChange={(event, value) => onStatusChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple
            classes={{ option: classes.option }}
            options={priorityFilters}
            value={selectedPriorities}
            getOptionLabel={option => option.label}
            getOptionSelected={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} label="Priorities" variant="outlined" />}
            onChange={(event, value) => onPriorityChange(value as SearchFilter[])}
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
        {/* <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          Apply
        </Button>
        <div style={{ marginRight: theme.spacing(1) }} />
        <Button variant="contained" onClick={onClearBtnClick} size="small">
          Clear
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="contained" onClick={onCancelBtnClick} size="small">
          Cancel
        </Button> */}
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
