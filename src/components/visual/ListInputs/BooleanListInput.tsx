import type { FormHelperTextProps, IconButtonProps, ListItemButtonProps, ListItemTextProps } from '@mui/material';
import { FormHelperText, Switch, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { BaseListItemButton, BaseListItemText } from './components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<ListItemButtonProps, 'defaultValue' | 'onChange' | 'onClick' | 'value'> & {
  capitalize?: boolean;
  error?: (value: boolean) => string;
  errorProps?: FormHelperTextProps;
  loading?: boolean;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: boolean;
  onChange?: (event: React.FormEvent<HTMLDivElement>, value: boolean) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedBooleanListInput = ({
  capitalize = false,
  disabled = false,
  error = () => null,
  errorProps = null,
  id = null,
  loading = false,
  preventRender = false,
  primary,
  primaryProps = null,
  readOnly = false,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...buttonProps
}: Props) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItemButton
      disabled={disabled || readOnly || loading}
      onClick={event => {
        event.stopPropagation();
        event.preventDefault();
        onChange(event, !value);

        const err = error(!value);
        if (err) onError(err);
      }}
      sx={((readOnly && !disabled) || loading) && { '&.Mui-disabled': { opacity: 1 } }}
      {...buttonProps}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%', columnGap: theme.spacing(1) }}>
          <BaseListItemText
            id={id}
            primary={primary}
            secondary={secondary}
            primaryTypographyProps={primaryProps}
            secondaryTypographyProps={secondaryProps}
            capitalize={capitalize}
          />
          {loading ? (
            <SkeletonListInput />
          ) : (
            <>
              <ResetListInput
                id={id || primary}
                preventRender={!reset || disabled || readOnly}
                onReset={onReset}
                {...resetProps}
              />
              <Switch checked={value} edge="end" inputProps={{ id: id || primary }} />
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, width: '100%' }}>
          {!errorValue || disabled || loading || readOnly ? null : (
            <FormHelperText
              sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
              variant="outlined"
              {...errorProps}
            >
              {errorValue}
            </FormHelperText>
          )}
        </div>
      </div>
    </BaseListItemButton>
  );
};

export const BooleanListInput = React.memo(WrappedBooleanListInput);
