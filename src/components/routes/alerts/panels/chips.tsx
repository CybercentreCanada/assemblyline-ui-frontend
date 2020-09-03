import { ChipProps, makeStyles, Theme } from '@material-ui/core';
import MuiChip from '@material-ui/core/Chip';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chiplist: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    marginLeft: -theme.spacing(0.5),
    padding: 0,
    boxShadow: 'inherit',
    margin: 0
  },
  chip: {
    margin: theme.spacing(0.5)
  }
}));

type ChipListProps = {
  items: ChipProps[];
};

const ChipList: React.FC<ChipListProps> = ({ items }) => {
  const classes = useStyles();
  return (
    <ul className={classes.chiplist}>
      {items.map((cp, i) => (
        <li key={`chiplist-${i}`}>
          <Chip {...cp} />
        </li>
      ))}
    </ul>
  );
};

const Chip: React.FC<ChipProps> = props => {
  const classes = useStyles();
  return <MuiChip {...props} className={classes.chip} />;
};

export { ChipList, Chip };
