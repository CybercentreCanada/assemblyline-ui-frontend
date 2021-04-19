import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React from 'react';
import FilterInput from './filter-input';
import { FilterField } from './filter-selector';

const useStyles = makeStyles(theme => ({
  filter: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2)
    }
  }
}));

interface FilterListProps {
  currentFilters: FilterField[];
  filterFields: FilterField[];
  list: any[];
  onFiltered: (list: any[]) => void;
}

const FilterList: React.FC<FilterListProps> = ({ currentFilters, filterFields, list, onFiltered }) => {
  const theme = useTheme();
  const classes = useStyles();
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div style={{ display: !isSM ? 'flex' : 'block' }}>
      {currentFilters.map(f => (
        <div key={f.id} className={classes.filter}>
          <FilterInput
            fullWidth={isSM}
            filter={f}
            currentFilters={currentFilters}
            filters={filterFields}
            list={list}
            onFiltered={onFiltered}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterList;
