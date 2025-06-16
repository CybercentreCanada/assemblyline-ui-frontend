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
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectInputProps<O extends Option[] = []> = Omit<
  SelectProps,
  'error' | 'options' | 'value' | 'onChange'
> & {
  capitalize?: boolean;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: O[number]['value']) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options: O;
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
  value: O[number]['value'];
  onChange?: (event: SelectChangeEvent<unknown>, value: O[number]['value']) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const SelectInput: <O extends Option[]>(props: SelectInputProps<O>) => React.ReactNode = React.memo(
  <O extends Option[]>({
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
    options = null,
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
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null,
    onReset = () => null,
    ...selectProps
  }: SelectInputProps<O>) => {
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
                  WebkitTextFillColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
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
              // placeholder={placeholder}
              readOnly={readOnly}
              size="small"
              value={options?.some(o => o.value === value) ? value : ''}
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
                  primary={options?.find(o => o.value === option)?.primary || ''}
                  slotProps={{
                    primary: {
                      sx: { cursor: 'pointer', ...(readOnly && { cursor: 'default', userSelect: 'text' }) },
                      ...(tiny && { variant: 'body2' })
                    }
                  }}
                  sx={{ margin: 0, ...(readOnly && { marginLeft: '6px' }) }}
                />
              )}
              sx={{ textTransform: 'capitalize' }}
              onChange={event => {
                const v = event.target.value as string;
                onChange(event, v);

                const err = error(v);
                if (err) onError(err);
              }}
              onFocus={(event, ...other) => {
                setFocused(!readOnly && !disabled && document.activeElement === event.target);
                onFocus(event, ...other);
              }}
              onBlur={(event, ...other) => {
                setFocused(false);
                onBlur(event, ...other);
              }}
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
              {options?.map((option, i) => (
                <MenuItem
                  key={i}
                  value={option.value as unknown as MenuItemProps['value']}
                  sx={{
                    '&>div': { margin: 0, cursor: 'pointer !important' },
                    ...(capitalize && { textTransform: 'capitalize' })
                  }}
                >
                  <ListItemText
                    primary={option.primary}
                    secondary={option.secondary}
                    slotProps={{
                      primary: {
                        sx: {
                          textTransform: 'capitalize',
                          overflow: 'auto',
                          textOverflow: 'initial',
                          whiteSpace: 'normal',
                          ...(tiny && { variant: 'body2' })
                        }
                      },
                      secondary: {
                        sx: {
                          overflow: 'auto',
                          textOverflow: 'initial',
                          whiteSpace: 'normal',
                          ...(tiny && { variant: 'body2' })
                        }
                      }
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
  }
);
