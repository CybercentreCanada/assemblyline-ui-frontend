import { ErrorFallback } from 'core/error/error.components';
import type { PropsWithChildren } from 'react';
import { memo, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

//*****************************************************************************************
// AppErrorProvider
//*****************************************************************************************

export const AppErrorProvider = memo(({ children }: PropsWithChildren) => {
  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
});

AppErrorProvider.displayName = 'AppErrorProvider';
