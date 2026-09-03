import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { queryClient } from 'core/api/api.providers';
import { useAppInterfaceStore } from 'core/interface';
import { AppDebugStores } from 'layout/debug';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

export type AppDebugLayoutProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
};

export const AppDebugLayout = memo(({ children }: AppDebugLayoutProps) => {
  const debugMode = useAppInterfaceStore(s => s.debug.mode);

  return (
    <Group orientation="vertical">
      <Panel>{children}</Panel>
      {!debugMode ? null : (
        <>
          <Separator />
          <Panel defaultSize="40%" minSize="2%" maxSize="100%">
            {debugMode === 'api' && <ReactQueryDevtoolsPanel client={queryClient} style={{ height: '100%' }} />}
            {debugMode === 'store' && <AppDebugStores />}
          </Panel>
        </>
      )}
    </Group>
  );
});
