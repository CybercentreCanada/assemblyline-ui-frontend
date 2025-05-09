import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, useTheme } from '@mui/material';
import type { AppLeftNavItem } from 'commons/components/app/AppConfigs';
import { useAppLeftNav, useAppUser } from 'commons/components/app/hooks';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

type LeftNavItemProps = {
  item: AppLeftNavItem;
  popover?: boolean;
  context?: 'item' | 'group';
  hideIcon?: boolean;
  onClick: () => void;
};

const LeftNavItemInner = ({ item, context, popover, hideIcon, label, leftnavOpen }) => {
  const theme = useTheme();
  const nested = item.nested !== undefined ? item.nested : context === 'group';
  const showIcon = useMemo(() => item.icon && !hideIcon, [item, hideIcon]);

  const spacer = useMemo(
    () => (!nested ? null : <Box id="spacer" sx={{ marginLeft: theme.spacing(2) }} />),
    [nested, theme]
  );

  const itemIcon = useMemo(() => {
    const showNested = !popover && context === 'group' && nested;
    return (
      showIcon && (
        <ListItemIcon id="icon" sx={{ minWidth: showNested || popover ? 40 : undefined }}>
          {item.icon}
        </ListItemIcon>
      )
    );
  }, [nested, showIcon, item.icon, context, popover]);

  return (
    <>
      {spacer}
      {itemIcon}
      <ListItemText primary={label} />
    </>
  );
};

const LeftNavItem = ({ item, context = 'item', popover = false, hideIcon = false, onClick }: LeftNavItemProps) => {
  const { t } = useTranslation();
  const user = useAppUser();
  const leftnav = useAppLeftNav();
  const { text, i18nKey, nested, route, render, userPropValidators } = item;
  const label = i18nKey ? t(i18nKey) : text;

  return user.validateProps(userPropValidators) ? (
    <ListItem disablePadding>
      {render ? (
        render(leftnav.open)
      ) : (
        <Tooltip title={!leftnav.open && !nested ? label : ''} aria-label={label} placement="right">
          <ListItemButton
            id={`left-nav-${item.id}`}
            component={route ? Link : ListItemButton}
            target={item.target}
            to={route}
            dense={!!nested}
            key={text}
            onClick={onClick ? onClick : null}
          >
            <LeftNavItemInner
              hideIcon={hideIcon}
              context={context}
              popover={popover}
              item={item}
              label={label}
              leftnavOpen={leftnav.open}
            />
          </ListItemButton>
        </Tooltip>
      )}
    </ListItem>
  ) : null;
};

export default memo(LeftNavItem);
