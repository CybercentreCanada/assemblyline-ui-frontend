import { ClickAwayListener, Fade, makeStyles, Paper, Popper, useTheme } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import NavigationIcon from '@material-ui/icons/Navigation';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import { isEscape } from 'commons/addons/elements/utils/keyboard';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchType, StoreProps, useDispatch } from '../..';
import { TooltipIconButton } from '../../commons/components';

const useStyles = makeStyles(theme => ({
  popper: {
    zIndex: theme.zIndex.appBar + 200,
    minWidth: '280px',
    marginTop: '16px',
    padding: theme.spacing(0),
    backgroundColor: theme.palette.background.paper
  },
  avatarButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  iconButton: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      width: theme.spacing(4),
      height: theme.spacing(4)
    }
  },
  searchPaper: {
    marginTop: '16px',
    padding: theme.spacing(0),
    minWidth: '200px',
    backgroundColor: theme.palette.background.paper
  }
}));

export const WrappedHexSearchTypes = ({ store }: StoreProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation(['hexViewer']);
  const { onSearchTypeChange } = useDispatch();
  const { type } = store.search;

  const handleClick = useCallback(
    (_type: SearchType) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onSearchTypeChange({ type: _type });
      setIsPopperOpen(false);
      setPopperAnchorEl(null);
    },
    [onSearchTypeChange]
  );

  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPopperAnchorEl(event.currentTarget);
    setIsPopperOpen(true);
  }, []);

  const handleClickAway = useCallback((event: React.MouseEvent<Document, MouseEvent>) => {
    setIsPopperOpen(false);
    setPopperAnchorEl(null);
  }, []);

  const handleCloseKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEscape(event.key)) return;
    setIsPopperOpen(false);
    setPopperAnchorEl(null);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <>
        <TooltipIconButton
          title={t('search.types')}
          size="small"
          icon={
            type === 'cursor' ? (
              <NavigationIcon />
            ) : type === 'hex' ? (
              <ExposureZeroIcon />
            ) : type === 'text' ? (
              <TextFieldsIcon />
            ) : null
          }
          disabled={false}
          onClick={handleOpen}
        />
        <Popper
          open={isPopperOpen}
          anchorEl={popperAnchorEl}
          className={classes.popper}
          placement="bottom-start"
          disablePortal={true}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ padding: theme.spacing(1) }} elevation={4} onKeyDown={handleCloseKeyDown}>
                <List component="nav" aria-label="main mailbox folders" dense disablePadding>
                  <ListItem button selected={type === 'cursor'} onClick={handleClick('cursor')}>
                    <ListItemIcon children={<NavigationIcon />} />
                    <ListItemText primary={t('header.selector.cursor')} />
                  </ListItem>
                  <ListItem button selected={type === 'hex'} onClick={handleClick('hex')}>
                    <ListItemIcon children={<ExposureZeroIcon />} />
                    <ListItemText primary={t('header.selector.hexcode')} />
                  </ListItem>
                  <ListItem button selected={type === 'text'} onClick={handleClick('text')}>
                    <ListItemIcon children={<TextFieldsIcon />} />
                    <ListItemText primary={t('header.selector.text')} />
                  </ListItem>
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    </ClickAwayListener>
  );
};

export const HexSearchTypes = React.memo(
  WrappedHexSearchTypes,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.type === nextProps.store.search.type
);
