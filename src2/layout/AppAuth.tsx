import { useAppConfigStore } from 'core/config';
import React, { PropsWithChildren } from 'react';
import { LoadingCard, LockedPage, LoginCard } from './auth/auth.components';
import { AuthFormProvider, useAuthForm } from './auth/auth.providers';
import { useAuthQuery } from './auth/auth.query';

export const AuthMain = React.memo(({ children }: PropsWithChildren) => {
  const loginParams = useAppConfigStore(s => s.auth.login);
  const form = useAuthForm();

  useAuthQuery();

  return (
    <form.Subscribe selector={s => s.values.variant}>
      {variant => {
        switch (variant) {
          case 'loading':
            return <LoadingCard />;
          case 'locked':
            return <LockedPage />;
          case 'login':
            return !loginParams ? <LoadingCard /> : <LoginCard />;
          case 'quota':
            return <QuotaCard />;
          case 'routes':
            return children;
          case 'tos':
            return <ToSCard />;
          default:
            return null;
        }
      }}
    </form.Subscribe>
  );
});

export const AppAuth = React.memo(({ children }: PropsWithChildren) => (
  <AuthFormProvider>
    <AuthMain>{children}</AuthMain>
  </AuthFormProvider>
));
