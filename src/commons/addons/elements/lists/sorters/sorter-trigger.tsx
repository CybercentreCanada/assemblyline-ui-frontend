import { makeStyles } from '@material-ui/core';
import React from 'react';
import useSorters from '../hooks/useSorters';
import { SorterField } from './sorter-selector';

const useStyles = makeStyles({
  sorterTrigger: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  }
});

interface SorterTriggerProps {
  label?: string;
  sorter: SorterField;
  currentSorters: SorterField[];
  list: any[];
  className?: string
  onSorted: (list: any[]) => void;
  onSortersChange: (sorters: SorterField[]) => void;
}

const SorterTrigger: React.FC<SorterTriggerProps> = ({
  label,
  sorter,
  currentSorters,
  list,
  className,
  onSorted,
  onSortersChange
}) => {
  const classes = useStyles();
  const { icon, onSort } = useSorters();

  // ordinal position of sorter.
  const position = currentSorters.findIndex(cs => cs.path === sorter.path);

  // is it last?
  const isLast = currentSorters[currentSorters.length - 1]?.path === sorter.path;

  // onclick sort handler.
  const onClick = () => {
    if (!currentSorters.some(s => s.path === sorter.path)) {
      currentSorters.push(sorter);
      onSortersChange(currentSorters);
    }

    const sortedList = onSort(list, sorter, currentSorters);

    if (sorter.state === 'unset' && isLast) {
      onSortersChange(currentSorters.filter(s => s.path !== sorter.path));
    }

    onSorted(sortedList);
  };

  return (
    <div className={`${classes.sorterTrigger} ${className}`} onClick={onClick}>
      {position > -1 && <>{icon(sorter)}&nbsp;</>}
      {label ? label : sorter.label}&nbsp;
      {position > -1 && currentSorters.length > 1 && <em>({position + 1})</em>}
    </div>
  );
};

export default SorterTrigger;
