import type {
  ButtonProps,
  FormHelperTextProps,
  IconButtonProps,
  SwitchProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { Button, FormHelperText, Skeleton, Switch, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  disableGap?: boolean;
  error?: (value: boolean) => string;
  errorProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: SwitchProps['checked'];
  onChange?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLButtonElement>,
    value: boolean
  ) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const SwitchInput: React.FC<Props> = React.memo(
  ({
    disabled = false,
    disableGap = false,
    error = () => null,
    errorProps = null,
    id = null,
    label = null,
    labelProps = null,
    loading = false,
    preventDisabledColor = false,
    preventRender = false,
    reset = false,
    resetProps = null,
    tooltip = null,
    tooltipProps = null,
    value = false,
    onChange = () => null,
    onReset = () => null,
    onError = () => null,
    ...buttonProps
  }: Props) => {
    const theme = useTheme();

    const errorValue = useMemo<string>(() => error(value), [error, value]);

    return preventRender ? null : (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
          <Button
            color="inherit"
            disabled={loading || disabled}
            fullWidth
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              onChange(event, !value);

              const err = error(!value);
              if (err) onError(err);
            }}
            sx={{ padding: 0, justifyContent: 'flex-start', columnGap: theme.spacing(1), textTransform: 'none' }}
            {...buttonProps}
          >
            {loading ? (
              <>
                <div>
                  <Skeleton variant="circular" sx={{ height: '26px', width: '26px', margin: '6px' }} />
                </div>

                {!disableGap && <div style={{ width: theme.spacing(1) }} />}
              </>
            ) : (
              <>
                <Switch
                  id={id || label}
                  checked={value}
                  size="small"
                  disabled={disabled}
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onChange(event, !value);

                    const err = error(!value);
                    if (err) onError(err);
                  }}
                />
                {!disableGap && <div style={{ width: theme.spacing(0.75) }} />}
              </>
            )}

            <Typography
              component="label"
              htmlFor={id || label}
              color={!disabled && errorValue ? 'error' : 'textPrimary'}
              margin="9px 0px"
              overflow="hidden"
              textAlign="start"
              textOverflow="ellipsis"
              variant="body2"
              whiteSpace="nowrap"
              width="100%"
              onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                event.stopPropagation();
                event.preventDefault();
                onChange(event, !value);

                const err = error(!value);
                if (err) onError(err);
              }}
              sx={{
                ...(!disabled && !loading && { cursor: 'pointer' }),
                ...(loading && {
                  color: theme.palette.text.primary
                }),
                ...(disabled &&
                  !preventDisabledColor && {
                    WebkitTextFillColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
                  })
              }}
              {...labelProps}
            >
              {label}
            </Typography>

            {!(loading || !reset || disabled) && <div style={{ width: '40px' }} />}
          </Button>
        </Tooltip>

        {!errorValue || disabled ? null : (
          <FormHelperText
            sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
            variant="outlined"
            {...errorProps}
          >
            {errorValue}
          </FormHelperText>
        )}

        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0 }}>
          <ResetInput
            id={id || label}
            preventRender={loading || !reset || disabled}
            onReset={onReset}
            {...resetProps}
          />
        </div>
      </div>
    );
  }
);
