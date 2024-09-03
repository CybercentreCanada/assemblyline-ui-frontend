import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { ChipList } from 'components/visual/ChipList';
import SearchQuery, { DEFAULT_SORT, SearchFilter, SearchQueryFilters } from 'components/visual/SearchBar/search-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  desc: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  asc: {
    transform: 'rotate(180deg)'
  }
}));

interface AlertFiltersSelectedProps {
  searchQuery: SearchQuery;
  hideQuery?: boolean;
  hideGroupBy?: boolean;
  hideSort?: boolean;
  disableActions?: boolean;
  onChange?: (filters: SearchQueryFilters, query?: string) => void;
}

const AlertsFiltersSelected: React.FC<AlertFiltersSelectedProps> = ({
  searchQuery,
  hideQuery = false,
  hideGroupBy = false,
  hideSort = false,
  disableActions = false,
  onChange = () => null
}) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();

  const filters = searchQuery?.parseFilters();
  const query = searchQuery?.getQuery();

  const onDeleteMainQuery = () => {
    onChange(filters, '');
  };

  const onDeleteTC = () => {
    onChange({ ...filters, tc: '' });
  };

  const onDeleteGroupBy = () => {
    onChange({ ...filters, groupBy: '' });
  };

  const onSortClick = () => {
    onChange({
      ...filters,
      sort: filters.sort.endsWith('desc') ? filters.sort.replace('desc', 'asc') : filters.sort.replace('asc', 'desc')
    });
  };

  const onResetSortBy = () => {
    onChange({ ...filters, sort: DEFAULT_SORT });
  };

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
        {query && !hideQuery && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[query].map(v => ({
                variant: 'outlined',
                label: `${v}`,
                onDelete: !disableActions ? () => onDeleteMainQuery() : null
              }))}
            />
          </div>
        )}
        {filters && filters.sort && !hideSort && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[filters.sort].map(v => ({
                classes: {
                  icon: clsx(classes.desc, filters.sort.endsWith('asc') && classes.asc)
                },
                variant: 'outlined',
                label: `${t('sortBy')}=${t(v.substring(0, v.indexOf(' ')))}`,
                icon: <ArrowDownwardIcon />,
                deleteIcon: <ReplayOutlinedIcon />,
                onClick: !disableActions ? () => onSortClick() : null,
                onDelete: !disableActions ? () => onResetSortBy() : null
              }))}
            />
          </div>
        )}
        {filters && filters.tc && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[filters.tc].map(v => ({
                variant: 'outlined',
                label: `${t('tc')}=${v}`,
                onDelete: !disableActions ? () => onDeleteTC() : null
              }))}
            />
          </div>
        )}
        {filters && filters.groupBy && !hideGroupBy && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[filters.groupBy].map(v => ({
                variant: 'outlined',
                label: `${t('groupBy')}=${v}`,
                onDelete: !disableActions ? () => onDeleteGroupBy() : null
              }))}
            />
          </div>
        )}
        {filters && filters.statuses.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.statuses.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteStatus(v) : null
              }))}
            />
          </div>
        )}
        {filters && filters.priorities.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.priorities.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeletePriority(v) : null
              }))}
            />
          </div>
        )}
        {filters && filters.labels.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.labels.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteLabel(v) : null
              }))}
            />
          </div>
        )}
        {filters && filters.queries.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={filters.queries.map(v => ({
                variant: 'outlined',
                label: v.value,
                onDelete: !disableActions ? () => onDeleteQuery(v) : null
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsFiltersSelected;
