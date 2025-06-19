import type {
  AutocompleteChangeReason,
  AutocompleteProps,
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
import CustomChip from 'components/visual/CustomChip';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import type { ElementType } from 'react';
import React, { useMemo, useState } from 'react';

export type ChipsInputProps<
  Value extends string[] = string[],
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'isOptionEqualToValue' | 'renderInput' | 'options' | 'onChange' | 'value'
> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string[]) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  isOptionEqualToValue?: (option: string, value: string) => boolean;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  monospace?: boolean;
  options?: string[];
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
  value: string[];
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: string[], reason: AutocompleteChangeReason) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedChipsInput = <
  Value extends string[] = string[],
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
  isOptionEqualToValue = null,
  label: labelProp = null,
  labelProps,
  loading = false,
  monospace = false,
  options = [],
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  reset = false,
  resetProps = null,
  rootProps = null,
  startAdornment = null,
  tiny = false,
  tooltip = null,
  tooltipProps = null,
  value,
  onBlur = () => null,
  onChange = () => null,
  onError = () => null,
  onFocus = () => null,
  onReset = () => null,
  ...autocompleteProps
}: ChipsInputProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

  const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
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
          <Autocomplete
            id={id}
            freeSolo
            multiple
            size="small"
            value={value}
            options={options}
            disabled={disabled}
            readOnly={readOnly}
            isOptionEqualToValue={isOptionEqualToValue ?? ((option, value) => option === value)}
            onChange={(e, v: string[], p) => {
              onChange(e, v, p);

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
            renderInput={params => (
              <TextField
                {...params}
                id={id}
                variant="outlined"
                error={!!errorValue}
                placeholder={placeholder}
                {...(readOnly && !disabled && { focused: null })}
                slotProps={{
                  input: {
                    ...params?.InputProps,
                    ...(reset && { style: { paddingRight: '85px' } }),
                    'aria-describedby': disabled || !(errorValue || helperText) ? null : `${id}-helper-text`,
                    startAdornment: (
                      <>
                        {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
                        {params?.InputProps?.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
                        {loading || !reset || disabled || readOnly ? null : (
                          <InputAdornment
                            position="end"
                            sx={{
                              position: 'absolute',
                              right: '37px',
                              top: '50%',
                              transform: 'translate(0, -50%)',
                              ...(!focused && { visibility: 'hidden' })
                            }}
                            style={{ display: 'hidden' }}
                          >
                            <ResetInput
                              id={id}
                              preventRender={loading || !reset || disabled || readOnly}
                              tiny={tiny}
                              onReset={onReset}
                              {...resetProps}
                            />
                          </InputAdornment>
                        )}
                        {params?.InputProps?.endAdornment}
                      </>
                    )
                  }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    ...(tiny && {
                      paddingTop: '2px !important',
                      paddingBottom: '2px !important',
                      fontSize: '14px'
                    }),
                    ...(readOnly && !disabled && { cursor: 'default' })
                  },

                  '& .MuiInputBase-input': {
                    ...(readOnly && !disabled && { cursor: 'default' }),
                    ...(monospace && { fontFamily: 'monospace' })
                  },

                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    ...(readOnly &&
                      !disabled && {
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                      })
                  }
                }}
              />
            )}
            renderValue={(values: string[], getItemProps) =>
              values.map((option: string, index: number) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <CustomChip
                    key={key}
                    label={option}
                    {...itemProps}
                    onDelete={disabled ? undefined : itemProps.onDelete}
                    sx={{
                      ...(readOnly &&
                        !disabled && {
                          cursor: 'default'
                        })
                    }}
                  />
                );
              })
            }
            {...(autocompleteProps as unknown as object)}
          />
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

export const ChipsInput: <
  Value extends string[] = string[],
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
>(
  props: ChipsInputProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
) => React.ReactNode = React.memo(WrappedChipsInput);
