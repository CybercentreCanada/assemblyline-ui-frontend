import type { TabProps, TabsProps } from '@mui/material';
import { Tab, Tabs, useTheme } from '@mui/material';
import type { FC, ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type TabContextProps = {
  /** Change active tab programmatically */
  onTabChange: (value: string) => void;
};

const TabContext = createContext<TabContextProps | null>(null);
export const useTab = (): TabContextProps => {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTab must be used within <TabContainer>');
  return ctx;
};

type TabContentProps = React.HTMLProps<HTMLDivElement> & {
  /** If true, mounts children even when not visible */
  allowRender?: boolean;
  /** Whether this tab is currently active */
  open?: boolean;
  /** Tab content children */
  children?: ReactNode;
};

export const TabContent: FC<TabContentProps> = React.memo(
  ({ allowRender = false, open = false, children, style, ...props }) => {
    const [render, setRender] = useState<boolean>(open || allowRender);

    useEffect(() => {
      if (open) setRender(true);
    }, [open]);

    return (
      <div {...props} style={{ display: open ? 'contents' : 'none', ...style }}>
        {render && children}
      </div>
    );
  }
);

type TabElement = TabProps & {
  /** Inner content to render when active */
  inner?: ReactNode;
  /** If true, tab header won’t render */
  preventRender?: boolean;
};

type TabElements = Record<string, TabElement>;

type TabContainerProps<T extends TabElements> = TabsProps & {
  /** Whether inactive tabs should still mount */
  allowRender?: boolean;
  /** Default active tab key */
  defaultTab?: keyof T;
  /** If true, uses paper background */
  paper?: boolean;
  /** Sticky header offset (null to disable) */
  stickyTop?: number | null;
  /** List of tabs (keyed) */
  tabs: T;
  /** Controlled active tab value */
  value?: keyof T;
};

export const TabContainer = React.memo(
  <T extends TabElements>({
    allowRender = false,
    defaultTab: defaultTabProp = null,
    paper = false,
    stickyTop = null,
    tabs,
    value: valueProp = null,
    onChange: onChangeProp = null,
    sx = {},
    ...props
  }: TabContainerProps<T>): ReactElement => {
    const theme = useTheme();

    const defaultTab = useMemo<keyof T>(
      () => defaultTabProp || (Object.keys(tabs)[0] as keyof T),
      [defaultTabProp, tabs]
    );

    const [tabState, setTabState] = useState<keyof T>(defaultTab);

    const activeTab = useMemo<keyof T>(
      () => (valueProp && valueProp in tabs && !tabs[valueProp]?.disabled ? valueProp : tabState),
      [tabState, tabs, valueProp]
    );

    const handleChange = useCallback(
      (prev: keyof T) => (_: React.SyntheticEvent, next: keyof T) => {
        const value = next in tabs && !tabs[next]?.disabled ? next : prev;
        onChangeProp ? onChangeProp(_, value) : setTabState(value);
      },
      [onChangeProp, tabs]
    );

    const onTabChange = useCallback(
      (value: keyof T) => {
        const next = value in tabs && !tabs[value]?.disabled ? value : defaultTab;
        onChangeProp ? onChangeProp(null, next) : setTabState(next);
      },
      [defaultTab, onChangeProp, tabs]
    );

    return (
      <TabContext.Provider value={{ onTabChange }}>
        <div
          style={{
            backgroundColor: paper ? theme.palette.background.default : theme.palette.background.paper,
            zIndex: 1000,
            ...(stickyTop && {
              position: 'sticky',
              top: `${stickyTop}px`,
              margin: '0 -4px',
              padding: '0 4px'
            })
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleChange(activeTab)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              backgroundColor: paper ? theme.palette.background.paper : theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              my: 2,
              ...sx
            }}
            {...props}
          >
            {Object.entries(tabs).map(([key, tab], i) =>
              tab.preventRender ? null : (
                <Tab key={i} tabIndex={0} role="button" value={key} sx={{ minWidth: 120 }} {...tab} />
              )
            )}
          </Tabs>
        </div>

        {Object.entries(tabs).map(([key, tab], i) =>
          tab.disabled ? null : (
            <TabContent key={i} open={activeTab === key} allowRender={allowRender}>
              {tab.inner}
            </TabContent>
          )
        )}
      </TabContext.Provider>
    );
  }
) as <T extends TabElements>(props: TabContainerProps<T>) => React.ReactNode;
