import { QUERY_CLIENT } from 'core/api/api.providers';
import { useAppInterfaceStore } from 'core/interface';
import { AppDebugStores } from 'layout/debug';
import type { PropsWithChildren } from 'react';
import { lazy, memo, Suspense } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

const ReactQueryDevtoolsPanel = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(res => ({
    default: res.ReactQueryDevtoolsPanel
  }))
);

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
            {debugMode === 'api' && (
              <Suspense fallback={null}>
                <ReactQueryDevtoolsPanel client={QUERY_CLIENT} style={{ height: '100%', width: '100%' }} />
              </Suspense>
            )}
            {debugMode === 'store' && <AppDebugStores />}
          </Panel>
        </>
      )}
    </Group>
  );
});
