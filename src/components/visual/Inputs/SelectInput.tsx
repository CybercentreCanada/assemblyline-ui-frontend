import type {
  FormHelperTextProps,
  IconButtonProps,
  ListItemTextProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import { HelperText } from './components/HelperText';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

export type SelectInputProps = Omit<SelectProps, 'error' | 'value' | 'onChange'> & {
  capitalize?: boolean;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: MenuItemProps['value']) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options: {
    primary: ListItemTextProps['primary'];
    secondary?: ListItemTextProps['secondary'];
    value: MenuItemProps['value'];
  }[];
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: MenuItemProps['value'];
  onChange?: (event: SelectChangeEvent<unknown>, value: MenuItemProps['value']) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSelectInput = ({
  capitalize = false,
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  hasEmpty = false,
  helperText = null,
  helperTextProps = null,
  id: idProp = null,
  label,
  labelProps,
  loading = false,
  options = [],
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  reset = false,
  resetProps = null,
  rootProps = null,
  tiny = false,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...selectProps
}: SelectInputProps) => {
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id}
          color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          sx={{
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
          {...labelProps}
          children={label}
        />
      </Tooltip>
      <FormControl
        fullWidth
        error={!!errorValue}
        {...(readOnly &&
          !disabled && {
            focused: null,
            sx: {
              '& .MuiInputBase-input': { cursor: 'default' },
              '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
              }
            }
          })}
      >
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
        ) : (
          <Select
            aria-describedby={disabled || !(errorValue || helperText) ? null : `${id}-helper-text`}
            disabled={disabled}
            displayEmpty
            fullWidth
            placeholder={placeholder}
            readOnly={readOnly}
            size="small"
            value={options.some(o => o.value === value) ? value : ''}
            variant="outlined"
            inputProps={{
              id: id,
              sx: {
                display: 'flex',
                alignItems: 'center',
                ...(tiny && {
                  paddingTop: theme.spacing(0.25),
                  paddingBottom: theme.spacing(0.25)
                })
              }
            }}
            renderValue={option => (
              <ListItemText
                primary={options.find(o => o.value === option)?.primary || ''}
                primaryTypographyProps={{ sx: { cursor: 'pointer' }, ...(tiny && { variant: 'body2' }) }}
                sx={{ margin: 0 }}
              />
            )}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => {
              const v = event.target.value as string;
              onChange(event, v);

              const err = error(v);
              if (err) onError(err);
            }}
            onFocus={event => setFocused(document.activeElement === event.target)}
            onBlur={() => setFocused(false)}
            endAdornment={
              <>
                {loading || !reset || disabled || readOnly ? null : (
                  <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                    <ResetInput
                      id={id}
                      preventRender={loading || !reset || disabled || readOnly}
                      tiny={tiny}
                      onReset={onReset}
                      {...resetProps}
                    />
                  </InputAdornment>
                )}
                {endAdornment && (
                  <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                    {endAdornment}
                  </InputAdornment>
                )}
              </>
            }
            MenuProps={{ sx: { maxWidth: 'min-content' } }}
            {...selectProps}
          >
            {hasEmpty && <MenuItem value="" sx={{ height: '36px' }}></MenuItem>}
            {options.map((option, i) => (
              <MenuItem
                key={i}
                value={option.value}
                sx={{
                  '&>div': { margin: 0, cursor: 'pointer !important' },
                  ...(capitalize && { textTransform: 'capitalize' })
                }}
              >
                <ListItemText
                  primary={option.primary}
                  secondary={option.secondary}
                  primaryTypographyProps={{
                    textTransform: 'capitalize',
                    overflow: 'auto',
                    textOverflow: 'initial',
                    whiteSpace: 'normal',
                    ...(tiny && { variant: 'body2' })
                  }}
                  secondaryTypographyProps={{
                    overflow: 'auto',
                    textOverflow: 'initial',
                    whiteSpace: 'normal',
                    ...(tiny && { variant: 'body2' })
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        )}
        <HelperText
          id={id}
          label={label}
          disabled={disabled}
          errorProps={errorProps}
          errorText={errorValue}
          helperText={helperText}
          helperTextProps={helperTextProps}
        />
      </FormControl>
    </div>
  );
};

export const SelectInput = React.memo(WrappedSelectInput);
