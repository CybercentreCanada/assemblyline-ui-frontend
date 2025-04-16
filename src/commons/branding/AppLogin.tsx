import { Login } from '@mui/icons-material';
import { Box, Button, Stack, TextField, styled } from '@mui/material';
import { AppBrand } from 'commons/branding/AppBrand';
import { useAppUser } from 'commons/components/app/hooks';
import PageCardCentered from 'commons/components/pages/PageCardCentered';
import type { CustomUser } from 'components/models/ui/user';
import { useSnackbar } from 'notistack';
import { useCallback, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type BrandLoginVariant = 'card-centered' | 'inline';

const InjectCss = styled(Stack)(({ theme }) => ({
  '.login-stack': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(-4)
  },
  '.MuiPaper-root': {
    width: 'unset',
    maxWidth: 'unset'
  }
}));

const UserLoginForm = () => {
  const { t } = useTranslation();
  const { setUser } = useAppUser<CustomUser>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = useCallback(
    (username_p: string, password_p: string) => {
      // This is obvisouly not how you should do authentification... perhaps you can call an API?
      if (
        username_p === null ||
        username_p === null ||
        username_p === '' ||
        password_p === null ||
        password_p === null ||
        password_p === ''
      ) {
        enqueueSnackbar(t('page.login.error'), {
          variant: 'error',
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center'
          },
          SnackbarProps: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onClick: _snack => {
              closeSnackbar();
            }
          }
        });
        return false;
      }

      setUser({
        username: 'user',
        name: 'Default User',
        email: 'user@cyber.gc.ca',
        avatar: 'https://img.icons8.com/cotton/2x/gender-neutral-user--v1.png',
        is_admin: true,
        roles: ['administration']
      });
      return true;
    },
    [t, enqueueSnackbar, setUser, closeSnackbar]
  );

  const onSubmit = useCallback(
    (event: FormEvent) => {
      // Not preventDefault here was causing this warning:
      // Form submission canceled because the form is not connected
      // The warning seems to go away is not storing user in state.
      event.preventDefault();
      login(username, password);
    },
    [username, password, login]
  );

  return (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
      <Box display="flex" flexDirection="column">
        <TextField
          fullWidth
          id="login-username"
          variant="outlined"
          size="small"
          label={t('page.login.username')}
          value={username}
          onChange={event => setUsername(event.target.value)}
        />
        <TextField
          fullWidth
          id="login-password"
          style={{ marginTop: '.5rem' }}
          variant="outlined"
          size="small"
          type="password"
          label={t('page.login.password')}
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <Button
          id="login-submit"
          type="submit"
          variant="contained"
          style={{ marginTop: '1.5rem' }}
          endIcon={<Login />}
          fullWidth
        >
          {t('page.login.button')}
        </Button>
      </Box>
    </form>
  );
};

const AppLoginInline = ({ application }: { application: string }) => {
  return (
    <Stack className="login-stack" direction="column" alignItems="center" sx={{ minWidth: 300 }}>
      <AppBrand application={application} size="medium" variant="banner-vertical" />
      <Box m={2} />
      <UserLoginForm />
    </Stack>
  );
};

export const AppLogin = ({
  application,
  variant = 'card-centered'
}: {
  application: string;
  variant?: BrandLoginVariant;
}) => {
  return variant === 'inline' ? (
    <AppLoginInline application={application} />
  ) : (
    <InjectCss direction="column" alignItems="center">
      <PageCardCentered>
        <AppLoginInline application={application} />
      </PageCardCentered>
    </InjectCss>
  );
};
