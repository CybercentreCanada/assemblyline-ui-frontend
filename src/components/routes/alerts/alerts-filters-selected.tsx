import { Box } from '@material-ui/core';
import { ChipList } from 'components/elements/mui/chips';
import React from 'react';
import { AlertFilterSelections } from './alerts-filters';
import { AlertFilterItem } from './useAlerts';

interface AlertFiltersSelectedProps {
  filters: AlertFilterSelections;
  onChange: (filters: AlertFilterSelections) => void;
}

const AlertsFiltersSelected: React.FC<AlertFiltersSelectedProps> = ({ filters, onChange }) => {
  const { tc, groupBy, statuses, priorities, labels, values } = filters;

  const onDeleteStatus = (item: AlertFilterItem) => {
    const _statuses = filters.statuses.filter(s => s.value !== item.value);
    onChange({ ...filters, statuses: _statuses });
  };
  const onDeletePriority = (item: AlertFilterItem) => {
    const _priorities = filters.priorities.filter(s => s.value !== item.value);
    onChange({ ...filters, priorities: _priorities });
  };
  const onDeleteLabel = (item: AlertFilterItem) => {
    const _labels = filters.labels.filter(s => s.value !== item.value);
    onChange({ ...filters, labels: _labels });
  };
  const onDeleteValue = (item: AlertFilterItem) => {
    const _values = filters.values.filter(s => s.value !== item.value);
    onChange({ ...filters, values: _values });
  };

  return (
    <Box>
      <Box>
        Time Constraint = {tc.label}, Group by = {groupBy.label}
      </Box>
      <Box>
        {statuses.length ? (
          <Box display="inline-block" mt={1}>
            <ChipList
              items={statuses.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: () => onDeleteStatus(v)
              }))}
            />
          </Box>
        ) : null}
        {priorities.length ? (
          <Box display="inline-block" mt={1}>
            <ChipList
              items={priorities.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: () => onDeletePriority(v)
              }))}
            />
          </Box>
        ) : null}
        {labels.length ? (
          <Box display="inline-block" mt={1}>
            <ChipList
              items={labels.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: () => onDeleteLabel(v)
              }))}
            />
          </Box>
        ) : null}
        {values.length ? (
          <Box display="inline-block" mt={1}>
            <ChipList
              items={values.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: () => onDeleteValue(v)
              }))}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default AlertsFiltersSelected;
