import { ClickAwayListener, Fade, Paper, Popper, TextField, Typography, useMediaQuery } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';
import NavigationIcon from '@material-ui/icons/Navigation';
import SettingsIcon from '@material-ui/icons/Settings';
import ShareIcon from '@material-ui/icons/Share';
import { default as React, forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListElement,
  StoreState,
  useCursor,
  useHex,
  useHistory,
  useLocation,
  useSearch,
  useSetting,
  useStyles,
  useSuggestion
} from '..';

export type MenuPopperProps = {
  states?: StoreState;
  anchorEl?: any;
};

const useMenuStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper
    },
    nested: {
      paddingLeft: theme.spacing(4)
    }
  })
);

export const WrappedMenuPopper = ({ states = null, anchorEl = null }: MenuPopperProps, ref) => {
  const { t, i18n } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { cursorIndex, searchValue, searchIndexes, searchIndex, suggestionOpen } = states;

  const classes = useMenuStyles();
  const { toolbarClasses } = useStyles();

  const { hexMap } = useHex();
  const { onSettingOpen } = useSetting();
  const { onSearchKeyDown, onSearchClear, onSearchClick, onSearchIndexChange, onSearchInputChange } = useSearch();
  const { onCursorIndexChange } = useCursor();
  const { onHistoryChange, onHistoryKeyDown } = useHistory();
  const { onLocationShare } = useLocation();
  const {
    suggestionLabels,
    onSuggestionLabelChange,
    onSuggestionFocus,
    onSuggestionBlur,
    onSuggestionChange,
    onSuggestionInputChange,
    onSuggestionKeyDown
  } = useSuggestion();

  const [open, setOpen] = useState<boolean>(false);
  const [nestedOpen, setNestedOpen] = useState<boolean>(false);
  // const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true)
    }),
    []
  );

  // const handleClose = (event: React.MouseEvent<EventTarget>) => {
  //   setOpen(false);
  // };

  // const handleCloseKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
  //   if (!isEscape(event.key) && !isEnter(event.key)) return;
  //   setOpen(false);
  //   // setAnchorEl(null);
  // }, []);

  const handleClick = () => {
    setNestedOpen(!nestedOpen);
  };

  return (
    <Popper open={open && downSM} anchorEl={anchorEl} placement="bottom-end" transition>
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Fade {...TransitionProps} timeout={200}>
            <Paper className={toolbarClasses.menuPopper}>
              <List component="nav" className={classes.root} dense>
                <ListItem button dense>
                  <ListItemText>
                    {searchIndexes.length > 0 ? (
                      <Typography
                        className={toolbarClasses.resultIndexes}
                        variant="subtitle1"
                        color={
                          searchValue && searchValue.length > 0 && searchIndexes.length === 0 ? 'error' : 'textPrimary'
                        }
                      >
                        {searchIndex + 1 + t('of') + searchIndexes.length}
                      </Typography>
                    ) : (
                      <Typography
                        className={toolbarClasses.resultNoneIndexes}
                        variant="subtitle1"
                        color={searchValue.length > 0 ? 'error' : 'textPrimary'}
                      >
                        {t('no-results')}
                      </Typography>
                    )}
                  </ListItemText>
                </ListItem>

                <ListElement title={t('previous')} onClick={() => onSearchClick('previous')} icon={<ArrowUpward />} />
                <ListElement title={t('next')} onClick={() => onSearchClick('next')} icon={<ArrowDownward />} />
                <ListElement title={t('clear.title')} onClick={onSearchClear} icon={<ClearIcon />} />
                <Divider />
                <ListItem button dense>
                  <ListItemIcon>
                    <NavigationIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <TextField
                      id="cursor-index"
                      label={t('navigation-label')}
                      placeholder={t('navigation-placeholder')}
                      fullWidth
                      size="small"
                      margin="dense"
                      type="number"
                      value={cursorIndex !== null ? cursorIndex : ''}
                      InputProps={{
                        autoCorrect: 'off',
                        autoCapitalize: 'off',
                        autoFocus: false,
                        inputProps: { min: 0, max: hexMap.current.size - 1 }
                      }}
                      onInput={(event: any) => onCursorIndexChange(event.target.valueAsNumber)}
                      style={{ margin: 0 }}
                    />
                  </ListItemText>
                </ListItem>
                <ListElement title={t('share')} onClick={onLocationShare} icon={<ShareIcon />} />
                <ListElement title={t('settings.title')} onClick={onSettingOpen} icon={<SettingsIcon />} />
              </List>
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};

export const MenuPopper = React.memo(forwardRef(WrappedMenuPopper));

export default MenuPopper;
