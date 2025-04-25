import { Skeleton, useTheme } from '@mui/material';
import type { ActionableCustomChipProps } from 'components/visual/ActionableCustomChip';
import ActionableCustomChip from 'components/visual/ActionableCustomChip';
import React from 'react';

type ActionableChipListProps = {
  items: ActionableCustomChipProps[];
  nowrap?: boolean;
};

const ChipSkeleton = () => (
  <Skeleton variant="rectangular" height="24px" width="4rem" style={{ borderRadius: '16px', marginRight: '4px' }} />
);

const ChipSkeletonInline = () => (
  <Skeleton
    variant="rectangular"
    height="24px"
    width="4rem"
    style={{ borderRadius: '16px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}
  />
);

const ActionableChipList: React.FC<ActionableChipListProps> = ({ items, nowrap = false }) => {
  const theme = useTheme();
  return (
    <ul
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: 0,
        boxShadow: 'inherit',
        margin: 0
      }}
    >
      {items
        ? items.map((cp, i) => (
            <li key={`chiplist-${i}`}>
              <ActionableCustomChip
                size="small"
                wrap={!nowrap}
                {...cp}
                sx={{
                  marginBottom: theme.spacing(0.5),
                  marginRight: theme.spacing(1),
                  ...cp?.sx
                }}
              />
            </li>
          ))
        : [...Array(3)].map((k, i) => (
            <Skeleton
              key={`chiplist-${i}`}
              variant="rectangular"
              height={theme.spacing(3)}
              width="4rem"
              style={{
                verticalAlign: 'middle',
                display: 'inline-block',
                borderRadius: theme.spacing(2),
                marginRight: theme.spacing(0.5)
              }}
            />
          ))}
    </ul>
  );
};

export { ActionableChipList, ChipSkeleton, ChipSkeletonInline };
