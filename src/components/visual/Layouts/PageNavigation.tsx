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
import React, { useMemo, useState } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

type PageNavigationDrawerProps = {
  open: DrawerProps['open'];
  children?: React.ReactNode;
  variant?: DrawerProps['anchor'];
  onOpen: IconButtonProps['onClick'];
  onClose: DrawerProps['onClose'];
};

const PageNavigationDrawer = React.memo(
  ({
    open = false,
    children = null,
    variant = 'left',
    onOpen = () => null,
    onClose = () => null
  }: PageNavigationDrawerProps) => {
    const theme = useTheme();

    const isDownLG = useMediaQuery(theme.breakpoints.down('lg'));

    return isDownLG ? (
      <>
        <IconButton onClick={onOpen}>
          <MenuIcon />
        </IconButton>
        <Drawer open={open} anchor={variant === 'left' ? 'left' : 'right'} onClose={onClose}>
          {children}
        </Drawer>
      </>
    ) : (
      <>{children}</>
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
  onPageNavigation?: (event: React.MouseEvent<HTMLElement, MouseEvent>, props: PageNavigationItemProp) => void;
};

export const PageNavigationItem: React.FC<PageNavigationItemProp> = React.memo((props: PageNavigationItemProp) => {
  const theme = useTheme();

  const {
    active = false,
    checkboxProps = null,
    id = null,
    preventRender = false,
    primary,
    primaryProps = null,
    readOnly = false,
    subheader = false,
    to = null,
    variant = 'left',
    onPageNavigation = null,
    ...listItemProps
  } = useMemo<PageNavigationItemProp>(() => props, [props]);

  const isDownLG = useMediaQuery(theme.breakpoints.down('lg'));

  return preventRender ? null : readOnly ? (
    <ListItem
      disablePadding
      {...listItemProps}
      sx={{
        padding: `${theme.spacing(0.5)} ${theme.spacing(2)} ${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
        ...listItemProps?.sx
      }}
    >
      <Typography
        color={active ? 'primary' : subheader ? 'textSecondary' : 'textPrimary'}
        margin={`${theme.spacing(0.25)} 0px`}
        variant="body2"
        {...primaryProps}
      >
        {primary}
      </Typography>
    </ListItem>
  ) : (
    <ListItem
      disablePadding
      secondaryAction={
        !checkboxProps ? null : (
          <Checkbox
            edge="end"
            size="small"
            inputProps={{ id: id || primary.toString(), ...checkboxProps?.inputProps }}
            {...checkboxProps}
            sx={{
              padding: theme.spacing(0.75)
            }}
          />
        )
      }
      {...listItemProps}
    >
      <ListItemButton
        id={id || primary.toString()}
        className={active ? 'Active' : ''}
        sx={{
          paddingLeft: theme.spacing(3),
          '&:not(.Active)': {
            marginLeft: '1px'
          },
          ...(subheader && {
            paddingLeft: theme.spacing(1.5)
          }),
          ...(variant === 'left'
            ? {
                borderRadius: '0 18px 18px  0',
                '&.Active': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }
            : {
                '&.Active': {
                  color: theme.palette.primary.main,
                  borderLeft: `1px solid ${theme.palette.primary.main}`
                }
              }),
          ...(isDownLG && {
            '&.Active': {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          })
        }}
        {...(onPageNavigation && { onClick: event => onPageNavigation(event, props) })}
        {...(to !== null && { component: Link, to: to })}
      >
        <Typography
          color={active ? 'primary' : subheader ? 'textSecondary' : 'textPrimary'}
          margin={`${theme.spacing(0.25)} 0px`}
          variant="body2"
          {...primaryProps}
          sx={{
            ...(checkboxProps && !checkboxProps?.checked && !checkboxProps?.indeterminate && { opacity: 0.38 }),
            ...primaryProps?.sx
          }}
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
    const [open, setOpen] = useState<boolean>(false);

    return preventRender ? null : (
      <PageNavigationDrawer open={open} variant={variant} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
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
                    <PageNavigationItem
                      key={i}
                      variant={variant}
                      onPageNavigation={(event, props) => {
                        setOpen(false);
                        onPageNavigation(event, props);
                      }}
                      {...option}
                    />
                  ) : (
                    renderItem(option, i, props => (
                      <PageNavigationItem
                        key={i}
                        variant={variant}
                        onPageNavigation={(event, props) => {
                          setOpen(false);
                          onPageNavigation(event, props);
                        }}
                        {...props}
                      />
                    ))
                  )
                )}
        </List>
      </PageNavigationDrawer>
    );
  }
);
