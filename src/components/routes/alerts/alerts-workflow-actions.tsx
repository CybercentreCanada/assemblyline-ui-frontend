import { Box, Divider, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import CustomChip from 'components/visual/CustomChip';
import React, { useState } from 'react';
import { AlertFilterSelections } from './alerts-filters';
import AlertsFiltersSelected from './alerts-filters-selected';
import { AlertFilterItem } from './hooks/useAlerts';

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

interface AlertsWorkflowActionsProps {
  affectedItemCount: number;
  selectedFilters: AlertFilterSelections;
  statusFilters: AlertFilterItem[];
  priorityFilters: AlertFilterItem[];
  labelFilters: AlertFilterItem[];
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  affectedItemCount,
  selectedFilters,
  statusFilters,
  priorityFilters,
  labelFilters
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [selectedStatuses, setSelectedStatuses] = useState<AlertFilterItem[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<AlertFilterItem[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<AlertFilterItem[]>([]);

  const onStatusChange = (selections: AlertFilterItem[]) => {
    setSelectedStatuses(selections);
  };

  const onPriorityChange = (selections: AlertFilterItem[]) => {
    setSelectedPriorities(selections);
  };

  const onLabelChange = (selections: AlertFilterItem[]) => {
    setSelectedLabels(selections);
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

  return (
    <div>
      <Typography variant="h6">Workflow Actions</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1) }}>
        <Alert severity="info">
          {`The workflow action will be applied to all ${affectedItemCount} alerts in the current view matching to following filters:`}
          <Divider style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }} />
          <AlertsFiltersSelected filters={selectedFilters} onChange={() => null} disableActions />
        </Alert>
      </div>

      <div style={{ margin: theme.spacing(1) }}>
        <div style={{ marginBottom: theme.spacing(1) }}>
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
            onChange={(event, value) => onStatusChange(value as AlertFilterItem[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
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
            onChange={(event, value) => onPriorityChange(value as AlertFilterItem[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(1) }}>
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
            onChange={(event, value) => onLabelChange(value as AlertFilterItem[])}
          />
        </div>
      </div>
      <div style={{ margin: theme.spacing(1), display: 'flex', flexDirection: 'row' }}>
        {/* <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          Apply
        </Button>
        <div mr={1} />
        <Button variant="contained" onClick={onClearBtnClick} size="small">
          Clear
        </Button>
        <div flex={1} />
        <Button variant="contained" onClick={onCancelBtnClick} size="small">
          Cancel
        </Button> */}
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
