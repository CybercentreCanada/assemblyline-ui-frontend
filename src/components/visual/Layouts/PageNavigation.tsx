import type { CheckboxProps, ListItemTextProps, ListProps, ListSubheaderProps } from '@mui/material';
import { alpha, Checkbox, List, ListItem, ListItemButton, ListSubheader, useTheme } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import React, { useMemo } from 'react';

type PageNavigationItemProp = {
  id?: string;
  active?: boolean;
  primary: string;
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  secondary?: string;
  secondaryProps?: ListItemTextProps['secondaryTypographyProps'];
  subheader?: boolean;
  checkboxProps?: CheckboxProps;
  variant?: 'left' | 'right';
  onPageNavigation?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, props: PageNavigationItemProp) => void;
};

const PageNavigationItem: React.FC<PageNavigationItemProp> = React.memo((props: PageNavigationItemProp) => {
  const theme = useTheme();

  const {
    id = null,
    active = false,
    primary,
    primaryProps = null,
    secondary = null,
    secondaryProps = null,
    checkboxProps: checkbox = null,
    subheader = false,
    variant = 'left',
    onPageNavigation = () => null,
    ...listItemProps
  } = useMemo<PageNavigationItemProp>(() => props, [props]);

  const { ...checkboxProps } = useMemo<CheckboxProps>(() => ({ ...checkbox }), [checkbox]);

  return subheader ? (
    <ListItem
      disablePadding
      sx={{ margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(0.5)} ${theme.spacing(2)}` }}
    >
      <ListItemText
        primary={primary}
        primaryTypographyProps={{ color: 'textSecondary', ...primaryProps }}
        secondary={secondary}
        secondaryTypographyProps={secondaryProps}
      />
    </ListItem>
  ) : (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          !checkbox ? null : (
            <Checkbox
              edge="end"
              // inputProps={{ id: `navigation: ${service.category}-${service.name}` }}
              // checked={selected}
              // disabled={disabled || !customize}
              // onChange={() => handleChange(selected)}
              {...checkboxProps}
            />
          )
        }
      >
        <ListItemButton
          id={id || primary}
          sx={{
            paddingLeft: theme.spacing(3),
            paddingRight: 0,
            ...(!active && { marginLeft: '1px' }),
            ...(variant === 'left' && {
              borderRadius: '0 18px 18px  0',
              ...(active && {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              })
            }),
            ...(variant === 'right' && {
              ...(active && {
                color: theme.palette.primary.main,
                borderLeft: `1px solid ${theme.palette.primary.main}`
              })
            })
          }}
          onClick={event => onPageNavigation(event, props)}
        >
          <ListItemText
            primary={primary}
            primaryTypographyProps={primaryProps}
            secondary={secondary}
            secondaryTypographyProps={secondaryProps}
          />
        </ListItemButton>
      </ListItem>
    </>
  );
});

export type PageNavigationProps = Omit<ListProps, 'subheader'> & {
  subheader?: string;
  subheaderProps?: ListSubheaderProps;
  options: PageNavigationItemProp[];
  variant?: 'left' | 'right';
  render: (
    params: PageNavigationItemProp,
    index?: number,
    NavItem?: React.FC<PageNavigationItemProp>
  ) => React.ReactNode;
  onPageNavigation?: PageNavigationItemProp['onPageNavigation'];
};

export const PageNavigation: React.FC<PageNavigationProps> = React.memo(
  ({
    subheader = null,
    subheaderProps = null,
    options = [],
    variant = 'left',
    render = () => null,
    onPageNavigation = () => null,
    ...listProps
  }: PageNavigationProps) => {
    const theme = useTheme();

    return (
      <List
        component="nav"
        subheader={
          !subheader ? null : (
            <ListSubheader sx={{ backgroundColor: theme.palette.background.default }} {...subheaderProps}>
              {subheader}
            </ListSubheader>
          )
        }
        dense
        sx={{ '& ul': { padding: 0 }, ...listProps?.sx }}
        {...listProps}
      >
        {options.map((option, i) =>
          render(option, i, props => (
            <PageNavigationItem variant={variant} onPageNavigation={onPageNavigation} {...props} />
          ))
        )}
      </List>
    );
  }
);
