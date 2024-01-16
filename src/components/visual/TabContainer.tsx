import { Tab, TabProps, Tabs, TabsProps, useTheme } from '@mui/material';
import React, { FC, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface TabElement extends TabProps {
  content?: ReactNode;
}

type TabElements = Record<string, TabElement>;

interface Props<T extends TabElements> extends TabsProps {
  defaultTab?: keyof T;
  paper?: boolean;
  value?: keyof T;
  tabs: T;
}

type TabContextProps = {
  onTabChange: (value: string) => void;
};

export interface TabProviderProps {
  children: React.ReactNode;
}

const TabContext = React.createContext<TabContextProps>(null);

export function useTab(): TabContextProps {
  return useContext(TabContext) as TabContextProps;
}

const WrappedTabContainer = <T extends TabElements>({
  defaultTab: defaultTabProp = null,
  paper = false,
  sx = {},
  value: valueProp = null,
  tabs = null,
  onChange: onChangeProp = null,
  ...props
}: Props<T>): ReactElement<Props<T>> => {
  const theme = useTheme();

  const defaultTab = useMemo<keyof T>(() => defaultTabProp || Object.keys(tabs)[0], [defaultTabProp, tabs]);

  const [tabState, setTabState] = useState<keyof T>(defaultTab);

  const tab = useMemo<keyof T>(
    () => (!valueProp ? tabState : valueProp in tabs && !tabs[valueProp]?.disabled ? valueProp : defaultTab),
    [defaultTab, tabState, tabs, valueProp]
  );

  const handleChange = useCallback(
    (prev: keyof T) => (event: React.SyntheticEvent<Element, Event>, value: keyof T) => {
      const nextValue = value in tabs && !tabs[value]?.disabled ? value : prev;
      if (onChangeProp) onChangeProp(event, nextValue);
      else setTabState(nextValue);
    },
    [onChangeProp, tabs]
  );

  const onTabChange = useCallback(
    (value: keyof T) => {
      const nextValue = value in tabs && !tabs[value]?.disabled ? value : defaultTab;
      if (onChangeProp) onChangeProp(null, nextValue);
      else setTabState(nextValue);
    },
    [defaultTab, onChangeProp, tabs]
  );

  return (
    <TabContext.Provider value={{ onTabChange }}>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        onChange={handleChange(tab)}
        sx={{
          backgroundColor: theme.palette.background.default,
          margin: `${theme.spacing(2)} 0`,
          zIndex: 1000,
          ...(paper && {
            backgroundColor: theme.palette.background.paper
          }),
          ...sx
        }}
        {...props}
      >
        {Object.entries(tabs).map(([value, { label = '', disabled = false }], i) =>
          disabled ? null : <Tab key={i} label={label} value={value} sx={{ minWidth: '120px' }} />
        )}
      </Tabs>

      {Object.entries(tabs).map(([value, { label = '', disabled = false, content = null }], i) =>
        disabled ? null : <TabContent key={i} open={tab === value} children={content} />
      )}
    </TabContext.Provider>
  );
};

export const TabContainer = React.memo(WrappedTabContainer);

interface TabContentProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  open?: boolean;
}

const WrappedTabContent: FC<TabContentProps> = ({ children, name = '', style, open = false, ...other }) => {
  const [render, setRender] = useState<boolean>(open);
  useEffect(() => {
    if (open === true) setRender(true);
  }, [open]);
  return (
    <div {...other} style={{ display: open ? 'contents' : 'none', ...style }}>
      {render && children}
    </div>
  );
};

export const TabContent = React.memo(WrappedTabContent);
