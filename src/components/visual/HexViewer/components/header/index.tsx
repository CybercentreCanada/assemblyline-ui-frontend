import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import { Paper, useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import type { StoreProps } from 'components/visual/HexViewer';
import { HexSearchBar, HexSearchTypes, TooltipIconButton, useDispatch } from 'components/visual/HexViewer';
import type { PropsWithChildren } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

export * from './cursorButton';
export * from './searchbar';
export * from './searchButtons';
export * from './searchIndex';
export * from './searchTypes';

const WrappedHexDesktopHeader = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const { onLocationShare, onSettingOpen, onBodyMouseLeave } = useDispatch();
  const toolbarRef = React.useRef(null);

  return (
    <div
      ref={toolbarRef}
      onMouseEnter={() => onBodyMouseLeave()}
      style={{
        paddingBottom: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Paper
        component="form"
        elevation={2}
        sx={{
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#484848' : '#FAFAFA'
          }
        }}
      >
        <HexSearchTypes store={store} />
        <HexSearchBar store={store} />
        <Divider orientation="vertical" sx={{ height: '28px', margin: '4px' }} />
        <TooltipIconButton title={t('share')} onClick={() => onLocationShare()} icon={<ShareIcon />} />
        <TooltipIconButton title={t('settings.label')} onClick={() => onSettingOpen()} icon={<SettingsIcon />} />
      </Paper>
    </div>
  );
};

const HexDesktopHeader = React.memo(WrappedHexDesktopHeader);

const HexHeaderSelector = memo(({ store }: StoreProps) => {
  return <HexDesktopHeader store={store} />;
});

export const HexHeader = memo(
  ({ store }: StoreProps) => <HexHeaderSelector store={store} />,
  (prevProps: Readonly<PropsWithChildren<StoreProps>>, nextProps: Readonly<PropsWithChildren<StoreProps>>) =>
    prevProps.store.cursor.index === nextProps.store.cursor.index &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.mode.toolbar === nextProps.store.mode.toolbar &&
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.search.mode === nextProps.store.search.mode &&
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.selectedResult === nextProps.store.search.selectedResult &&
    prevProps.store.search.results === nextProps.store.search.results
);

export default HexHeader;
