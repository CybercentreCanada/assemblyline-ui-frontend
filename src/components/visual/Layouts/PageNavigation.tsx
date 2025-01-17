import MenuIcon from '@mui/icons-material/Menu';
import type {
  CheckboxProps,
  DrawerProps,
  ListItemProps,
  ListItemTextProps,
  ListProps,
  ListSubheaderProps
} from '@mui/material';
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
    paddingLeft: theme.spacing(3),
    '&:not(.Active)': {
      marginLeft: '1px'
    }
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

export type PageNavigationItemProp = ListItemProps & {
  active?: boolean;
  checkboxProps?: CheckboxProps;
  preventRender?: boolean;
  primary: React.ReactNode;
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  readOnly?: boolean;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps['secondaryTypographyProps'];
  subheader?: boolean;
  to?: LinkProps['to'];
  variant?: DrawerProps['anchor'];
  onPageNavigation?: (event: React.MouseEvent<HTMLElement, MouseEvent>, props: PageNavigationItemProp) => void;
};

export const PageNavigationItem: React.FC<PageNavigationItemProp> = React.memo((props: PageNavigationItemProp) => {
  const theme = useTheme();
  const classes = useStyles();

  const {
    active = false,
    checkboxProps: checkbox = null,
    id = null,
    preventRender = false,
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

  return preventRender ? null : readOnly ? (
    <ListItem className={clsx(classes.readOnly)} disablePadding {...listItemProps}>
      <ListItemText
        primary={primary}
        primaryTypographyProps={{ color: 'textSecondary', ...primaryProps }}
        secondary={secondary}
        secondaryTypographyProps={secondaryProps}
      />
    </ListItem>
  ) : (
    <ListItem
      disablePadding
      secondaryAction={!checkbox ? null : <Checkbox edge="end" {...checkboxProps} />}
      {...listItemProps}
    >
      <ListItemButton
        id={id || primary.toString()}
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
  children?: React.ReactNode;
  loading?: boolean;
  options?: PageNavigationItemProp[];
  preventRender?: boolean;
  subheader?: string;
  subheaderProps?: ListSubheaderProps;
  variant?: DrawerProps['anchor'];
  renderItem?: (
    params: PageNavigationItemProp,
    index?: number,
    NavItem?: React.FC<PageNavigationItemProp>
  ) => React.ReactNode;
  onPageNavigation?: PageNavigationItemProp['onPageNavigation'];
};

export const PageNavigation: React.FC<PageNavigationProps> = React.memo(
  ({
    children = null,
    loading = false,
    options = null,
    preventRender = false,
    subheader = null,
    subheaderProps = null,
    variant = 'left',
    renderItem = null,
    onPageNavigation = () => null,
    ...listProps
  }: PageNavigationProps) => {
    return preventRender ? null : (
      <PageNavigationDrawer variant={variant}>
        <List
          component="nav"
          subheader={
            !subheader || loading ? null : (
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
          {loading
            ? null
            : !Array.isArray(options)
            ? children
            : options.map((option, i) =>
                !renderItem ? (
                  <PageNavigationItem key={i} variant={variant} onPageNavigation={onPageNavigation} {...option} />
                ) : (
                  renderItem(option, i, props => (
                    <PageNavigationItem key={i} variant={variant} onPageNavigation={onPageNavigation} {...props} />
                  ))
                )
              )}
        </List>
      </PageNavigationDrawer>
    );
  }
);
