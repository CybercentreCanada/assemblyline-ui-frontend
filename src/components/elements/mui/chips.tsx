import { makeStyles, Theme, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import CustomChip, { CustomChipProps } from 'components/visual/CustomChip';
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
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  }
}));

type ChipListProps = {
  items: CustomChipProps[];
};

const ChipSkeleton = () => {
  return <Skeleton variant="rect" height="24px" width="4rem" style={{ borderRadius: '16px', marginRight: '4px' }} />;
};

const ChipSkeletonInline = () => {
  return (
    <Skeleton
      variant="rect"
      height="24px"
      width="4rem"
      style={{ borderRadius: '16px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
};

const ChipList: React.FC<ChipListProps> = ({ items }) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <ul className={classes.chiplist}>
      {items
        ? items.map((cp, i) => {
            return (
              <li key={`chiplist-${i}`}>
                <CustomChip size="small" className={classes.chip} wrap {...cp} />
              </li>
            );
          })
        : [...Array(3)].map((k, i) => {
            return (
              <Skeleton
                key={`chiplist-${i}`}
                variant="rect"
                height={theme.spacing(3)}
                width="4rem"
                style={{
                  verticalAlign: 'middle',
                  display: 'inline-block',
                  borderRadius: theme.spacing(2),
                  marginRight: theme.spacing(0.5)
                }}
              />
            );
          })}
    </ul>
  );
};

export { ChipList, ChipSkeleton, ChipSkeletonInline };
