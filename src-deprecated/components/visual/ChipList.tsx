import { Skeleton, useTheme } from '@mui/material';
import type { CustomChipProps } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

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

type ChipListProps = {
  items: CustomChipProps[];
  nowrap?: boolean;
};

const ChipList: React.FC<ChipListProps> = ({ items, nowrap = false }) => {
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
              <CustomChip
                size="small"
                wrap={!nowrap}
                {...cp}
                style={{
                  marginBottom: theme.spacing(0.5),
                  marginRight: theme.spacing(1),
                  ...cp?.style
                }}
              />
            </li>
          ))
        : Array.from({ length: 3 }).map((k, i) => (
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

export { ChipList, ChipSkeleton, ChipSkeletonInline };
