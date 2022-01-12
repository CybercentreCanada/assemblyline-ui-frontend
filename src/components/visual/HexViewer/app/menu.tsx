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
import { ListElement, StoreState, useCursor, useHex, useLocation, useSearch, useSetting, useStyles } from '..';

export type HexMenuProps = {
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

export const WrappedHexMenu = ({ states = null, anchorEl = null }: HexMenuProps, ref) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { cursorIndex, searchValue, searchIndexes, searchIndex } = states;

  const classes = useMenuStyles();
  const { toolbarClasses } = useStyles();

  const { hexMap } = useHex();
  const { onSettingOpen } = useSetting();
  const { onSearchClear, onSearchClick } = useSearch();
  const { onCursorIndexChange } = useCursor();
  const { onLocationShare } = useLocation();

  const [open, setOpen] = useState<boolean>(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true)
    }),
    []
  );

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
                      label={t('offset.name')}
                      placeholder={t('offset.placeholder')}
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

export const HexMenu = React.memo(forwardRef(WrappedHexMenu));

export default HexMenu;
