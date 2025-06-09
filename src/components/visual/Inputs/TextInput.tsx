import type {
  AutocompleteProps,
  AutocompleteValue,
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import type { ElementType } from 'react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TextInputProps<
  Value extends string = string,
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput' | 'options' | 'onChange' | 'value'
> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  startAdornment?: TextFieldProps['InputProps']['startAdornment'];
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: string;
  onChange?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['onInputChange'];
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedTextInput = <
  Value extends string = string,
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
>({
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
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
  startAdornment = null,
  tiny = false,
  rootProps = null,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...autocompleteProps
}: TextInputProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [_value, setValue] =
    useState<AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>>(null);
  const [focused, setFocused] = useState<boolean>(false);

  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
          component={InputLabel}
          gutterBottom
          htmlFor={id}
          variant="body2"
          whiteSpace="nowrap"
          {...labelProps}
          children={label}
          sx={{
            ...labelProps?.sx,
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
        />
      </Tooltip>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
        ) : (
          <Tooltip
            title={!readOnly ? null : t('readonly')}
            placement="bottom"
            arrow
            slotProps={{
              tooltip: { sx: { backgroundColor: theme.palette.primary.main } },
              arrow: { sx: { color: theme.palette.primary.main } }
            }}
          >
            <Autocomplete
              id={id}
              autoComplete
              disableClearable
              disabled={disabled}
              freeSolo
              fullWidth
              inputValue={value || ''}
              options={options}
              readOnly={readOnly}
              size="small"
              value={_value}
              onChange={(e, v) => setValue(v)}
              onInputChange={(e, v, o) => {
                setValue(v as AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>);
                onChange(e, v, o);

                const err = error(v);
                if (err) onError(err);
              }}
              onFocus={event => setFocused(document.activeElement === event.target)}
              onBlur={() => setFocused(false)}
              renderOption={(props, option) => (
                <Typography {...props} key={option} {...(tiny && { variant: 'body2' })}>
                  {option}
                </Typography>
              )}
              renderInput={params => (
                <TextField
                  id={id}
                  variant="outlined"
                  error={!!errorValue}
                  {...(readOnly && !disabled && { focused: null })}
                  {...params}
                  InputProps={{
                    ...params?.InputProps,
                    'aria-describedby': disabled || !(errorValue || helperText) ? null : `${id}-helper-text`,
                    placeholder: placeholder,
                    readOnly: readOnly,
                    startAdornment: startAdornment && (
                      <InputAdornment position="start">{startAdornment}</InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading || !reset || disabled || readOnly ? null : (
                          <InputAdornment position="end">
                            <ResetInput
                              id={id}
                              preventRender={loading || !reset || disabled || readOnly}
                              tiny={tiny}
                              onReset={onReset}
                              {...resetProps}
                            />
                          </InputAdornment>
                        )}
                        {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
                      </>
                    )
                  }}
                  sx={{
                    ...(tiny && {
                      '& .MuiInputBase-root': {
                        paddingTop: '2px !important',
                        paddingBottom: '2px !important',
                        fontSize: '14px'
                      }
                    }),
                    ...(readOnly &&
                      !disabled && {
                        '& .MuiInputBase-input': { cursor: 'default' },
                        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                        }
                      })
                  }}
                />
              )}
              {...autocompleteProps}
            />
          </Tooltip>
        )}
        <HelperText
          disabled={disabled}
          errorProps={errorProps}
          errorText={errorValue}
          helperText={helperText}
          helperTextProps={helperTextProps}
          id={id}
          label={label}
        />
      </FormControl>
    </div>
  );
};

export const TextInput = React.memo(WrappedTextInput);
