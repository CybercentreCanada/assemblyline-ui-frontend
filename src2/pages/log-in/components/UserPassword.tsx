import { useAppConfigStore } from 'core/config';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { PasswordInput, UsernameInput } from '../log-in.components';
import { useLoginRequest } from '../log-in.hooks';

//*****************************************************************************************
// User Password Login
//*****************************************************************************************
export const UserPasswordLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);

  const requestLogin = useLoginRequest();

  return !allowUserPass ? null : (
    <form
      style={{ display: 'contents' }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        requestLogin.mutate();
      }}
    >
      <UsernameInput autoFocus />
      <PasswordInput />

      <Button color="primary" type="submit" variant="contained">
        {t('button')}
      </Button>
    </form>
  );
});

UserPasswordLogin.displayName = 'UserPasswordLogin';
