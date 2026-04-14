import { Close, DragIndicator, KeyboardCommandKey, ZoomInMap } from '@mui/icons-material';
import { Fade, IconButton, Paper, Popper, Tooltip, useTheme } from '@mui/material';

import { useSnackbar } from 'notistack';
import React, {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MODULE_NAME } from '../name';

type AppFocusControlProps = {
  quicknav: boolean;
  focus: boolean;
  focusctrl: { open: boolean; flexDirection: 'row' | 'column' };
  setQuicknav: Dispatch<SetStateAction<boolean>>;
  setFocus: Dispatch<SetStateAction<boolean>>;
  setFocusctrl: Dispatch<SetStateAction<{ open: boolean; flexDirection: 'row' | 'column' }>>;
};

export const AppFocusControl: FC<AppFocusControlProps> = ({ focusctrl, setQuicknav, setFocus, setFocusctrl }) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<{ x: number; y: number }>(null);

  const theme = useTheme();

  const { t } = useTranslation(MODULE_NAME);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [moving, setMoving] = useState<boolean>(false);

  const onDismissClick = useCallback(() => {
    setFocusctrl(_focusctrl => ({ ..._focusctrl, open: false }));

    enqueueSnackbar(<Trans i18nKey="focusmode.snackbar.2" ns={MODULE_NAME} />, {
      key: 'snack.2',
      variant: 'info',
      autoHideDuration: 8000,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center'
      },
      SnackbarProps: {
        onClick: () => {
          closeSnackbar('snack.2');
        }
      }
    });
  }, [enqueueSnackbar, closeSnackbar, setFocusctrl]);

  const onExitClick = useCallback(() => {
    setFocus(false);
  }, [setFocus]);

  const onMouseDown = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = paperRef.current.getBoundingClientRect();
    offsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    setMoving(true);
  }, []);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const rect = paperRef.current.getBoundingClientRect();

      // Boundaries.
      const boundTop = 10;
      const boundRight = window.innerWidth - rect.width - 10;
      const boundBottom = window.innerHeight - rect.height - 10;
      const boundLeft = 10;

      // flex direction change zone boundaries.
      const zxMargin = window.innerWidth * 0.2;
      const zyMargin = window.innerHeight * 0.2;
      const zxLeft = window.innerWidth * 0.5 - zxMargin;
      const zxRight = window.innerWidth * 0.5 + zxMargin;
      const zyTop = window.innerHeight * 0.5 - zyMargin;
      const zyBottom = window.innerHeight * 0.5 + zyMargin;

      //  Detect if the element is within the flex direction change boundaries.
      if (event.clientX <= boundLeft || event.clientX >= boundRight) {
        if (event.clientY >= zyTop && event.clientY <= zyBottom) {
          setFocusctrl({ ...focusctrl, flexDirection: 'column' });
        }
      } else if (event.clientY <= boundTop || event.clientY >= boundBottom) {
        if (event.clientX >= zxLeft && event.clientX <= zxRight) {
          setFocusctrl({ ...focusctrl, flexDirection: 'row' });
        }
      }

      // account for the position of click within the element.
      // prevents element jump to mouse position on first move.
      const clientX = event.clientX - offsetRef.current.x;
      const clientY = event.clientY - offsetRef.current.y;

      // Stay in bound.
      const left = clientX <= boundLeft ? boundLeft : clientX >= boundRight ? boundRight : clientX;
      const top = clientY <= boundTop ? boundTop : clientY >= boundBottom ? boundBottom : clientY;

      // Move it using straight css update to prevent state changes.
      const position = { left, top };
      paperRef.current.style.left = `${position.left}px`;
      paperRef.current.style.top = `${position.top}px`;
      paperRef.current.style.bottom = 'unset';
      paperRef.current.style.transform = 'unset';
    },
    [focusctrl, setFocusctrl]
  );

  const onMouseUp = useCallback(() => {
    setMoving(false);
    offsetRef.current = null;
  }, []);

  const tooltipPopperProps = useMemo(
    () => ({
      sx: { zIndex: theme.zIndex.tui.superOverlay + 1 },
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: focusctrl.flexDirection === 'row' ? ['top', 'bottom'] : ['left', 'right'] // only try these if preferred placement doesn't fit
          }
        }
      ]
    }),
    [theme, focusctrl]
  );

  useEffect(() => {
    if (moving) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [moving, onMouseMove, onMouseUp]);

  return (
    <Popper
      keepMounted
      ref={paperRef}
      open={focusctrl.open}
      style={{
        position: 'fixed',
        top: 'unset',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: theme.zIndex.tui.superOverlay
      }}
      transition
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={4}
            sx={{
              display: 'flex',
              flexDirection: focusctrl.flexDirection,
              pl: focusctrl.flexDirection === 'row' ? 4 : 1,
              pr: focusctrl.flexDirection === 'row' ? 4 : 1,
              pt: focusctrl.flexDirection === 'row' ? 1 : 4,
              pb: focusctrl.flexDirection === 'row' ? 1 : 4,
              alignItems: 'center',
              gap: 3,
              borderRadius: 9999
            }}
          >
            <Tooltip
              title={t('focusmode.toolitp.draghandle')}
              slotProps={{
                popper: tooltipPopperProps
              }}
            >
              <IconButton
                onMouseDown={onMouseDown}
                sx={{ mr: focusctrl.flexDirection === 'row' ? 3 : 0, mb: focusctrl.flexDirection === 'column' ? 3 : 0 }}
                color="primary"
              >
                <DragIndicator className="drag-handle" style={{ cursor: 'move' }} />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={t('focusmode.tooltip.exit')}
              slotProps={{
                popper: tooltipPopperProps
              }}
            >
              <IconButton key="exit" onClick={onExitClick} color="default">
                <ZoomInMap />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={t('quick.command.enter.tooltip')}
              slotProps={{
                popper: tooltipPopperProps
              }}
            >
              <IconButton key="explore" onClick={() => setQuicknav(true)} color="default">
                <KeyboardCommandKey />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={t('focusmode.tooltip.dismiss')}
              slotProps={{
                popper: tooltipPopperProps
              }}
            >
              <IconButton key="dismiss" onClick={onDismissClick} color="default">
                <Close />
              </IconButton>
            </Tooltip>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};
