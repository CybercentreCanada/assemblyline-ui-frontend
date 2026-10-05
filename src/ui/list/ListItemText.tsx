import type { ListItemTextProps as MuiListItemTextProps } from '@mui/material';
import { styled, Typography } from '@mui/material';
import type { CSSProperties } from 'react';
import React from 'react';

const Label = styled('label')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  margin: `${theme.spacing(0.75)} 0`,
  '&:hover>*': {
    overflow: 'auto',
    whiteSpace: 'wrap'
  }
}));

export type ListItemTextProps = React.HTMLAttributes<HTMLLabelElement> & {
  capitalize?: boolean;
  cursor?: CSSProperties['cursor'];
  primary: MuiListItemTextProps['primary'];
  primaryTypographyProps?: MuiListItemTextProps['primaryTypographyProps'];
  secondary?: MuiListItemTextProps['secondary'];
  secondaryTypographyProps?: MuiListItemTextProps['secondaryTypographyProps'];
};

export const ListItemText: React.FC<ListItemTextProps> = React.memo(
  ({
    capitalize = false,
    cursor = 'initial',
    id = null,
    primary,
    primaryTypographyProps,
    secondary,
    secondaryTypographyProps,
    ...labelProps
  }: ListItemTextProps) => (
    <Label htmlFor={id || primary.toString()} {...labelProps} style={{ ...labelProps?.style, cursor: cursor }}>
      <Typography
        overflow="hidden"
        textOverflow="ellipsis"
        variant="body1"
        whiteSpace="nowrap"
        {...(capitalize && { textTransform: 'capitalize' })}
        {...primaryTypographyProps}
      >
        {primary}
      </Typography>
      <Typography
        color="textSecondary"
        overflow="hidden"
        textOverflow="ellipsis"
        variant="body2"
        whiteSpace="nowrap"
        {...(capitalize && { textTransform: 'capitalize' })}
        {...secondaryTypographyProps}
      >
        {secondary}
      </Typography>
    </Label>
  )
);
