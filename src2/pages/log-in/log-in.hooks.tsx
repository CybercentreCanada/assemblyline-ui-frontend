import { invalidateAPIQuery, useAPIMutation, useAPIQuery } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useAppConfigSetStore } from 'core/config/config.providers';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useLoginForm } from './log-in.providers';

export const useLoginReset = () => {
  const form = useLoginForm();

  return useCallback(() => {
    form.setFieldValue('mode', 'log-in');
    form.setFieldValue('username', null);
    form.setFieldValue('password', null);
    form.setFieldValue('password_confirm', null);
    form.setFieldValue('email', null);

    form.setFieldValue('reset_id', null);
    form.setFieldValue('otp_code', null);
    form.setFieldValue('registration_key', null);

    form.setFieldValue('oauth_token_id', null);
    form.setFieldValue('saml_token_id', null);
    form.setFieldValue('webauthn_auth_resp', null);
  }, []);
};

/**
 *
 */
export const usePasswordResetEmail = () => {
  const form = useLoginForm();

  const resetID = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('reset_id') || '';
  }, [location.search]);

  useEffect(() => {
    if (resetID) {
      form.setFieldValue('mode', 'reset-password-confirmation');
      form.setFieldValue('reset_id', resetID);
    }
  }, [resetID]);
};

/**
 *
 * @returns
 */
export const useSignUpEmail = () => {
  const { t } = useTranslation(['login']);
  const location = useLocation();
  const form = useLoginForm();

  const registration_key = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('registration_key') || '';
  }, [location.search]);

  useEffect(() => {
    if (registration_key) {
      form.setFieldValue('registration_key', registration_key);
      form.setFieldValue('mode', 'sign-up-confirmation');
    }
  }, [registration_key]);
};

/**
 *
 * @returns
 */
export const useOAuthLogin = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { showErrorMessage } = useAppSnackbar();

  const redirectTo = useAppConfigStore(s => s.auth.redirectTo);
  const setStore = useAppConfigSetStore();
  const form = useLoginForm();
  const resetLogin = useLoginReset();

  const provider = useMemo<string>(() => {
    if (pathname.includes(`/oauth/`)) {
      return pathname.split(`/oauth/`).pop().slice(0, -1);
    }
    return null;
  }, [pathname]);

  const params = useMemo<URLSearchParams>(() => {
    const p = new URLSearchParams(search);

    if (provider && !p.has('provider')) {
      p.set('provider', provider);
    }
    return p;
  }, [search]);

  useAPIQuery<{ avatar: string; username: string; oauth_token_id: string; email_adr: string }>({
    url: `/api/v4/auth/oauth/?${params.toString()}`,
    disabled: !provider,
    onEnter: () => {
      form.setFieldValue('mode', 'loading');
    },
    onFailure: ({ api_error_message }) => {
      showErrorMessage(api_error_message);
      resetLogin();
    },
    onSuccess: ({ api_response }) => {
      form.setFieldValue('avatar', api_response.avatar || null);
      form.setFieldValue('username', api_response.username || null);
      form.setFieldValue('oauth_token_id', api_response.oauth_token_id || null);
      form.setFieldValue('email', api_response.email_adr || null);
      form.setFieldValue('mode', 'sso');

      if (redirectTo) {
        navigate(redirectTo);
        setStore(s => {
          s.auth.redirectTo = null;
          return s;
        });
      }
    }
  });
};

/**
 *
 * @returns
 */
export const useSAMLLogin = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { showErrorMessage } = useAppSnackbar();

  const redirectTo = useAppConfigStore(s => s.auth.redirectTo);
  const setStore = useAppConfigSetStore();
  const form = useLoginForm();
  const resetLogin = useLoginReset();

  const samlData = useMemo<{ username: string; email: string; saml_token_id: string; error: string }>(() => {
    try {
      if (pathname.includes(`/saml/`)) {
        const params = new URLSearchParams(search);
        const data = params.get('data');
        if (data !== null || data !== undefined) {
          return JSON.parse(atob(data).toString());
        }
      }
    } catch (e) {
      console.debug(e);
    }
    return { username: null, email: null, saml_token_id: null, error: null };
  }, [pathname, search]);

  useEffect(() => {
    if (!!samlData.error) {
      showErrorMessage(samlData.error);
      resetLogin();
    } else if (!!samlData.saml_token_id) {
      form.setFieldValue('username', prev => samlData.username || prev);
      form.setFieldValue('email', prev => samlData.email || prev);
      form.setFieldValue('saml_token_id', prev => samlData.saml_token_id || prev);
      form.setFieldValue('mode', 'sso');

      if (redirectTo) {
        navigate(redirectTo);
        setStore(s => {
          s.auth.redirectTo = null;
          return s;
        });
      }
    }
  }, [samlData]);
};

export const useQuickLogin = () => {
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  return useMemo<boolean>(
    () => (allowSAML && oAuthProviders?.length === 0 ? true : !allowSAML && oAuthProviders?.length === 1),
    []
  );
};

/**
 *
 * @returns
 */
export const useLoginRequest = () => {
  const { t } = useTranslation(['login']);
  const { showErrorMessage } = useAppSnackbar();
  const form = useLoginForm();

  const resetLogin = useLoginReset();

  return useAPIMutation(() => ({
    url: '/api/v4/auth/login/',
    method: 'POST',
    body: {
      user: form.getFieldValue('username'),
      password: form.getFieldValue('password'),
      otp: form.getFieldValue('otp_code'),
      webauthn_auth_resp: form.getFieldValue('webauthn_auth_resp'),
      oauth_token_id: form.getFieldValue('oauth_token_id'),
      saml_token_id: form.getFieldValue('saml_token_id')
    },
    onEnter: () => {
      form.setFieldValue('mode', 'loading');
    },
    onFailure: ({ api_error_message: msg }) => {
      const mode = form.getFieldValue('mode');

      if (msg === 'Wrong OTP token' && mode !== 'otp') {
        form.setFieldValue('mode', 'otp');
      } else if (msg === 'Wrong Security Token' && mode === 'sectoken') {
        form.setFieldValue('mode', 'otp');
        showErrorMessage(t('securitytoken.error'));
      } else if (msg === 'Wrong Security Token' && mode !== 'sectoken') {
        form.setFieldValue('mode', 'sectoken');
      } else if (mode === 'sso') {
        showErrorMessage(msg);
        resetLogin();
      } else {
        showErrorMessage(msg);
      }
    },
    onSuccess: () => {
      invalidateAPIQuery(({ url }) => '/api/v4/user/whoami/' === url);
    }
  }));
};
