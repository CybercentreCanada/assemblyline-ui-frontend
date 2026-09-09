import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { alpha, styled, Tooltip, useTheme } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppLocation } from 'core/routes';
import {
  APP_CAROUSEL_ZOOM_CLASS,
  cycleAppCarouselBackgroundMode,
  getAppCarouselBackgroundColor,
  resetAppCarouselState
} from 'layout/carousel';
import type { Image } from 'models/base/result_body';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

const MenuPane = styled('div')(({ theme }) => ({
  position: 'absolute',
  maxWidth: 'calc(100% - 128px)',
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  alignItems: 'center',
  borderRadius: '0px 0px 4px 4px',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: '10vw',
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { marginTop: '-64px' }
}));

MenuPane.displayName = 'MenuPane';

const Info = styled('div')(({ theme }) => ({
  display: 'grid',
  alignContent: 'end',
  alignItems: 'stretch',
  gridTemplateColumns: 'auto 1fr',
  columnGap: theme.spacing(1),
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  '&:hover>div': { whiteSpace: 'wrap !important' },
  '&>div:nth-of-type(2n+1)': { fontWeight: 500 },
  '&>div:nth-of-type(2n)': {
    fontWeight: 400,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

Info.displayName = 'Info';

//*****************************************************************************************
// AppCarouselDetails
//*****************************************************************************************

export const AppCarouselDetails = memo(() => {
  const { t } = useTranslation(['carousel']);
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const isFileViewer = useAppLocation('at', 1)(s => s?.route?.startsWith('/file/viewer'));

  const backgroundMode = useAppInterfaceStore(s => s.carousel.backgroundMode);
  const images = useAppInterfaceStore(s => s.carousel.images);
  const index = useAppInterfaceStore(s => s.carousel.index);

  const currentImage = useMemo<Image | null>(() => images[index] ?? null, [images, index]);

  const handleClose = useCallback(() => {
    setInterfaceStore(store => resetAppCarouselState(store));
  }, [setInterfaceStore]);

  const handleBackgroundModeChange = useCallback(() => {
    setInterfaceStore(store => cycleAppCarouselBackgroundMode(store));
  }, [setInterfaceStore]);

  return (
    <MenuPane>
      <Info>
        <div>{t('name')}</div>
        <div>{currentImage?.name ?? null}</div>
        <div>{t('description')}</div>
        <div>{currentImage?.description ?? null}</div>
      </Info>
      <Tooltip title={t('view_file')} placement="bottom">
        <IconButton
          nav={nav =>
            isFileViewer
              ? nav.at(1).create({ route: '/file/viewer/:id/:tab', path: { id: currentImage?.img, tab: 'image' } })
              : nav
                  .at(Infinity)
                  .create({ route: '/file/viewer/:id/:tab', path: { id: currentImage?.img, tab: 'image' } })
          }
          color="inherit"
          style={{ marginLeft: '8px' }}
          onClick={handleClose}
        >
          <PageviewOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('change_background_color')} placement="bottom">
        <IconButton color="inherit" style={{ marginLeft: '8px' }} onClick={handleBackgroundModeChange}>
          <div
            style={{
              height: theme.spacing(2),
              width: theme.spacing(2),
              borderRadius: theme.spacing(0.5),
              backgroundColor:
                backgroundMode === 'transparent'
                  ? theme.palette.grey[500]
                  : getAppCarouselBackgroundColor(backgroundMode, theme)
            }}
          />
        </IconButton>
      </Tooltip>
    </MenuPane>
  );
});

AppCarouselDetails.displayName = 'AppCarouselDetails';
