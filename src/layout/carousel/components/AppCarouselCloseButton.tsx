import CloseIcon from '@mui/icons-material/Close';
import { alpha, Tooltip, useTheme } from '@mui/material';
import { useAppSetInterfaceStore } from 'core/interface';
import { resetAppCarouselState } from 'layout/carousel';
import { memo, useCallback } from 'react';
import { IconButton } from 'ui/buttons/IconButton';

//*****************************************************************************************
// AppCarouselCloseButton
//*****************************************************************************************

export const AppCarouselCloseButton = memo(() => {
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const handleClose = useCallback(() => {
    setInterfaceStore(store => resetAppCarouselState(store));
  }, [setInterfaceStore]);

  return (
    <div
      style={{
        margin: theme.spacing(1),
        borderRadius: theme.spacing(3),
        backgroundColor: alpha(theme.palette.background.paper, 0.7)
      }}
    >
      <Tooltip title="Close" placement="right">
        <IconButton onClick={handleClose} size="large">
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
});

AppCarouselCloseButton.displayName = 'AppCarouselCloseButton';
