import { makeStyles, Paper } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import SettingsIcon from '@material-ui/icons/Settings';
import ShareIcon from '@material-ui/icons/Share';
import React, { memo, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { HexSearchBar, HexSearchTypes, StoreProps, TooltipIconButton, useDispatch } from '../..';

export * from './cursorButton';
export * from './searchbar';
export * from './searchButtons';
export * from './searchIndex';
export * from './searchTypes';

const useHexStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  },
  toolbar: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

const WrappedHexDesktopHeader = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();

  const { onLocationShare, onSettingOpen, onBodyMouseLeave } = useDispatch();
  const toolbarRef = React.useRef(null);

  return (
    <div className={classes.root} ref={toolbarRef} onMouseEnter={() => onBodyMouseLeave()}>
      <Paper component="form" className={classes.toolbar}>
        <HexSearchTypes store={store} />
        <HexSearchBar store={store} />
        <Divider className={classes.divider} orientation="vertical" />
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
