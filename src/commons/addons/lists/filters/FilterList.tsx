import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';
import FilterInput from './FilterInput';
import { FilterField } from './FilterSelector';

const useStyles = makeStyles(theme => ({
  filter: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2)
    }
  }
}));

interface FilterListProps {
  filters: FilterField[];
  onFilter: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
}

const FilterList: React.FC<FilterListProps> = ({ filters, onFilter }) => {
  const theme = useTheme();
  const classes = useStyles();
  const isSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div style={{ display: !isSM ? 'flex' : 'block' }}>
      {filters.map(f => (
        <div key={f.id} className={classes.filter}>
          <FilterInput fullWidth={isSM} filter={f} onFilter={onFilter} />
        </div>
      ))}
    </div>
  );
};

export default FilterList;
