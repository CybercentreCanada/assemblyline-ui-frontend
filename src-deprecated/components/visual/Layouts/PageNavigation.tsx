import MenuIcon from '@mui/icons-material/Menu';
import type {
  CheckboxProps,
  DrawerProps,
  IconButtonProps,
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
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { memo, useCallback, useMemo, useState } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

type PageNavigationDrawerProps = {
  open: DrawerProps['open'];
  children?: React.ReactNode;
  variant?: DrawerProps['anchor'];
  onOpen: IconButtonProps['onClick'];
  onClose: DrawerProps['onClose'];
};

const PageNavigationDrawer = memo(
  ({ open = false, children = null, variant = 'left', onOpen, onClose }: PageNavigationDrawerProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const anchor = variant === 'left' ? 'left' : 'right';

    if (!isMobile) return <>{children}</>;

    return (
      <>
        <IconButton onClick={onOpen}>
          <MenuIcon />
        </IconButton>
        <Drawer open={open} anchor={anchor} onClose={onClose}>
          {children}
        </Drawer>
      </>
    );
  }
);

export type PageNavigationItemProp = ListItemProps & {
  active?: boolean;
  checkboxProps?: CheckboxProps;
  preventRender?: boolean;
  primary: React.ReactNode;
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  readOnly?: boolean;
  subheader?: boolean;
  to?: LinkProps['to'];
  variant?: DrawerProps['anchor'];
  onPageNavigation?: (e: React.MouseEvent<HTMLElement>, props: PageNavigationItemProp) => void;
};

export const PageNavigationItem = React.memo((props: PageNavigationItemProp) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    active = false,
    checkboxProps,
    id,
    preventRender = false,
    primary,
    primaryProps,
    readOnly = false,
    subheader = false,
    to,
    variant = 'left',
    onPageNavigation,
    ...listItemProps
  } = props;

  const computedId = id || primary.toString();

  const activeStyles = useMemo(
    () => ({
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1)
    }),
    [theme.palette.primary.main]
  );

  const leftVariantStyles = useMemo(
    () => ({
      borderRadius: '0 18px 18px 0',
      '&.Active': activeStyles
    }),
    [activeStyles]
  );

  const rightVariantStyles = useMemo(
    () => ({
      '&.Active': {
        color: theme.palette.primary.main,
        borderLeft: `1px solid ${theme.palette.primary.main}`
      }
    }),
    [theme.palette.primary.main]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      onPageNavigation?.(e, props);
    },
    [onPageNavigation, props]
  );

  if (preventRender) return null;

  if (readOnly) {
    return (
      <ListItem disablePadding {...listItemProps} sx={{ px: 2, py: 0.5, ...listItemProps.sx }}>
        <Typography
          variant="body2"
          color={active ? 'primary' : subheader ? 'textSecondary' : 'textPrimary'}
          sx={{ my: 0.25 }}
          {...primaryProps}
        >
          {primary}
        </Typography>
      </ListItem>
    );
  }

  return (
    <ListItem
      disablePadding
      secondaryAction={
        checkboxProps && (
          <Checkbox
            edge="end"
            size="small"
            inputProps={{ id: computedId, ...checkboxProps.inputProps }}
            {...checkboxProps}
            sx={{ p: 0.75 }}
          />
        )
      }
      {...listItemProps}
    >
      <ListItemButton
        id={computedId}
        className={active ? 'Active' : ''}
        onClick={handleClick}
        component={to ? Link : 'div'}
        to={to || undefined}
        sx={{
          pl: subheader ? 1.5 : 3,
          ...(active ? {} : { ml: '1px' }),
          ...(variant === 'left' ? leftVariantStyles : rightVariantStyles),
          ...(isMobile && { '&.Active': activeStyles }),
          ...listItemProps.sx
        }}
      >
        <Typography
          variant="body2"
          color={active ? 'primary' : subheader ? 'textSecondary' : 'textPrimary'}
          sx={{
            my: 0.25,
            ...(checkboxProps && !checkboxProps.checked && !checkboxProps.indeterminate && { opacity: 0.38 }),
            ...primaryProps?.sx
          }}
          {...primaryProps}
        >
          {primary}
        </Typography>
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
    opt: PageNavigationItemProp,
    index: number,
    NavItem: React.FC<PageNavigationItemProp>
  ) => React.ReactNode;
  onPageNavigation?: PageNavigationItemProp['onPageNavigation'];
};

export const PageNavigation = memo(
  ({
    children,
    loading = false,
    options,
    preventRender = false,
    subheader,
    subheaderProps,
    variant = 'left',
    renderItem,
    onPageNavigation = () => null,
    ...listProps
  }: PageNavigationProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleNavigate = useCallback(
      (e: React.MouseEvent<HTMLElement>, p: PageNavigationItemProp) => {
        setOpen(false);
        onPageNavigation(e, p);
      },
      [onPageNavigation]
    );

    if (preventRender) return null;

    return (
      <PageNavigationDrawer open={open} variant={variant} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        <List
          component="nav"
          dense
          sx={{ '& ul': { p: 0 }, ...listProps.sx }}
          subheader={
            subheader && !loading ? (
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
            ) : null
          }
          {...listProps}
        >
          {!loading &&
            (Array.isArray(options)
              ? options.map((opt, i) =>
                  renderItem ? (
                    renderItem(opt, i, p => (
                      <PageNavigationItem key={i} variant={variant} onPageNavigation={handleNavigate} {...p} />
                    ))
                  ) : (
                    <PageNavigationItem key={i} variant={variant} onPageNavigation={handleNavigate} {...opt} />
                  )
                )
              : children)}
        </List>
      </PageNavigationDrawer>
    );
  }
);
