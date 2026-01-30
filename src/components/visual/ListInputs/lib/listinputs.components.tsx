import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type {
  AutocompleteRenderInputParams,
  ListItemButtonProps,
  ListItemProps,
  ListItemTextProps,
  TextFieldProps
} from '@mui/material';
import {
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import { useTextInputSlot } from 'components/visual/Inputs/lib/inputs.components';
import {
  useInputChange,
  useInputId,
  useShouldRenderPassword,
  useShouldRenderReset
} from 'components/visual/Inputs/lib/inputs.hook';
import type { ListInputControllerProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const StyledListInputWrapper = React.memo(
  styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    minWidth: 0
  })
);
StyledListInputWrapper.displayName = 'StyledListInputWrapper';

export const StyledListInputInner = React.memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    columnGap: theme.spacing(1)
  }))
);
StyledListInputInner.displayName = 'StyledListInputInner';

export const StyledListItemRoot = React.memo(({ sx, ...props }: ListItemProps) => {
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
StyledListItemRoot.displayName = 'StyledListItemRoot';

export const StyledListInputLoading = React.memo(
  styled(Skeleton)(({ theme }) => ({
    height: '2rem',
    width: '30%',
    marginRight: theme.spacing(0.5)
  }))
);
StyledListInputLoading.displayName = 'StyledListInputLoading';

// ------------------------------------------------------------
// Password Adornment
// ------------------------------------------------------------
export const StyledPasswordAdornment = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore<ListInputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isPasswordVisible = get('isPasswordVisible');
  const resetProps = get('resetProps');
  const shouldRenderPassword = useShouldRenderPassword();
  const tiny = get('tiny');

  return !shouldRenderPassword ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      disabled={disabled}
      type="button"
      onClick={() => setStore(s => ({ isPasswordVisible: !s.isPasswordVisible }))}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
        ...resetProps?.sx
      }}
    >
      {isPasswordVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
});

// ------------------------------------------------------------
// Reset Button
// ------------------------------------------------------------
export const StyledResetAdornment = React.memo(() => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<ListInputControllerProps>();

  const defaultValue = get('defaultValue');
  const disabled = get('disabled');
  const id = useInputId();
  const onReset = get('onReset');
  const resetProps = get('resetProps');
  const shouldRenderReset = useShouldRenderReset();
  const tiny = get('tiny');

  const handleChange = useInputChange();

  const title = useMemo<React.ReactNode>(
    () =>
      defaultValue === undefined ? null : (
        <>
          <span style={{ color: theme.palette.text.secondary }}>{t('reset_to')}</span>{' '}
          <span>
            {typeof defaultValue === 'object'
              ? JSON.stringify(defaultValue)
              : typeof defaultValue === 'string'
                ? `"${defaultValue}"`
                : `${defaultValue}`}
          </span>
        </>
      ),
    [defaultValue, t, theme.palette.text.secondary]
  );

  if (!shouldRenderReset) return null;

  return (
    <Tooltip arrow title={title} placement="bottom">
      <IconButton
        aria-label={`${id}-reset`}
        color="secondary"
        disabled={disabled}
        type="reset"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset ? onReset(event) : handleChange(event, defaultValue, defaultValue);
        }}
        {...resetProps}
        sx={{
          ...(tiny && { p: theme.spacing(0.5) }),
          ...resetProps?.sx
        }}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
});
StyledResetAdornment.displayName = 'StyledResetAdornment';

// ------------------------------------------------------------
// Text Label
// ------------------------------------------------------------
export type StyledListInputTextProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  noLabel?: boolean;
};

export const StyledListInputText = React.memo(({ noLabel = false, ...props }: StyledListInputTextProps) => {
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
StyledListInputText.displayName = 'StyledListInputText';

// ------------------------------------------------------------
// Helper / Error Text
// ------------------------------------------------------------
export const StyledHelperText = React.memo(() => {
  const theme = useTheme();
  const [get] = usePropStore<ListInputControllerProps>();

  const disabled = get('disabled');
  const helperText = get('helperText');
  const helperTextProps = get('helperTextProps');
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
StyledHelperText.displayName = 'StyledHelperText';

// ------------------------------------------------------------
// Structural Layout Elements
// ------------------------------------------------------------
export const StyledListInputButtonRoot = React.memo(({ children, sx, ...props }: ListItemButtonProps) => {
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
StyledListInputButtonRoot.displayName = 'StyledListInputButtonRoot';

// ------------------------------------------------------------
// StyledTextField
// ------------------------------------------------------------
export type StyledTextFieldProps = TextFieldProps & {
  params?: AutocompleteRenderInputParams;
};

export const StyledTextField = React.memo(({ params, ...props }: StyledTextFieldProps) => {
  const [get] = usePropStore<ListInputControllerProps>();

  const endAdornment = get('endAdornment');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');

  const textInputSlot = useTextInputSlot();

  return (
    <TextField
      {...textInputSlot}
      {...params}
      {...props}
      slotProps={{
        ...textInputSlot?.slotProps,
        ...props?.slotProps,
        inputLabel: {
          ...props?.slotProps?.inputLabel,
          ...params?.InputLabelProps
        },
        input: {
          ...textInputSlot?.slotProps?.input,
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
StyledTextField.displayName = 'StyledTextField';

export const StyledListItemText = React.memo(({ primary, secondary = null, ...props }: ListItemTextProps) => {
  const [get] = usePropStore<ListInputControllerProps>();

  const capitalize = get('capitalize');
  const isPasswordVisible = get('isPasswordVisible');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const tiny = get('tiny');

  return (
    <ListItemText
      primary={primary}
      secondary={secondary}
      {...props}
      slotProps={{
        ...props?.slotProps,
        primary: {
          ...props?.slotProps?.primary,
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(capitalize && { textTransform: 'capitalize' }),
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
          }
        },
        secondary: {
          ...props?.slotProps?.secondary,
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
          }
        }
      }}
      sx={{
        marginTop: 'initial',
        marginBottom: 'initial',
        ...(password &&
          isPasswordVisible && {
            wordBreak: 'break-all',
            fontFamily: 'password',
            WebkitTextSecurity: 'disc',
            MozTextSecurity: 'disc',
            textSecurity: 'disc'
          }),
        ...props?.sx
      }}
    />
  );
});
StyledListItemText.displayName = 'StyledListItemText';
