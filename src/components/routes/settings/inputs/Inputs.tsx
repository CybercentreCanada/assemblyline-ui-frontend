import RefreshIcon from '@mui/icons-material/Refresh';
import type {
  CheckboxProps,
  IconButtonProps,
  ListItemButtonProps,
  ListItemProps,
  ListItemTextProps,
  ListProps,
  SkeletonProps
} from '@mui/material';
import {
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  useTheme
} from '@mui/material';
import { type FC, type HTMLAttributes } from 'react';

interface InputSkeletonProps extends SkeletonProps {
  visible?: boolean;
}

export const InputSkeleton: FC<InputSkeletonProps> = ({ visible = false, sx, ...other }) => {
  const theme = useTheme();
  return !visible ? null : (
    <Skeleton sx={{ height: '2rem', width: '2.5rem', marginRight: theme.spacing(0.5), ...sx }} {...other} />
  );
};

interface InputResetButtonProps extends IconButtonProps {
  visible?: boolean;
  active?: boolean;
}

export const InputResetButton: FC<InputResetButtonProps> = ({
  visible = false,
  active = false,
  onClick = () => null,
  ...other
}) => (
  <div style={{ ...(!visible && { opacity: 0 }) }}>
    <IconButton
      type="reset"
      color="primary"
      children={<RefreshIcon fontSize="small" />}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onClick(event);
      }}
      {...other}
    />
  </div>
);

interface InputListItemTextProps extends ListItemTextProps {
  capitalize?: boolean;
}

export const InputListItemText: FC<InputListItemTextProps> = ({
  capitalize = false,
  sx,
  primaryTypographyProps,
  secondaryTypographyProps,
  ...other
}) => {
  const theme = useTheme();
  return (
    <ListItemText
      sx={{ marginRight: theme.spacing(2), margin: `${theme.spacing(0.25)} 0`, ...sx }}
      primaryTypographyProps={{
        whiteSpace: 'nowrap',
        ...(capitalize && { textTransform: 'capitalize' }),
        ...primaryTypographyProps
      }}
      secondaryTypographyProps={{
        ...secondaryTypographyProps
      }}
      {...other}
    />
  );
};

interface InputListItemButtonProps extends ListItemButtonProps {}

export const InputListItemButton: FC<InputListItemButtonProps> = ({ sx, ...other }) => {
  const theme = useTheme();
  return <ListItemButton role={undefined} sx={{ gap: theme.spacing(0.5), ...sx }} {...other} />;
};

interface InputListItemProps extends ListItemProps {}

export const InputListItem: FC<InputListItemProps> = ({ ...other }) => <ListItem {...other} />;

interface InputListProps extends ListProps {}

export const InputList: FC<InputListProps> = ({ sx, ...other }) => {
  const theme = useTheme();
  return (
    <List
      component={p => <Paper {...p} component="ul" />}
      disablePadding
      sx={{
        marginLeft: '56px',
        '&>:not(:last-child)': {
          borderBottom: `thin solid ${theme.palette.divider}`
        },
        ...sx
      }}
      {...other}
    />
  );
};

interface InputContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  hidden?: boolean;
}

export const InputContainer: FC<InputContainerProps> = ({ hidden = false, children, style, ...other }) => {
  const theme = useTheme();
  return hidden ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }} {...other}>
      {children}
    </div>
  );
};

interface InputContainerTitleProps extends ListItemProps {
  primary?: ListItemTextProps['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondaryTypographyProps'];
  checked?: CheckboxProps['checked'];
  indeterminate?: CheckboxProps['indeterminate'];
  buttonProps?: ListItemButtonProps;
  underlined?: boolean;
  edge?: 'start' | 'end';
}

export const InputContainerTitle: FC<InputContainerTitleProps> = ({
  id,
  primary,
  secondary,
  checked = null,
  indeterminate,
  buttonProps,
  underlined = false,
  edge = 'end',
  ...other
}) => {
  const theme = useTheme();

  return checked !== null ? (
    <ListItem id={id} disableGutters disablePadding {...other}>
      <ListItemButton
        dense
        disableGutters
        {...buttonProps}
        sx={{
          padding: 0,
          '&.MuiButtonBase-root:hover': {
            bgcolor: 'transparent'
          },
          ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` })
        }}
      >
        <ListItemIcon>
          <Checkbox
            edge={edge}
            tabIndex={-1}
            checked={checked}
            indeterminate={indeterminate}
            disableRipple
            inputProps={{ id: `${id}-input` }}
          />
        </ListItemIcon>
        <ListItemText
          primary={primary?.children}
          primaryTypographyProps={{
            htmlFor: `${id}-input`,
            component: 'label',
            variant: 'body1',
            sx: { '&:hover': { cursor: 'pointer' } },
            ...primary
          }}
          secondary={secondary?.children}
          secondaryTypographyProps={secondary}
        />
      </ListItemButton>
    </ListItem>
  ) : (
    <ListItem
      id={id}
      disablePadding
      sx={{
        marginLeft: '56px',
        ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` })
      }}
    >
      <ListItemText
        primary={primary?.children}
        primaryTypographyProps={{ variant: 'body1', ...primary }}
        secondary={secondary?.children}
        secondaryTypographyProps={secondary}
      />
    </ListItem>
  );
};

interface InputHeaderProps extends ListItemProps {
  primary?: ListItemTextProps['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondaryTypographyProps'];
  checked?: boolean;
  buttonProps?: ListItemButtonProps;
  underlined?: boolean;
  edge?: 'start' | 'end';
}

export const InputHeader: FC<InputHeaderProps> = ({ primary, secondary, underlined = false, ...other }) => {
  const theme = useTheme();

  return (
    <ListItem
      disablePadding
      sx={{
        scrollMarginTop: '62px',
        ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` })
      }}
    >
      <ListItemText
        primary={primary?.children}
        primaryTypographyProps={{ variant: 'h6', ...primary }}
        secondary={secondary?.children}
        secondaryTypographyProps={secondary}
      />
    </ListItem>
  );
};
