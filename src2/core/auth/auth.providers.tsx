import React, { PropsWithChildren } from 'react';
import { useAuthQuery } from './auth.query';

export const AppAuthProvider = React.memo(({ children }: PropsWithChildren) => {
  useAuthQuery();

  return children;
});
