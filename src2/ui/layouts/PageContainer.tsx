import type { ButtonProps, IconButtonProps } from '@mui/material';
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, useTheme } from '@mui/material';
import { useAppBar, useAppBarHeight, useAppLayout } from 'commons/components/app/hooks';
import { memo, useMemo } from 'react';

export type PageHeaderAction = {
  key?: string;
  title?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};

type PageHeaderProps = {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  actions?: PageHeaderAction[];
  isSticky?: boolean;
  top?: number;
  elevation?: number;
  backgroundColor?: string;
  className?: string;
};

const PageContainer: React.FC<PageHeaderProps> = ({
  children,
  left,
  right,
  actions,
  backgroundColor,
  className,
  isSticky = false,
  top = null,
  elevation = 0
}) => {
  const theme = useTheme();
  const layout = useAppLayout();
  const appbar = useAppBar();
  const appBarHeight = useAppBarHeight();

  const barWillHide = useMemo(() => (layout?.current !== 'top' ? appbar?.autoHide : null), [appbar?.autoHide, layout]);
  const computedTop = top !== null ? top : isSticky ? (barWillHide ? 0 : appBarHeight) : null;

  return (
    <AppBar
      id="header1"
      position={isSticky ? 'sticky' : 'relative'}
      sx={{
        top: computedTop,
        backgroundColor: backgroundColor || theme.palette.background.default,
        zIndex: !isSticky ? theme.zIndex.appBar - 100 : undefined,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
      className={className}
      elevation={elevation}
      color="inherit"
    >
      {children}
      {(left || right || actions) && (
        <Toolbar
          disableGutters
          sx={{
            minHeight: 48,
            px: 2,
            gap: 2
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>{left}</Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {actions &&
              actions.map((a, i) => {
                let act = null;
                const key = a.key ?? `ph-action-${i}`;
                const ariaLabel = a.tooltip || a.title || `action-${i + 1}`;
                if (a.title) {
                  act = (
                    <Button
                      key={key}
                      startIcon={a.icon}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as ButtonProps)}
                      sx={{ marginRight: 1 }}
                    >
                      {a.title}
                    </Button>
                  );
                } else {
                  act = (
                    <IconButton
                      key={key}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as IconButtonProps)}
                      sx={{ marginRight: 1 }}
                      aria-label={ariaLabel}
                      size="large"
                    >
                      {a.icon}
                    </IconButton>
                  );
                }
                return a.tooltip ? (
                  <Tooltip key={key} title={a.tooltip}>
                    {act}
                  </Tooltip>
                ) : (
                  act
                );
              })}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{right}</Box>
        </Toolbar>
      )}
    </AppBar>
  );
};

export default memo(PageContainer);
