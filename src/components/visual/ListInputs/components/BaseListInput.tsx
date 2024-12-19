import type { ListItemButtonProps, ListItemTextProps } from '@mui/material';
import { ListItemButton, ListItemText, useTheme } from '@mui/material';
import { type FC } from 'react';

interface BaseListItemButtonProps extends ListItemButtonProps {}

export const BaseListItemButton: FC<BaseListItemButtonProps> = ({ sx, ...other }) => {
  const theme = useTheme();
  return <ListItemButton role={undefined} sx={{ gap: theme.spacing(0.5), ...sx }} {...other} />;
};

interface BaseListItemTextProps extends ListItemTextProps {
  capitalize?: boolean;
}

export const BaseListItemText: FC<BaseListItemTextProps> = ({
  id,
  capitalize = false,
  sx,
  primary,
  primaryTypographyProps,
  secondaryTypographyProps,
  ...other
}) => {
  const theme = useTheme();
  return (
    <ListItemText
      primary={!id ? primary : <label htmlFor={id}>{primary}</label>}
      primaryTypographyProps={{
        whiteSpace: 'nowrap',
        ...(capitalize && { textTransform: 'capitalize' }),
        ...primaryTypographyProps
      }}
      secondaryTypographyProps={secondaryTypographyProps}
      sx={{ marginRight: theme.spacing(2), margin: `${theme.spacing(0.25)} 0`, ...sx }}
      {...other}
    />
  );
};
