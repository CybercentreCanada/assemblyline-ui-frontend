import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type ResetListInputProps = Omit<IconButtonProps, 'id' | 'onChange'> & {
  defaultValue: unknown;
  id: string;
  preventRender: boolean;
  tiny?: boolean;
  onChange: (event: React.SyntheticEvent) => void;
  onReset: IconButtonProps['onClick'];
};

export const ResetListInput: FC<ResetListInputProps> = ({
  defaultValue,
  id = null,
  preventRender = false,
  tiny = false,
  onChange = () => null,
  onReset = null,
  ...buttonProps
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const title = useMemo<React.ReactNode>(
    () =>
      defaultValue === undefined ? null : (
        <>
          <span style={{ color: theme.palette.text.secondary }}>{t('reset_to')}</span>
          <span>
            {typeof defaultValue === 'object'
              ? JSON.stringify(defaultValue)
              : typeof defaultValue === 'string'
                ? `"${defaultValue}"`
                : `${defaultValue}`}
          </span>
        </>
      ),
    [defaultValue, t, theme.palette.text.secondary]
  );

  return preventRender ? null : (
    <Tooltip arrow title={title} placement="bottom">
      <IconButton
        aria-label={`refresh ${id}`}
        type="reset"
        color="secondary"
        children={<RefreshOutlinedIcon fontSize="small" />}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset ? onReset(event) : onChange(event as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>);
        }}
        {...buttonProps}
        sx={{ ...(tiny && { padding: theme.spacing(0.5) }), ...buttonProps?.sx }}
      />
    </Tooltip>
  );
};
