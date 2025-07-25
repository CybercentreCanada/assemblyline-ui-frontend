import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import type { useInputState } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import { useTranslation } from 'react-i18next';

export type ResetInputProps<T, P> = {
  props: InputProps<T>;
  state: ReturnType<typeof useInputState<T, P>>;
};

export const ResetInput = <T, P>({ props, state }: ResetInputProps<T, P>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { id, preventResetRender } = state;
  const { defaultValue = undefined, tiny = false, resetProps, onChange = () => null, onReset = null } = props;

  return preventResetRender ? null : (
    <Tooltip
      arrow
      title={
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
        )
      }
    >
      <IconButton
        aria-label={`${id}-reset`}
        type="reset"
        color="secondary"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset ? onReset(event) : onChange(event, defaultValue);
        }}
        {...resetProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...resetProps?.sx
        }}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
