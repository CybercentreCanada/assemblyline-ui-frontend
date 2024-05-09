/* eslint-disable no-unused-vars */
import { Clear, Search } from '@mui/icons-material';
import type { InputBaseProps } from '@mui/material';
import { CircularProgress, IconButton, InputAdornment, InputBase, Stack, Typography } from '@mui/material';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppSearchInputProps = {
  searching?: boolean;
  provided?: boolean;
  focused?: boolean;
  showToggle?: boolean;
  showClear?: boolean;
  open?: boolean;
  minWidth?: string | number;
  maxWidth?: string | number;
  onClear: () => void;
} & InputBaseProps;

const AppSearchInput = ({
  searching,
  provided,
  focused,
  autoFocus,
  showToggle,
  showClear,
  value,
  open,
  maxWidth = '100%',
  minWidth = '100%',
  onBlur,
  onClear,
  onFocus,
  onChange,
  onKeyDown,
  ...inputProps
}: AppSearchInputProps) => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>();

  // CTRL+K button click handler.
  // Decicde whether to open search in normal or fullscreen/modal mode.
  const onToggleClick = useCallback(() => {
    rootRef.current.querySelector('input').focus();
  }, []);

  return (
    <Stack direction="row" justifyContent="flex-end" flexGrow={2} ref={rootRef}>
      <InputBase
        {...inputProps}
        fullWidth
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={t('quicksearch.placeholder')}
        inputProps={{ 'aria-label': t('quicksearch.aria') }}
        startAdornment={
          <InputAdornment position="start" sx={theme => ({ color: theme.palette.text.disabled })}>
            {searching ? <CircularProgress size={24} color="inherit" /> : <Search color="inherit" />}
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end" sx={theme => ({ color: theme.palette.text.disabled })}>
            {showToggle && !focused && (
              <Typography
                variant="button"
                color="inherit"
                sx={{ fontSize: 'small', marginRight: '8px' }}
                onClick={onToggleClick}
              >
                CTRL+K
              </Typography>
            )}
            {showClear && (
              <IconButton color="inherit" onClick={onClear} disabled={!value}>
                <Clear />
              </IconButton>
            )}
          </InputAdornment>
        }
        sx={theme => ({
          color: theme.palette.text.secondary,
          paddingTop: 0.5,
          paddingBottom: 0.5,
          paddingLeft: 1.5,
          paddingRight: 1,
          maxWidth: maxWidth,
          minWidth: minWidth,
          borderRadius: theme.spacing(0.5)
        })}
      />
    </Stack>
  );
};

export default memo(AppSearchInput);
