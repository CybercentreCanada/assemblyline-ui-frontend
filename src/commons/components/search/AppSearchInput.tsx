import { Clear, Search } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  InputBase,
  InputBaseProps,
  Stack,
  Typography
} from '@mui/material';

import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppSearchInputProps = {
  searching?: boolean;
  provided?: boolean;
  showToggle?: boolean;
  showClear?: boolean;
  open?: boolean;
  onClear: () => void;
} & InputBaseProps;

const AppSearchInput = ({
  searching,
  provided,
  autoFocus,
  showToggle,
  showClear,
  value,
  open,
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
    <Stack direction="row" ref={rootRef}>
      <InputBase
        {...inputProps}
        fullWidth
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
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
            {showToggle && (
              <Typography variant="button" color="inherit" sx={{ fontSize: 'small' }} onClick={onToggleClick}>
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
          width: '100%',
          paddingTop: 0.5,
          paddingBottom: 0.5,
          paddingLeft: 1.5,
          paddingRight: 1,
          borderTopLeftRadius: theme.spacing(0.5),
          borderTopRightRadius: theme.spacing(0.5),
          borderBottomLeftRadius: open ? 0 : theme.spacing(0.5),
          borderBottomRightRadius: open ? 0 : theme.spacing(0.5)
        })}
      />
    </Stack>
  );
};

export default memo(AppSearchInput);
