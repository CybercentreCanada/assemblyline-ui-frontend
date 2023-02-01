/* eslint-disable no-param-reassign */
import { Autocomplete, Button, FormControl, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CustomChip from 'components/visual/CustomChip';
import SearchQuery, {
  SearchFilter,
  SearchFilterType,
  SearchQueryFilters
} from 'components/visual/SearchBar/search-query';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Favorite } from './hooks/useFavorites';

// Default TimeConstraint(TC) value..
const DEFAULT_TC = '4d';

// Default GroupBy value.
const DEFAULT_GROUPBY = 'file.sha256';

//
const findOption = (value: string, options: { value: string; label: string }[]) => options.find(o => o.value === value);

// Decorate each filter in the specified 'queryFilters' list and indicate whether they are a valueFilter.
const decorateQueryFilters = (queryFilters: SearchFilter[], userFavoritesFilters) =>
  queryFilters.map(qf => ({
    filter: qf,
    isFavorite: userFavoritesFilters ? userFavoritesFilters.some(vf => vf.value === qf.value) : false
  }));

function ensureSearchFilter(selection): SearchFilter {
  if (typeof selection === 'string') {
    return { id: `id_${selection}`, type: SearchFilterType.QUERY, label: selection, value: selection };
  }
  return selection;
}

// Some styles.
const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

// Specification interface of this component's properties.
interface AlertsFiltersProps {
  searchQuery: SearchQuery;
  valueFilters: SearchFilter[];
  statusFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  labelFilters: SearchFilter[];
  userFavorites: Favorite[];
  globalFavorites: Favorite[];
  onApplyBtnClick: (filters: SearchQueryFilters, query?: string) => void;
}

interface QueryFilter {
  filter: SearchFilter;
  isFavorite: boolean;
}

