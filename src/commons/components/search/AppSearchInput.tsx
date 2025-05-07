import { Clear, Search } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  InputBase,
  type InputBaseProps,
  Stack,
  Tooltip
} from '@mui/material';

import type { CSSProperties } from 'react';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppSearchInputProps = {
  searching?: boolean;
  provided?: boolean;
  focused?: boolean;
  showToggle?: boolean;
  showClear?: boolean;
  open?: boolean;
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
  onClear: () => void;
  onToggleFullscreen: () => void;
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
  onToggleFullscreen,
  onFocus,
  onChange,
  onKeyDown,
  ...inputProps
}: AppSearchInputProps) => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(undefined);

  // CTRL+K button click handler.
  // Decicde whether to open search in normal or fullscreen/modal mode.
  const onToggleClick = useCallback(() => {
    if (open && provided) {
      onToggleFullscreen();
    } else {
      rootRef.current.querySelector('input').focus();
    }
  }, [open, provided, onToggleFullscreen]);

  return (
    <Stack direction="row" justifyContent="flex-end" flexGrow={2} ref={rootRef}>
      <InputBase
        {...inputProps}
        fullWidth
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y/no-autofocus
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
              <Tooltip title={t(open && provided ? 'app.search.fullscreen' : 'app.search.shortcut')}>
                <Button
                  size="small"
                  color="inherit"
                  onClick={onToggleClick}
                  sx={{ fontSize: 'small', marginRight: '8px', padding: 0, minWidth: 'auto' }}
                >
                  CTRL+K
                </Button>
              </Tooltip>
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
