import { useTheme } from '@material-ui/core';
import { ChipList } from 'components/visual/ChipList';
import SearchQuery, { SearchFilter, SearchQueryFilters } from 'components/visual/SearchBar/search-query';
import React from 'react';

interface AlertFiltersSelectedProps {
  searchQuery: SearchQuery;
  hideQuery?: boolean;
  disableActions?: boolean;
  onChange?: (filters: SearchQueryFilters) => void;
}

const AlertsFiltersSelected: React.FC<AlertFiltersSelectedProps> = ({
  searchQuery,
  hideQuery = false,
  disableActions = false,
  onChange = () => null
}) => {
  const theme = useTheme();

  const filters = searchQuery.parseFilters();
  const query = searchQuery.getQuery();

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
        {query && !hideQuery && <span>Query = {query}, </span>}
        {filters && (
          <span>
            Time Constraint = {filters.tc}, Group by = {filters.groupBy}
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
