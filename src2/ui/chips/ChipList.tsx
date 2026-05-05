import { Skeleton, useTheme } from '@mui/material';
import { memo } from 'react';
import type { CustomChipProps } from './CustomChip';
import { CustomChip } from './CustomChip';

//*****************************************************************************************
// ChipSkeleton
//*****************************************************************************************

export const ChipSkeleton = memo(() => (
  <Skeleton variant="rectangular" height="24px" width="4rem" style={{ borderRadius: '16px', marginRight: '4px' }} />
));

ChipSkeleton.displayName = 'ChipSkeleton';

//*****************************************************************************************
// ChipSkeletonInline
//*****************************************************************************************

export const ChipSkeletonInline = memo(() => (
  <Skeleton
    variant="rectangular"
    height="24px"
    width="4rem"
    style={{ borderRadius: '16px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}
  />
));

ChipSkeletonInline.displayName = 'ChipSkeletonInline';

//*****************************************************************************************
// ChipList
//*****************************************************************************************

/** Props for ChipList. */
export type ChipListProps = {
  /** Chip configurations to render. */
  items: CustomChipProps[];
  /** Whether to prevent wrapping. */
  nowrap?: boolean;
};

export const ChipList = memo(({ items, nowrap = false }: ChipListProps) => {
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
        : Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={`chiplist-skeleton-${i}`}
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
});

ChipList.displayName = 'ChipList';
