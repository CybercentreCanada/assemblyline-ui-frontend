import LockOutlineIcon from '@mui/icons-material/LockOutline';
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
import { useTranslation } from 'react-i18next';

export type ChipsInputProps<
  Value extends string[] = string[],
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput' | 'options' | 'onChange' | 'value'
> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string[]) => string;
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
}: ChipsInputProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
          <Autocomplete
            id={id}
            freeSolo
            multiple
            size="small"
            value={value}
            options={options}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e, v: string[], p) => {
              onChange(e, v, p);

              const err = error(v);
              if (err) onError(err);
            }}
            onFocus={event => setFocused(document.activeElement === event.target)}
            onBlur={() => setFocused(false)}
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
                        {readOnly && (
                          <Tooltip
                            title={!readOnly ? null : t('readonly')}
                            placement="bottom"
                            arrow
                            slotProps={{
                              tooltip: { sx: { backgroundColor: theme.palette.primary.main } },
                              arrow: { sx: { color: theme.palette.primary.main } }
                            }}
                          >
                            <InputAdornment position="start" sx={{ marginRight: '0px' }}>
                              <LockOutlineIcon color="disabled" />
                            </InputAdornment>
                          </Tooltip>
                        )}
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
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                      }
                    })
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

export const ChipsInput = React.memo(WrappedChipsInput);
