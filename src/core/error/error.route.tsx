import { memo, useEffect } from 'react';

export type CrashPageProps = {
  message?: string;
};

export const CrashPage = memo(({ message = null }: CrashPageProps) => {
  // This page makes the UI crash so we can test the frontend exception handling
  useEffect(() => {
    throw new Error(message || 'This is a test crash !');
  }, [message]);

  return <div />;
});
