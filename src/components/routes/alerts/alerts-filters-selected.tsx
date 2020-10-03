import { useTheme } from '@material-ui/core';
import { ChipList } from 'components/elements/mui/chips';
import { SearchFilter } from 'components/elements/search/search-query';
import React from 'react';
import { AlertFilterSelections } from './alerts-filters';

interface AlertFiltersSelectedProps {
  disableActions?: boolean;
  filters: AlertFilterSelections;
  onChange: (filters: AlertFilterSelections) => void;
}

const AlertsFiltersSelected: React.FC<AlertFiltersSelectedProps> = ({ disableActions = false, filters, onChange }) => {
  const theme = useTheme();

  const { tc, groupBy, statuses, priorities, labels, queries } = filters;

  const onDeleteStatus = (item: SearchFilter) => {
    const _statuses = filters.statuses.filter(s => s.value !== item.value);
    onChange({ ...filters, statuses: _statuses });
  };

  const onDeletePriority = (item: SearchFilter) => {
    const _priorities = filters.priorities.filter(s => s.value !== item.value);
    onChange({ ...filters, priorities: _priorities });
  };

  const onDeleteLabel = (item: SearchFilter) => {
    const _labels = filters.labels.filter(s => s.value !== item.value);
    onChange({ ...filters, labels: _labels });
  };

  const onDeleteQuery = (item: SearchFilter) => {
    const _queries = filters.queries.filter(s => s.value !== item.value);
    onChange({ ...filters, queries: _queries });
  };

  return (
    <div>
      <div>
        Time Constraint = {tc.label}, Group by = {groupBy.label}
      </div>
      <div style={{ marginTop: theme.spacing(1) }}>
        {statuses.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={statuses.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteStatus(v) : null
              }))}
            />
          </div>
        ) : null}
        {priorities.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={priorities.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeletePriority(v) : null
              }))}
            />
          </div>
        ) : null}
        {labels.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={labels.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteLabel(v) : null
              }))}
            />
          </div>
        ) : null}
        {queries.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={queries.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteQuery(v) : null
              }))}
            />
          </div>
        ) : null}
        {/* {values.length ? (
          <div display="inline-block" mt={1}>
            <ChipList
              items={favorites.map(f => ({
                variant: 'outlined',
                label: f.query,
                onDelete: !disableActions ? () => onDeleteFavorite(f) : null
              }))}
            />
          </div>
        ) : null} */}
      </div>
    </div>
  );
};

export default AlertsFiltersSelected;
