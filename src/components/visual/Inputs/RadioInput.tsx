import type {
  FormControlLabelProps,
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Option = Omit<FormControlLabelProps, 'control'> & { control?: FormControlLabelProps['control'] };

export type RadioInputProps<O extends Option[] = []> = {
  disabled?: boolean;
  divider?: boolean;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: O[number]['value']) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  id?: string;
  label: string;
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
  startAdornment?: TextFieldProps['InputProps']['startAdornment'];
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: O[number]['value'];
  onChange?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: O[number]['value']) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedRadioInput = <O extends Option[] = []>({
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
  divider = false,
  options = null,
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
  onChange = () => null,
  onReset = () => null,
  onError = () => null
}: RadioInputProps<O>) => {
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
      <FormControl
        size="small"
        fullWidth
        sx={{ ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }) }}
      >
        <Tooltip
          title={!readOnly ? null : t('readonly')}
          placement="bottom"
          arrow
          slotProps={{
            tooltip: { sx: { backgroundColor: theme.palette.primary.main } },
            arrow: { sx: { color: theme.palette.primary.main } }
          }}
        >
          <RadioGroup value={value}>
            {options.map(({ value, label }, key) => (
              <Button
                key={`${key}-${label}`}
                color="inherit"
                disabled={loading || disabled || readOnly}
                fullWidth
                size="small"
                onClick={event => {
                  event.stopPropagation();
                  event.preventDefault();
                  onChange(event, value);

                  const err = error(!value);
                  if (err) onError(err);
                }}
                onFocus={event => setFocused(document.activeElement === event.target)}
                onBlur={() => setFocused(false)}
                sx={{
                  justifyContent: 'start',
                  color: 'inherit',
                  textTransform: 'none',
                  height: '40px',
                  paddingLeft: theme.spacing(2),

                  ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
                  ...(tiny && { height: 'auto' })
                }}
              >
                <FormControlLabel
                  value={value}
                  control={
                    loading ? (
                      <div>
                        <Skeleton
                          variant="circular"
                          sx={{
                            height: '24px',
                            width: '24px',
                            marginLeft: theme.spacing(0.75),
                            marginRight: theme.spacing(1.25)
                          }}
                        />
                      </div>
                    ) : (
                      <Radio
                        disableFocusRipple
                        disableRipple
                        disableTouchRipple
                        size="small"
                        sx={{
                          ...(tiny && { paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25) }),
                          ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                        }}
                      />
                    )
                  }
                  disabled={loading || disabled || readOnly}
                  label={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: theme.spacing(1)
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {label}
                      </span>
                      {endAdornment}
                    </div>
                  }
                  slotProps={{
                    typography: {
                      color: !disabled && errorValue ? 'error' : 'textPrimary',
                      marginLeft: theme.spacing(1.25),
                      overflow: 'hidden',
                      textAlign: 'start',
                      textOverflow: 'ellipsis',
                      variant: 'body2',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
                      ...labelProps
                    }
                  }}
                  sx={{
                    overflow: 'hidden',
                    ...(!(loading || !reset || disabled || readOnly) && { paddingRight: theme.spacing(2) })
                  }}
                />
              </Button>
            ))}
          </RadioGroup>
        </Tooltip>

        <HelperText
          disabled={disabled}
          errorProps={errorProps}
          errorText={errorValue}
          helperText={helperText}
          helperTextProps={helperTextProps}
          id={id}
          label={label}
        />

        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <ResetInput
            id={id}
            preventRender={loading || !reset || disabled || readOnly}
            tiny={tiny}
            onReset={onReset}
            {...resetProps}
          />
        </div>
      </FormControl>
    </div>
  );
};

export const RadioInput = React.memo(WrappedRadioInput);
