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

import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppSearchInputProps = {
  searching?: boolean;
  provided?: boolean;
  showToggle?: boolean;
  open?: boolean;
  onClear: () => void;
  onToggleFullscreen: () => void;
} & InputBaseProps;

const AppSearchInput = ({
  searching,
  provided,
  autoFocus,
  showToggle,
  value,
  open,
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
    <Stack direction="row" ref={rootRef}>
      <InputBase
        {...inputProps}
        fullWidth
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y/no-autofocus
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
              <Tooltip title={t(open && provided ? 'app.search.fullscreen' : 'app.search.shortcut')}>
                <Button size="small" color="inherit" onClick={onToggleClick}>
                  CTRL+K
                </Button>
              </Tooltip>
            )}
            <IconButton color="inherit" onClick={onClear}>
              <Clear />
            </IconButton>
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
