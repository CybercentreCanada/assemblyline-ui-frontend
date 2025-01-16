import MenuIcon from '@mui/icons-material/Menu';
import type { CheckboxProps, DrawerProps, ListItemTextProps, ListProps, ListSubheaderProps } from '@mui/material';
import {
  alpha,
  Checkbox,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  readOnly: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)} ${theme.spacing(0.5)} ${theme.spacing(1.5)}`
  },
  button: {
    paddingLeft: theme.spacing(3)
  },
  subheader: {
    paddingLeft: theme.spacing(1.5)
  },
  isDownLG: {
    '&.Active': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1)
    }
  },
  leftNav: {
    borderRadius: '0 18px 18px  0',
    '&.Active': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1)
    }
  },
  rightNav: {
    '&.Active': {
      color: theme.palette.primary.main,
      borderLeft: `1px solid ${theme.palette.primary.main}`
    }
  }
}));

type PageNavigationDrawerProps = {
  children?: React.ReactNode;
  variant?: DrawerProps['anchor'];
};

const PageNavigationDrawer = React.memo(({ children = null, variant = 'left' }: PageNavigationDrawerProps) => {
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);

  const isDownLG = useMediaQuery(theme.breakpoints.down('lg'));

  return isDownLG ? (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer open={open} anchor={variant === 'left' ? 'left' : 'right'} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </>
  ) : (
    <>{children}</>
  );
});

type PageNavigationItemProp = {
  active?: boolean;
  checkboxProps?: CheckboxProps;
  id?: string;
  primary: string;
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  readOnly?: boolean;
  secondary?: string;
  secondaryProps?: ListItemTextProps['secondaryTypographyProps'];
  subheader?: boolean;
  to?: LinkProps['to'];
  variant?: DrawerProps['anchor'];
  onPageNavigation?: (event: React.MouseEvent<HTMLElement, MouseEvent>, props: PageNavigationItemProp) => void;
};

const PageNavigationItem: React.FC<PageNavigationItemProp> = React.memo((props: PageNavigationItemProp) => {
  const theme = useTheme();
  const classes = useStyles();

  const {
    active = false,
    checkboxProps: checkbox = null,
    id = null,
    primary,
    primaryProps = null,
    readOnly = false,
    secondary = null,
    secondaryProps = null,
    subheader = false,
    to = null,
    variant = 'left',
    onPageNavigation = () => null,
    ...listItemProps
  } = useMemo<PageNavigationItemProp>(() => props, [props]);

  const { ...checkboxProps } = useMemo<CheckboxProps>(() => ({ ...checkbox }), [checkbox]);

  const isDownLG = useMediaQuery(theme.breakpoints.down('lg'));

  return readOnly ? (
    <ListItem className={clsx(classes.readOnly)} disablePadding>
      <ListItemText
        primary={primary}
        primaryTypographyProps={{ color: 'textSecondary', ...primaryProps }}
        secondary={secondary}
        secondaryTypographyProps={secondaryProps}
      />
    </ListItem>
  ) : (
    <ListItem disablePadding secondaryAction={!checkbox ? null : <Checkbox edge="end" {...checkboxProps} />}>
      <ListItemButton
        id={id || primary}
        className={clsx(
          classes.button,
          subheader && classes.subheader,
          isDownLG ? classes.isDownLG : variant === 'left' ? classes.leftNav : classes.rightNav,
          active && 'Active'
        )}
        onClick={event => onPageNavigation(event, props)}
        {...(to !== null && { LinkComponent: Link, to: to })}
      >
        <ListItemText
          primary={primary}
          primaryTypographyProps={{
            color: active ? 'primary' : subheader ? 'textSecondary' : 'textPrimary',
            ...primaryProps
          }}
          secondary={secondary}
          secondaryTypographyProps={secondaryProps}
        />
      </ListItemButton>
    </ListItem>
  );
});

export type PageNavigationProps = Omit<ListProps, 'subheader'> & {
  subheader?: string;
  subheaderProps?: ListSubheaderProps;
  options: PageNavigationItemProp[];
  variant?: DrawerProps['anchor'];
  render?: (
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
    render = null,
    onPageNavigation = () => null,
    ...listProps
  }: PageNavigationProps) => {
    return (
      <PageNavigationDrawer variant={variant}>
        <List
          component="nav"
          subheader={
            !subheader ? null : (
              <ListSubheader
                {...subheaderProps}
                sx={{
                  backgroundColor: 'initial',
                  textTransform: 'uppercase',
                  ...subheaderProps?.sx
                }}
              >
                {subheader}
              </ListSubheader>
            )
          }
          dense
          sx={{ '& ul': { padding: 0 }, ...listProps?.sx }}
          {...listProps}
        >
          {options.map((option, i) =>
            !render ? (
              <PageNavigationItem key={i} variant={variant} onPageNavigation={onPageNavigation} {...option} />
            ) : (
              render(option, i, props => (
                <PageNavigationItem key={i} variant={variant} onPageNavigation={onPageNavigation} {...props} />
              ))
            )
          )}
        </List>
      </PageNavigationDrawer>
    );
  }
);
