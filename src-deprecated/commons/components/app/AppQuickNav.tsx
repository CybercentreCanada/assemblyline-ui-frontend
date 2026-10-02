import { SelfImprovement } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Modal,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import type { AppLeftNavGroup, AppLeftNavItem } from 'commons/components/app/AppConfigs';
import { useAppConfigs, useAppLayout, useAppLeftNav } from 'commons/components/app/hooks';
import { parseEvent } from 'commons/components/utils/keyboard';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type AppQuickNavItem = { type: 'item'; label: string; index?: number; grouped: boolean } & AppLeftNavItem;

type AppQuickNavGroup = { type: 'group'; label: string; items: AppQuickNavItem[] } & Omit<AppLeftNavGroup, 'items'>;

export const AppQuickNav = () => {
  const menuFocusRef = useRef<HTMLAnchorElement>(undefined);
  const { preferences } = useAppConfigs();

  const { t } = useTranslation();
  const { elements } = useAppLeftNav();
  const { mode, setFocus } = useAppLayout();

  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  const items = useMemo(() => {
    if (!elements) {
      return [];
    }

    let itemIndex = -1;

    const accept = (label: string, route: string) => {
      return label?.includes(inputValue) || route?.includes(inputValue);
    };

    const transformItem = (item: AppLeftNavItem, grouped: boolean = false): AppQuickNavItem => {
      if (item.route) {
        const label = item.i18nKey ? t(item.i18nKey) : item.text;
        const _item = { ...item, type: 'item' as const, label };
        if (accept(_item.label, _item.route)) {
          itemIndex++;
          return { ..._item, index: itemIndex, grouped };
        }
      }
      return null;
    };

    const transformGroup = (group: AppLeftNavGroup): AppQuickNavGroup => {
      const label = group.i18nKey ? t(group.i18nKey) : group.title;
      const items = group.items.map(i => transformItem(i, true)).filter(i => !!i);
      return items?.length > 0 ? { ...group, type: 'group' as const, label, items } : null;
    };

    return elements
      .map(e => {
        if (e.type === 'item') {
          return transformItem(e.element as AppLeftNavItem);
        } else if (e.type === 'group') {
          return transformGroup(e.element as AppLeftNavGroup);
        }
      })
      .filter(e => !!e);
  }, [t, elements, inputValue]);

  const onInputValueChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setInputValue(event.target.value);
  }, []);

  const onTextFieldKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    const { isArrowDown } = parseEvent(event);
    if (isArrowDown) {
      menuFocusRef.current.focus();
    }
  }, []);

  const onModalKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    const { isEscape, isCtrl, key } = parseEvent(event);

    if (isEscape) {
      setInputValue('');
      setOpen(false);
    }

    if (isCtrl && key === '/') {
      setOpen(true);
    }
  }, []);

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
  }, [open]);

  const RenderAppQuickNavItem = (item: AppQuickNavItem) => {
    return (
      <MenuItem
        dense
        key={item.id}
        component={Link}
        to={item.route}
        ref={item.index === 0 ? menuFocusRef : null}
        onClick={() => setOpen(false)}
        sx={{ whiteSpace: 'break-spaces' }}
      >
        <Stack direction="row" flex={1}>
          {item.grouped && (item.nested || item.nested === undefined) && <ListItemIcon></ListItemIcon>}
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText sx={{ flex: 1 }}>{item.label}</ListItemText>
        </Stack>
        <ListItemText sx={{ flex: 1 }}>{item.route}</ListItemText>
      </MenuItem>
    );
  };

  return (
    <Modal open={open} onKeyDown={onModalKeyDown}>
      <Stack
        direction="row"
        sx={{
          margin: 'auto',
          justifyContent: 'center',
          outline: 'none',
          marginTop: '5%',
          height: '50%'
        }}
      >
        <ClickAwayListener
          onClickAway={() => {
            setOpen(false);
          }}
        >
          <Paper sx={{ bgcolor: 'background.paper', minWidth: 500 }} component={Stack}>
            <Stack direction="row" p={1} pl={2} pr={2} pb={2} alignItems="center" spacing={1}>
              <Typography variant="body2">{t('quick.navigation')}</Typography>
              <Box flex={1} />
              {preferences.allowFocusMode && (
                <Tooltip title={t('personalization.focus.mode.tooltip')}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    onClick={() => {
                      setFocus(mode !== 'focus');
                    }}
                    sx={{
                      '&:hover': {
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Switch checked={mode === 'focus'} size="small" />
                    <SelfImprovement color={mode === 'focus' ? 'primary' : 'action'} />
                  </Stack>
                </Tooltip>
              )}
            </Stack>
            <Stack p={1} pb={2} spacing={2} direction="column">
              <Stack pr={1} pl={1} direction="row" alignItems="center" spacing={2}>
                <TextField
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  fullWidth
                  size="small"
                  label={t('quick.navigation.text.field.label')}
                  value={inputValue}
                  onChange={onInputValueChange}
                  onKeyDown={onTextFieldKeyDown}
                />
              </Stack>
            </Stack>
            <Box flex={1} position="relative">
              <Box position="absolute" top={0} right={0} bottom={0} left={0} overflow="auto">
                <Box overflow="auto">
                  <MenuList sx={{ outline: 'none', pb: 1 }} disablePadding>
                    {items.length === 0 ? (
                      <MenuItem dense>
                        <ListItemText>{t('quick.navigation.no.result')}</ListItemText>
                      </MenuItem>
                    ) : (
                      items.map(e => {
                        if (e.type === 'item') {
                          return <RenderAppQuickNavItem key={e.id} {...e} />;
                        } else if (e.type === 'group') {
                          return [
                            <Stack
                              key={e.id}
                              direction="row"
                              mt={1}
                              mr={2}
                              mb={1}
                              ml={2}
                              alignItems="center"
                              spacing={2}
                              sx={{
                                '& svg': {
                                  width: 20,
                                  height: 20
                                }
                              }}
                            >
                              {e.icon}
                              <Typography variant="body2">{e.label}</Typography>
                            </Stack>,
                            [...e.items.map(item => <RenderAppQuickNavItem key={item.id} {...item} />)]
                          ];
                        }
                      })
                    )}
                  </MenuList>
                </Box>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Stack>
    </Modal>
  );
};
