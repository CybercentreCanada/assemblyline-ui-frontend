import { useTheme } from '@material-ui/core';
import { ChipList } from 'components/elements/mui/chips';
import SearchQuery, { SearchFilter } from 'components/elements/search/search-query';
import React from 'react';
import { AlertFilterSelections } from './alerts-filters';

interface AlertFiltersSelectedProps {
  query: SearchQuery;
  disableActions?: boolean;
  onChange: (filters: AlertFilterSelections) => void;
}

const AlertsFiltersSelected: React.FC<AlertFiltersSelectedProps> = ({ query, disableActions = false, onChange }) => {
  const theme = useTheme();

  const filters = query.parseFilters();

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
        {query && <span>Query = {query}, </span>}
        {filters && (
          <span>
            Time Constraint = {filters.tc.label}, Group by = {filters.groupBy.label}
          </span>
        )}
      </div>
      <div style={{ marginTop: theme.spacing(1) }}>
        {filters && filters.statuses.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.statuses.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteStatus(v) : null
              }))}
            />
          </div>
        ) : null}
        {filters && filters.priorities.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.priorities.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeletePriority(v) : null
              }))}
            />
          </div>
        ) : null}
        {filters && filters.labels.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.labels.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteLabel(v) : null
              }))}
            />
          </div>
        ) : null}
        {filters && filters.queries.length ? (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.queries.map(v => ({
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
