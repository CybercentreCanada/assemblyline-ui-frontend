import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ResetInputProps<T> = Omit<IconButtonProps, 'id' | 'onChange'> & {
  id: string;
  preventRender?: boolean;
  tiny?: boolean;
  value: T;
  onChange?: (event: React.SyntheticEvent, value: T) => void;
};

export const ResetInput = React.memo(
  <T,>({
    id = null,
    preventRender = false,
    tiny = false,
    value = null,
    onChange,
    ...buttonProps
  }: ResetInputProps<T>) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return preventRender ? null : (
      <Tooltip title={`${t('reset_to')}${typeof value === 'string' ? `"${value}"` : value}`}>
        <IconButton
          aria-label={`refresh ${id}`}
          type="reset"
          color="secondary"
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onChange(event, value);
          }}
          {...buttonProps}
          sx={{
            padding: theme.spacing(0.5),
            ...(tiny && { paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25) }),
            ...buttonProps?.sx
          }}
        >
          <RefreshOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }
) as <T>(props: ResetInputProps<T>) => React.ReactNode;
