import { styled, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import FilterInput from './FilterInput';
import { FilterField } from './FilterSelector';

const Filter = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2)
  }
}));

interface FilterListProps {
  filters: FilterField[];
  onFilter: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
}

const FilterList: React.FC<FilterListProps> = ({ filters, onFilter }) => {
  const theme = useTheme();
  const isSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div style={{ display: !isSM ? 'flex' : 'block' }}>
      {filters.map(f => (
        <Filter key={f.id}>
          <FilterInput fullWidth={isSM} filter={f} onFilter={onFilter} />
        </Filter>
      ))}
    </div>
  );
};

export default FilterList;
