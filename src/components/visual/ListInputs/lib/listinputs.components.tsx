import type { AutocompleteRenderInputParams, ListItemButtonProps, ListItemProps, TextFieldProps } from '@mui/material';
import {
  Box,
  FormHelperText,
  InputAdornment,
  ListItem,
  ListItemButton,
  Skeleton,
  styled,
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
export const ListInputLoading = React.memo(
  styled(Skeleton)(({ theme }) => ({
    height: '2rem',
    width: '30%',
    marginRight: theme.spacing(0.5)
  }))
);

ListInputLoading.displayName = 'ListInputLoading';

/**********************************************************************************************************************
 * Forms
 *********************************************************************************************************************/

export const ListInputRoot = React.memo(({ sx, ...props }: ListItemProps) => {
  const theme = useTheme();

  const [get] = usePropStore<ListInputControllerProps>();

  const divider = get('divider');

  return (
    <ListItem
      sx={{
        minHeight: '50px',
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
        ...sx
      }}
      {...props}
    />
  );
});

ListInputRoot.displayName = 'ListInputRoot';

export const ListInputWrapper = React.memo(
  styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    minWidth: 0
  })
);

ListInputWrapper.displayName = 'ListInputWrapper';

export const ListInputInner = React.memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    columnGap: theme.spacing(1)
  }))
);

ListInputInner.displayName = 'ListInputInner';

export const ListInputButtonRoot = React.memo(({ children, sx, ...props }: ListItemButtonProps) => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const disabled = get('disabled');
  const loading = get('loading');
  const readOnly = get('readOnly');
  const divider = get('divider');

  return (
    <ListItemButton
      disabled={disabled || readOnly || loading}
      role={undefined}
      sx={{
        // gap: theme.spacing(0.5),
        py: 0.5,
        ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
        // ...(((readOnly && !disabled) || loading) && {
        //   '&.Mui-disabled': { opacity: 1 }
        // }),
        '&.Mui-disabled': { opacity: 1 },
        ...sx
      }}
      {...props}
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
  const primary = get('primary');
  const primaryTypographyProps = get('primaryProps');
  const secondary = get('secondary');
  const secondaryTypographyProps = get('secondaryProps');

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
        overflow="hidden"
        textOverflow="ellipsis"
        variant="body1"
        whiteSpace="nowrap"
        {...(capitalize && { textTransform: 'capitalize' })}
        {...(monospace && { fontFamily: 'monospace' })}
        sx={{ ...(disabled && { color: theme.palette.text.disabled }) }}
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
        sx={{ ...(disabled && { color: theme.palette.text.disabled }) }}
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

export const ListInputHelperText = React.memo(() => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const disabled = get('disabled');
  const helperText = get('helperText');
  const helperTextProps = get('slotProps')?.helperText;
  const id = useInputId();
  const loading = get('loading');
  const readOnly = get('readOnly');
  const validationMessage = get('validationMessage');
  const validationStatus = get('validationStatus');

  if (disabled || loading || readOnly) return null;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%'
      }}
    >
      {children}
    </div>
  );

  if (validationStatus === 'error')
    return (
      <Wrapper>
        <FormHelperText
          id={`${id}-helper-text`}
          variant="outlined"
          {...helperTextProps}
          sx={{ color: theme.palette.error.main, ...helperTextProps?.sx }}
        >
          {validationMessage}
        </FormHelperText>
      </Wrapper>
    );

  if (helperText)
    return (
      <Wrapper>
        <FormHelperText
          id={`${id}-helper-text`}
          variant="outlined"
          {...helperTextProps}
          sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
        >
          {helperText}
        </FormHelperText>
      </Wrapper>
    );

  return null;
});

ListInputHelperText.displayName = 'ListInputHelperText';

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
