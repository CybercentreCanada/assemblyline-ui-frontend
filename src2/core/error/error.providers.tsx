import React, { PropsWithChildren, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error.components';

export const AppErrorProviders = React.memo(({ children }: PropsWithChildren) => {
  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
});
