import type { ButtonProps, IconButtonProps } from '@mui/material';
import { AppBar, Button, IconButton, Toolbar, Tooltip, useTheme } from '@mui/material';
import { useAppInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import { memo } from 'react';

export type AppPageContainerAction = {
  key?: string;
  title?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};

export type AppPageContainerProps = {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  actions?: AppPageContainerAction[];
  isSticky?: boolean;
  top?: number;
  elevation?: number;
  backgroundColor?: string;
  className?: string;
};

export const AppPageContainer = memo(
  ({
    children,
    left,
    right,
    actions,
    backgroundColor,
    className,
    isSticky = false,
    top = null,
    elevation = 0
  }: AppPageContainerProps) => {
    const theme = useTheme();

    const appBarAutoHides = useAppPreferenceStore(s => s.template.layout !== 'top' && s.template.autoHideAppbar);
    const appBarHeight = useAppInterfaceStore(s => s.template.appBarHeight);

    return (
      <AppBar
        id="header1"
        position={isSticky ? 'sticky' : 'relative'}
        style={{
          top: top !== null ? top : isSticky ? (appBarAutoHides ? 0 : appBarHeight) : null,
          backgroundColor: backgroundColor || theme.palette.background.default,
          zIndex: !isSticky ? theme.zIndex.appBar - 100 : null
        }}
        className={className}
        elevation={elevation}
        color="inherit"
      >
        {children}
        {(left || right || actions) && (
          <Toolbar disableGutters style={{ minHeight: 0 }}>
            <div style={{ flexGrow: 1 }}>{left}</div>
            <div>
              {actions &&
                actions.map((a, i) => {
                  let act = null;
                  const key = a.key ?? `ph-action-${i}`;
                  const ariaLabel = a.tooltip || a.title || `action-${i + 1}`;

                  if (a.title) {
                    act = (
                      <Button
                        key={key}
                        aria-label={ariaLabel}
                        startIcon={a.icon}
                        color={a.color}
                        onClick={a.action}
                        {...(a.btnProp as ButtonProps)}
                        sx={{ marginRight: theme.spacing(1) }}
                      >
                        {a.title}
                      </Button>
                    );
                  } else {
                    act = (
                      <IconButton
                        key={key}
                        aria-label={ariaLabel}
                        color={a.color}
                        onClick={a.action}
                        {...(a.btnProp as IconButtonProps)}
                        size="large"
                        sx={{ marginRight: theme.spacing(1) }}
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
            </div>
            <div>{right}</div>
          </Toolbar>
        )}
      </AppBar>
    );
  }
);

AppPageContainer.displayName = 'AppPageContainer';