// Implementation of th AlertsFilter component.
const AlertsFilters: React.FC<AlertsFiltersProps> = ({
  searchQuery,
  valueFilters,
  statusFilters,
  priorityFilters,
  labelFilters,
  userFavorites,
  globalFavorites,
  onApplyBtnClick
}) => {
  // Hooks...
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation('alerts');

  const GROUPBY_OPTIONS = [
    { value: '', label: t('groupBy.none') },
    { value: 'file.md5', label: t('groupBy.md5') },
    { value: 'file.name', label: t('groupBy.name') },
    { value: 'file.sha256', label: t('groupBy.sha256') },
    { value: 'priority', label: t('groupBy.priority') },
    { value: 'status', label: t('groupBy.status') }
  ];

  const TC_OPTIONS = [
    { value: '', label: t('tc.none') },
    { value: '24h', label: t('tc.24h') },
    { value: '4d', label: t('tc.4d') },
    { value: '1w', label: t('tc.1week') },
    { value: '1M', label: t('tc.1month') }
  ];

  const filters = searchQuery.parseFilters();
  const tcOption = findOption(filters.tc, TC_OPTIONS);
  const groupByOption = findOption(filters.groupBy, GROUPBY_OPTIONS);

  // Define some states for controlled components..
  const [selectedTc, setSelectedTc] = useState<{ value: string; label: string }>(
    tcOption || findOption(filters.tc, TC_OPTIONS)
  );
  const [selectedGroupBy, setSelectedGroupBy] = useState<{ value: string; label: string }>(
    groupByOption || findOption(DEFAULT_GROUPBY, GROUPBY_OPTIONS)
  );
  const [userFavoritesFilters] = useState<SearchFilter[]>([
    ...userFavorites.map((fav, idx) => ({
      id: `u_${idx}`,
      type: SearchFilterType.QUERY,
      label: fav.name,
      value: fav.query
    })),
    ...globalFavorites.map((fav, idx) => ({
      id: `g_${idx}`,
      type: SearchFilterType.QUERY,
      label: `${fav.name} (${fav.created_by})`,
      value: fav.query
    }))
  ]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<SearchFilter[]>(filters.statuses);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<SearchFilter[]>(filters.priorities);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<SearchFilter[]>(filters.labels);
  const [selectedQueryFilters, setSelectedQueryFilters] = useState<QueryFilter[]>(
    decorateQueryFilters(filters.queries, userFavoritesFilters)
  );

  // Handler[onChange]: for the 'TC' Autocomplete component.
  const onTcFilterChange = (value: string) => {
    const selectedValue = TC_OPTIONS.find(o => o.value === value);
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
    const _selections = selections.map(filter => ({ filter: ensureSearchFilter(filter), isFavorite: false }));
    const favoriteFilters = selectedQueryFilters.filter(sf => sf.isFavorite);
    setSelectedQueryFilters([..._selections, ...favoriteFilters]);
  };

  // Handler[onChange]: for the 'Favorite' Autocomplete component.
  const onFavoriteChange = (selections: SearchFilter[]) => {
    const _selections = selections.map(filter => ({ filter, isFavorite: true }));
    const _valueFilters = selectedQueryFilters.filter(sf => !sf.isFavorite);
    setSelectedQueryFilters([..._selections, ..._valueFilters]);
  };

  //
  const onClearBtnClick = () => {
    setSelectedTc(tcOption);
    setSelectedGroupBy(groupByOption);
    setSelectedStatusFilters([]);
    setSelectedPriorityFilters([]);
    setSelectedLabelFilters([]);
    setSelectedQueryFilters([]);
  };

  // Handler: when clicking on 'Apply' button.
  const _onApplyBtnClick = () => {
    onApplyBtnClick({
      ...filters,
      tc: selectedTc.value,
      groupBy: selectedGroupBy.value,
      statuses: selectedStatusFilters,
      priorities: selectedPriorityFilters,
      labels: selectedLabelFilters,
      queries: selectedQueryFilters.map(f => f.filter)
    });
  };

  // Indicates if an Autocomplete option is selected.
  const isSelected = (option, value): boolean => {
    if (option === null || value === null) {
      return false;
    }
    return option.value === value.value;
  };

  // Render method of a single Autocomplete component option.
  const renderOption = (props, item: SearchFilter, state) => (
    <div>
      {item.other && <CustomChip label={item.other.count} size="tiny" />} {item.label}
    </div>
  );

  // Apply updates to selected filters if required.
  useEffect(() => {
    const _filters = searchQuery.parseFilters();
    setSelectedTc(findOption(_filters.tc, TC_OPTIONS) || findOption(DEFAULT_TC, TC_OPTIONS));
    setSelectedGroupBy(findOption(_filters.groupBy, GROUPBY_OPTIONS) || findOption(DEFAULT_GROUPBY, GROUPBY_OPTIONS));
    setSelectedStatusFilters(_filters.statuses);
    setSelectedPriorityFilters(_filters.priorities);
    setSelectedLabelFilters(_filters.labels);
    setSelectedQueryFilters(decorateQueryFilters(_filters.queries, userFavoritesFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, userFavoritesFilters, t]);

  return (
    <div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <div style={{ float: 'right' }}>
          <Button variant="contained" onClick={onClearBtnClick}>
            {t('filters.clear')}
          </Button>
        </div>
        <Typography variant="h4">{t('filters')}</Typography>
      </div>
      <div style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(2) }}>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <FormControl fullWidth variant="outlined">
            <label>{t('tc')}</label>
            <Select
              displayEmpty
              value={selectedTc ? selectedTc.value : DEFAULT_TC}
              onChange={event => onTcFilterChange(event.target.value as string)}
            >
              {TC_OPTIONS.map(o => (
                <MenuItem key={o.value} className={classes.option} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <FormControl fullWidth variant="outlined">
            <label>{t('groupBy')}</label>
            <Select
              displayEmpty
              value={selectedGroupBy ? selectedGroupBy.value : DEFAULT_GROUPBY}
              onChange={event => onGroupByFilterChange(event.target.value as string)}
            >
              {GROUPBY_OPTIONS.map(o => (
                <MenuItem key={o.value} className={classes.option} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <label>{t('status')}</label>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            classes={{ option: classes.option }}
            options={statusFilters}
            value={selectedStatusFilters}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} variant="outlined" />}
            onChange={(event, value) => onStatusFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <label>{t('priority')}</label>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            classes={{ option: classes.option }}
            options={priorityFilters}
            value={selectedPriorityFilters}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} variant="outlined" />}
            onChange={(event, value) => onPriorityFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <label>{t('labels')}</label>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            classes={{ option: classes.option }}
            options={labelFilters}
            value={selectedLabelFilters}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} variant="outlined" />}
            onChange={(event, value) => onLabelFilterChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <label>{t('favorites')}</label>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            classes={{ option: classes.option }}
            options={userFavoritesFilters}
            value={selectedQueryFilters.filter(filter => filter.isFavorite).map(f => f.filter)}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} variant="outlined" />}
            onChange={(event, value) => onFavoriteChange(value as SearchFilter[])}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <label>{t('others')}</label>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            classes={{ option: classes.option }}
            options={valueFilters}
            value={selectedQueryFilters.filter(filter => !filter.isFavorite).map(f => f.filter)}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={isSelected}
            renderOption={renderOption}
            renderInput={params => <TextField {...params} variant="outlined" />}
            onChange={(event, value) => onValueFilterChange(value as SearchFilter[])}
          />
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
        <Button variant="contained" color="primary" onClick={_onApplyBtnClick}>
          {t('filters.apply')}
        </Button>
      </div>
    </div>
  );
};

export default AlertsFilters;
