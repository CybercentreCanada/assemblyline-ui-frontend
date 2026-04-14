import {
  Bolt,
  Circle,
  Close,
  DarkMode,
  KeyboardCommandKey,
  Language,
  TurnRight,
  ZoomInMap,
  ZoomOutMap
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Slide,
  Typography,
  useTheme
} from '@mui/material';
import {
  type ChangeEvent,
  type Dispatch,
  type FC,
  forwardRef,
  type KeyboardEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AppCommand, AppCommandAction, AppCommandRoute } from '.';
import { useAppLanguage, useAppLayout, useAppLeftNav, useAppPreferences, useAppRouter, useAppTheme } from '../app';
import { AppSurface } from '../display';
import { traverse } from '../leftnav';
import { MODULE_NAME } from '../name';
import { parseEvent } from '../utils';

const ModalTransition = forwardRef(function Transition(props: any, ref: any) {
  const { children, ..._props } = props;
  return (
    <Slide direction="down" ref={ref} {..._props}>
      {children}
    </Slide>
  );
});

export const AppCommands: FC<{ open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }> = ({ open, setOpen }) => {
  const theme = useTheme();

  const menuRef = useRef<HTMLUListElement>(undefined);
  const inputRef = useRef<HTMLDivElement>(undefined);

  const { t: clientT } = useTranslation();
  const { t } = useTranslation(MODULE_NAME);

  const { menus } = useAppLeftNav();
  const { mode, setFocus } = useAppLayout();
  const { allowFocusMode, commands } = useAppPreferences();
  const { toggleMode, isDark } = useAppTheme();
  const { toggle: toggleLanguage, isEN } = useAppLanguage();
  const { Link, matchPath, location } = useAppRouter();

  const [inputValue, setInputValue] = useState<string>('');

  const [displayItems, setDisplayItems] = useState<{ actions: AppCommand[]; routes: AppCommand[] }>(null);

  const items: AppCommand[] = useMemo(() => {
    const _items: AppCommand[] = menus
      .map(menu =>
        traverse(
          menu,
          (child, agg) => {
            if (child.type === 'route') {
              agg.push({
                id: child.id,
                type: child.type,
                icon: child.icon,
                primary: child.label,
                primaryI18nKey: child.i18nKey,
                secondary: child.route,
                descriptionI18nKey: child.tooltipI18nKey,
                route: child.route,
                matcher: child.matcher
              } as AppCommandRoute);
            }

            if (child.type === 'action') {
              agg.push({
                id: child.id,
                type: child.type,
                icon: child.icon,
                primary: child.label,
                primaryI18nKey: child.i18nKey,
                descriptionI18nKey: child.tooltipI18nKey,
                onClick: child.action
              } as AppCommandAction);
            }
          },
          []
        )
      )
      .flat();

    _items.sort(i1 => {
      return i1.type === 'action' ? -1 : 1;
    });

    // action: toggle mode
    _items.unshift({
      id: 'action.toggle.thememode',
      type: 'action',
      icon: <DarkMode />,
      primary: 'Theme Mode',
      description: isDark ? 'Change theme mode to light' : 'Change theme mode to dark',
      onClick: () => toggleMode()
    } as AppCommandAction);

    // action: toggle language
    _items.unshift({
      id: 'action.toggle.language',
      type: 'action',
      icon: <Language />,
      primary: 'Language',
      description: isEN() ? 'Change language to french' : 'Changer la langue en anglais',
      onClick: () => toggleLanguage()
    } as AppCommandAction);

    // action: toggle focus mode
    if (allowFocusMode) {
      _items.unshift({
        id: 'action.toggle.focusmode',
        type: 'action',
        icon: mode === 'focus' ? <ZoomInMap /> : <ZoomOutMap />,
        primary: 'Focus Mode',
        description: isEN()
          ? mode === 'focus'
            ? 'Turn OFF focus mode'
            : 'Turn ON focus mode'
          : mode === 'focus'
            ? 'Désactiver le mode focus'
            : 'Activer le mode focus',
        onClick: () => setFocus(_focus => !_focus)
      } as AppCommandAction);
    }

    return commands ? [..._items, ...commands] : _items;
  }, [mode, menus, isEN, isDark, allowFocusMode, commands, toggleMode, toggleLanguage, setFocus]);

  const search = useCallback(
    (searchTerm: string) => {
      const filteredItems = searchTerm
        ? items.filter(item => {
            const searchTarget = `${item.primary}${item.secondary}${item.description}`;
            return searchTarget.toLowerCase().includes(searchTerm.toLowerCase());
          })
        : items;

      setDisplayItems({
        actions: filteredItems.filter(i => i.type === 'action'),
        routes: filteredItems.filter(i => i.type === 'route')
      });
    },
    [items]
  );

  const onInputValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setInputValue(event.target.value);
      search(event.target.value);
    },
    [search]
  );

  const onTextFieldKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    const { isArrowDown, isArrowUp } = parseEvent(event);

    // On arrow down/up, move focus to first/last element.
    if (isArrowDown || isArrowUp) {
      const elements = menuRef.current.querySelectorAll('.app-command');

      if (elements) {
        event.preventDefault();

        (elements.item(isArrowDown ? 0 : elements.length - 1) as HTMLElement).focus();
      }
    }
  }, []);

  const onModalKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { isEscape, isCtrl, key } = parseEvent(event);

      if (isEscape) {
        setInputValue('');
        setOpen(false);
      }

      if (isCtrl && key === '/') {
        setOpen(true);
      }
    },
    [setOpen]
  );

  useEffect(() => {
    const _open = open;

    const handler = event => {
      const { isCtrl, key } = parseEvent(event);
      if (isCtrl && key === '/') {
        setOpen(true);
      }
    };

    if (!_open) {
      window.addEventListener('keydown', handler);
    }

    return () => {
      if (!_open) {
        window.removeEventListener('keydown', handler);
      }
    };
  }, [open, setOpen]);

  // Ensure search resets when dialog closes.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayItems(null);
    }
  }, [open]);

  // command-type=action renderer component.
  const CommandActionRenderer = useCallback(
    (_item: AppCommandAction) => {
      const primary = _item.primaryI18nKey ? clientT(_item.primaryI18nKey) : _item.primary;
      const secondary = _item.secondaryI18nKey ? clientT(_item.secondaryI18nKey) : _item.secondary;
      const description = _item.descriptionI18nKey ? clientT(_item.descriptionI18nKey) : _item.description;

      return (
        <MenuItem
          dense
          key={_item.id}
          className="app-command"
          onClick={event => {
            _item.onClick(event);
            setOpen(false);
          }}
          sx={{ display: 'relative', whiteSpace: 'break-spaces' }}
        >
          <ListItemIcon>{_item.icon}</ListItemIcon>
          <ListItemText sx={{ flex: 1 }} primary={primary} secondary={description && secondary} />
          <Typography variant="body2" color="textSecondary" justifyContent="left" flex={1}>
            {description || secondary}
          </Typography>
        </MenuItem>
      );
    },
    [setOpen, clientT]
  );

  // command-type=route renderer component.
  const CommandRouteRenderer = useCallback(
    (_item: AppCommandRoute) => {
      const match = _item.matcher
        ? _item.matcher.test(location.pathname)
        : matchPath({ path: _item.route }, location.pathname);

      const primary = _item.primaryI18nKey ? clientT(_item.primaryI18nKey) : _item.primary;
      const secondary = _item.secondaryI18nKey ? clientT(_item.secondaryI18nKey) : _item.secondary;
      const description = _item.descriptionI18nKey ? clientT(_item.descriptionI18nKey) : _item.description;

      return (
        <MenuItem
          dense
          key={_item.id}
          className={`app-command ${match ? 'app-command-active' : ''}`}
          component={Link}
          to={_item.route}
          onClick={() => setOpen(false)}
          sx={{ display: 'relative', whiteSpace: 'break-spaces' }}
        >
          {match && (
            <Box position="absolute" top={22} bottom={22} left={4} width={4} bgcolor="primary.main" borderRadius={2} />
          )}
          <ListItemIcon>{_item.icon || <Circle sx={{ display: 'none' }} />}</ListItemIcon>
          <ListItemText sx={{ flex: 1 }} primary={primary} secondary={description && secondary} />
          <Typography variant="body2" color="textSecondary" justifyContent="left" flex={1}>
            {description || secondary}
          </Typography>
        </MenuItem>
      );
    },
    [Link, location.pathname, matchPath, setOpen, clientT]
  );

  return (
    <Dialog
      disableRestoreFocus
      fullWidth
      maxWidth="md"
      open={open}
      onKeyDown={onModalKeyDown}
      sx={{
        maxHeight: '50%',
        '.MuiDialog-container': {
          alignItems: 'start'
        }
      }}
      slots={{ transition: ModalTransition }}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            margin: 0,
            width: '100%'
          }
        }
      }}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>
        <AppSurface baseElevation={24} relativeElevation={4} withShadow={false} sx={{ borderRadius: 1 }}>
          <InputBase
            autoFocus
            fullWidth
            ref={inputRef}
            placeholder={t('quick.command.text.field.label')}
            value={inputValue}
            onChange={onInputValueChange}
            onKeyDown={onTextFieldKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <KeyboardCommandKey color="inherit" sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  color="inherit"
                  sx={{ color: theme.palette.text.secondary }}
                  onClick={() => {
                    setInputValue('');
                    setDisplayItems(null);
                  }}
                >
                  <Close />
                </IconButton>
              </InputAdornment>
            }
            sx={theme => ({
              color: theme.palette.text.secondary,
              width: '100%',
              p: 1
            })}
          />
        </AppSurface>
      </DialogTitle>
      <DialogContent
        sx={{
          width: '100%',
          pb: 0
        }}
      >
        <MenuList sx={{ outline: 'none', mt: 0, pt: 0 }} ref={menuRef}>
          <MenuItem tabIndex={-1} disableGutters dense disabled style={{ opacity: 1 }}>
            <ListItemIcon>
              <Bolt color="warning" />
            </ListItemIcon>
            <ListItemText sx={theme => ({ color: theme.palette.text.secondary })}>{t('actions')}</ListItemText>
          </MenuItem>

          {(displayItems?.actions || items.filter(i => i.type === 'action')).map(_item => (
            <CommandActionRenderer key={_item.id} {...(_item as AppCommandAction)} />
          ))}

          <MenuItem tabIndex={-1} disableGutters dense disabled style={{ opacity: 1, marginTop: theme.spacing(2) }}>
            <ListItemIcon>
              <TurnRight color="primary" style={{ marginBottom: 5 }} />
            </ListItemIcon>
            <ListItemText sx={theme => ({ color: theme.palette.text.secondary })}>{t('routes')}</ListItemText>
          </MenuItem>

          {(displayItems?.routes || items.filter(i => i.type === 'route')).map(_item => (
            <CommandRouteRenderer key={_item.id} {...(_item as AppCommandRoute)} />
          ))}
        </MenuList>
      </DialogContent>
    </Dialog>
  );
};
