/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AutocompleteRenderInputParams, ListItemButtonProps, ListItemProps, TextFieldProps } from '@mui/material';
import {
  Box,
  InputAdornment,
  ListItem,
  ListItemButton,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import { useInputTextFieldSlots } from 'components/visual/Inputs/components/inputs.component.textfield';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { ListInputControllerProps } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

/**********************************************************************************************************************
 * Skeletons
 *********************************************************************************************************************/
export const ListInputLoading = React.memo(() => {
  const [get] = usePropStore<ListInputControllerProps>();

  const id = useInputId();
  const skeletonProps = get('slotProps')?.skeleton;
  const tiny = get('tiny');
  const width = get('width');

  return (
    <Skeleton
      id={`${id}-skeleton`}
      {...skeletonProps}
      sx={{
        height: '40px',
        transform: 'unset',
        width: width,
        ...(tiny && { height: '28px' }),
        ...skeletonProps?.sx
      }}
    />
  );
});

ListInputLoading.displayName = 'ListInputLoading';

/**********************************************************************************************************************
 * Forms
 *********************************************************************************************************************/
export const ListInputRoot = React.memo(({ children, ...props }: ListItemProps) => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const disabled = get('disabled');
  const divider = get('divider');
  const readOnly = get('readOnly');
  const rootProps = get('slotProps')?.root;
  const validationStatus = get('validationStatus');

  const showValidationColor =
    !disabled && !readOnly && validationStatus && validationStatus !== 'default' && validationStatus !== 'error';

  const color = showValidationColor ? validationStatus : undefined;

  return (
    <ListItem
      {...props}
      {...rootProps}
      sx={{
        minHeight: '50px',
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
        ...(color && {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette[color].main
            },
            '&:hover fieldset': {
              borderColor: theme.palette[color].dark
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette[color].main
            }
          }
        }),

        ...(readOnly &&
          !disabled && {
            '& .MuiInputBase-input': {
              cursor: 'default'
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
            }
          }),

        ...(props?.sx as any),
        ...(rootProps?.sx as any)
      }}
    >
      {children}
    </ListItem>
  );
});

ListInputRoot.displayName = 'ListInputRoot';

export const ListInputWrapper = React.memo((props: React.HTMLAttributes<HTMLDivElement>) => {
  const [get] = usePropStore<ListInputControllerProps>();

  const wrapperProps = get('slotProps')?.wrapper;

  return (
    <div
      {...props}
      {...wrapperProps}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minWidth: 0,
        ...props?.style,
        ...wrapperProps?.style
      }}
    />
  );
});

ListInputWrapper.displayName = 'ListInputWrapper';

export const ListInputInner = React.memo((props: React.HTMLAttributes<HTMLDivElement>) => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const innerProps = get('slotProps')?.inner;

  return (
    <div
      {...props}
      {...innerProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: 0,
        columnGap: theme.spacing(1),
        ...props?.style,
        ...innerProps?.style
      }}
    />
  );
});

ListInputInner.displayName = 'ListInputInner';

export const ListInputButtonRoot = React.memo(({ children, ...props }: ListItemButtonProps) => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const buttonRootProps = get('slotProps')?.buttonRoot;
  const disabled = get('disabled');
  const divider = get('divider');
  const loading = get('loading');
  const readOnly = get('readOnly');

  return (
    <ListItemButton
      disabled={disabled || readOnly || loading}
      role={undefined}
      {...props}
      {...buttonRootProps}
      sx={{
        // gap: theme.spacing(0.5),
        py: theme.spacing(0.5),
        ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
        // ...(((readOnly && !disabled) || loading) && {
        //   '&.Mui-disabled': { opacity: 1 }
        // }),
        '&.Mui-disabled': { opacity: 1 },
        ...(props?.sx as any),
        ...(buttonRootProps?.sx as any)
      }}
    >
      {children}
    </ListItemButton>
  );
});

ListInputButtonRoot.displayName = 'ListInputButtonRoot';

export type ListInputTextProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  noLabel?: boolean;
};

export const ListInputText = React.memo(({ noLabel = false, ...props }: ListInputTextProps) => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const id = useInputId();
  const inset = get('inset');
  const monospace = get('monospace');
  const overflowHidden = get('overflowHidden');
  const primary = get('primary');
  const primaryTypographyProps = get('slotProps')?.primary;
  const secondary = get('secondary');
  const secondaryTypographyProps = get('slotProps')?.secondary;

  return (
    <Box
      component={noLabel ? 'div' : 'label'}
      {...(!noLabel && { htmlFor: id })}
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'inherit',
        mr: 2,
        m: `${theme.spacing(0.25)} 0`,
        ...(inset && { ml: '42px' }),
        '&:hover>*': {
          overflow: 'auto',
          whiteSpace: 'wrap'
        }
      }}
      {...props}
    >
      <Typography
        variant="body1"
        {...(overflowHidden && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}
        {...(capitalize && { textTransform: 'capitalize' })}
        {...(monospace && { fontFamily: 'monospace' })}
        sx={{ ...(disabled && { color: theme.palette.text.disabled }) }}
        {...primaryTypographyProps}
      >
        {primary}
      </Typography>
      <Typography
        color="textSecondary"
        variant="body2"
        sx={{ ...(disabled && { color: theme.palette.text.disabled }) }}
        {...(overflowHidden && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}
        {...(capitalize && { textTransform: 'capitalize' })}
        {...(monospace && { fontFamily: 'monospace' })}
        {...secondaryTypographyProps}
      >
        {secondary}
      </Typography>
    </Box>
  );
});

ListInputText.displayName = 'ListInputText';

export type ListInputTextFieldProps = TextFieldProps & {
  params?: AutocompleteRenderInputParams;
};

export const ListInputTextField = React.memo(({ params, ...props }: ListInputTextFieldProps) => {
  const [get] = usePropStore<ListInputControllerProps>();

  const endAdornment = get('endAdornment');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');

  const inputTextFieldSlots = useInputTextFieldSlots();

  return (
    <TextField
      {...inputTextFieldSlots}
      {...params}
      {...props}
      slotProps={{
        ...inputTextFieldSlots?.slotProps,
        ...props?.slotProps,
        inputLabel: {
          ...props?.slotProps?.inputLabel,
          ...params?.InputLabelProps
        },
        input: {
          ...inputTextFieldSlots?.slotProps?.input,
          ...props?.slotProps?.input,
          ...params?.InputProps,
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: (
            <>
              {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
              {params?.InputProps?.startAdornment}
            </>
          ),
          endAdornment: (
            <>
              {props?.slotProps?.input?.['endAdornment']}
              {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
            </>
          )
        }
      }}
    />
  );
});

ListInputTextField.displayName = 'ListInputTextField';
