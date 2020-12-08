import { makeStyles } from '@material-ui/core';
import React from 'react';
import FlexHorizontal from '../../layout/flexers/FlexHorizontal';
import FilterInput from './filter-input';
import { FilterField } from './filter-selector';

const useStyles = makeStyles(theme => ({
  filter: {
    marginRight: theme.spacing(2)
    // padding: theme.spacing(1),
    // border: '1px solid',
    // borderColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 22%)' : 'hsl(0, 0%, 80%)'
  }
}));

interface FilterListProps {
  currentFilters: FilterField[];
  filterFields: FilterField[];
  list: any[];
  onFiltered: (list: any[]) => void;
}

//
const FilterList: React.FC<FilterListProps> = ({ currentFilters, filterFields, list, onFiltered }) => {
  const classes = useStyles();
  return (
    <FlexHorizontal>
      {currentFilters.map(f => (
        <div key={f.id} className={classes.filter}>
          <FilterInput
            filter={f}
            currentFilters={currentFilters}
            filters={filterFields}
            list={list}
            onFiltered={onFiltered}
          />
        </div>
      ))}
    </FlexHorizontal>
  );
};

export default FilterList;
