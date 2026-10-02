import { useAppInterfaceStore } from 'core/interface';
import { PasswordInput, UsernameInput } from 'layout/auth/log-in/log-in.components';
import { useLoginRequest } from 'layout/auth/log-in/log-in.hooks';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';

//*****************************************************************************************
// User Password Login
//*****************************************************************************************
export const UserPasswordLogin = memo(() => {
  const { t } = useTranslation(['login']);
  const allowUserPass = useAppInterfaceStore(s => s.auth.login.allow_userpass_login);

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
