import { Chip, ChipProps, makeStyles, Theme, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chiplist: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
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
  const theme = useTheme();
  const classes = useStyles();
  return (
    <ul className={classes.chiplist}>
      {items.map((cp, i) => (
        <li key={`chiplist-${i}`}>
          <Chip size="small" {...cp} style={{ marginBottom: theme.spacing(0.5), marginRight: theme.spacing(0.5) }} />
        </li>
      ))}
    </ul>
  );
};

export { ChipList };
