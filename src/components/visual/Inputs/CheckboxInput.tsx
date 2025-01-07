import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import type { ButtonProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { Button, Skeleton, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import type { ExpendInputProps } from './components/ExpendInput';
import { ExpendInput } from './components/ExpendInput';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  disableGap?: boolean;
  expend?: boolean;
  expendProps?: ExpendInputProps;
  indeterminate?: boolean;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: boolean;
  onExpend?: IconButtonProps['onClick'];
  onChange?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLButtonElement>,
    value: boolean
  ) => void;
  onReset?: IconButtonProps['onClick'];
};

export const CheckboxInput: React.FC<Props> = React.memo(
  ({
    disabled = false,
    disableGap = false,
    expend = null,
    expendProps = null,
    id = null,
    indeterminate = false,
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
    onExpend = () => null,
    onChange = () => null,
    onReset = () => null,
    ...buttonProps
  }: Props) => {
    const theme = useTheme();

    return preventRender ? null : (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 'auto' }}>
        <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
          <Button
            type="submit"
            color="inherit"
            disabled={loading || disabled}
            fullWidth
            onClick={event => onChange(event, !value)}
            sx={{ padding: 0, justifyContent: 'flex-start', columnGap: theme.spacing(1), textTransform: 'none' }}
            {...buttonProps}
          >
            {loading ? (
              <div>
                <Skeleton variant="circular" sx={{ height: '26px', width: '26px', margin: '6px' }} />
              </div>
            ) : value === true ? (
              <CheckBoxIcon
                id={id || label}
                color={disabled ? 'inherit' : 'primary'}
                fontSize="small"
                sx={{ margin: '0px 9px' }}
              />
            ) : indeterminate === true ? (
              <IndeterminateCheckBoxIcon
                id={id || label}
                color={disabled ? 'inherit' : 'primary'}
                fontSize="small"
                sx={{ margin: '0px 9px' }}
              />
            ) : (
              <CheckBoxOutlineBlankIcon id={id || label} fontSize="small" sx={{ margin: '0px 9px' }} />
            )}

            {!disableGap && <div style={{ width: theme.spacing(1) }} />}

            <Typography
              component="label"
              htmlFor={id || label}
              margin="9px 0px"
              overflow="hidden"
              textAlign="start"
              textOverflow="ellipsis"
              variant="body2"
              whiteSpace="nowrap"
              width="100%"
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
            {expend !== null && <div style={{ width: '40px' }} />}
          </Button>
        </Tooltip>

        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0 }}>
          <ResetInput
            id={id || label}
            preventRender={loading || !reset || disabled}
            onReset={onReset}
            {...resetProps}
          />
          <ExpendInput id={id || label} open={expend} onExpend={onExpend} {...expendProps} />
        </div>
      </div>
    );
  }
);
