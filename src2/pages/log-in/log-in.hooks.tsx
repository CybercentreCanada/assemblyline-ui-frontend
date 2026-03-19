import { invalidateAPIQuery, useAPIMutation, useAPIQuery } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useSaveAppConfig } from 'core/config/config.hooks';
import { useAppConfigSetStore } from 'core/config/config.providers';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useLoginForm } from './log-in.providers';

/**
 * Creates a stable callback that resets the login form back to its default values.
 *
 * @returns A function that clears any in-progress login state (OTP, reset password, SSO tokens, etc.).
 */
export const useLoginReset = () => {
  const form = useLoginForm();

  return useCallback(() => {
    form.reset();
  }, [form]);
};

/**
 * Reads the `reset_id` query param and, when present, switches the form into reset-password confirmation mode.
 * This enables deep-linking from password reset emails.
 *
 * @returns Nothing (side-effect only).
 */
export const usePasswordResetEmail = () => {
  const location = useLocation();
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
  }, [form, resetID]);
};

/**
 * Reads the `registration_key` query param and, when present, switches the form into sign-up confirmation mode.
 * This enables deep-linking from registration emails.
 *
 * @returns Nothing (side-effect only).
 */
export const useSignUpEmail = () => {
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
  }, [form, registration_key]);
};

/**
 * Handles the OAuth callback flow:
 * - detects the OAuth provider from the URL
 * - exchanges the query string for a temporary token via the backend
 * - transitions the login form into the SSO confirmation step
 *
 * @returns Nothing (side-effect only).
 */
export const useOAuthLogin = () => {
  const { t } = useTranslation(['login']);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { showErrorMessage } = useAppSnackbar();

  const form = useLoginForm();
  const resetLogin = useLoginReset();

  const provider = useMemo<string | null>(() => {
    const marker = '/oauth/';
    if (!pathname.includes(marker)) return null;
    const tail = pathname.split(marker).pop() ?? '';
    const normalized = tail.replace(/\/$/, '');
    return normalized || null;
  }, [pathname]);

  const params = useMemo<URLSearchParams>(() => {
    const p = new URLSearchParams(search);

    if (provider && !p.has('provider')) {
      p.set('provider', provider);
    }
    return p;
  }, [provider, search]);

  useAPIQuery<{ avatar: string; username: string; oauth_token_id: string; email_adr: string }>({
    url: `/api/v4/auth/oauth/?${params.toString()}`,
    disabled: !provider,
    onEnter: () => {
      form.setFieldValue('mode', 'loading');
      form.setFieldValue('loading', t('oauth.loading'));
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
      navigate('/signin/');
    }
  });
};

/**
 * Handles the SAML callback flow by decoding the `data` query param and transitioning the login form into SSO mode.
 *
 * @returns Nothing (side-effect only).
 */
export const useSAMLLogin = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { showErrorMessage } = useAppSnackbar();

  const form = useLoginForm();
  const resetLogin = useLoginReset();

  const samlData = useMemo<{ username: string; email: string; saml_token_id: string; error: string }>(() => {
    try {
      if (pathname.includes(`/saml/`)) {
        const params = new URLSearchParams(search);
        const data = params.get('data');
        if (data != null && data !== '') {
          return JSON.parse(atob(data));
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
      navigate('/signin/');
    }
  }, [form, navigate, resetLogin, samlData, showErrorMessage]);
};

/**
 * Returns `true` when the current auth configuration implies there is only one viable login choice (so the UI can skip
 * the "choose login method" step).
 *
 * @returns Whether the user should be auto-forwarded into the SSO confirmation step.
 */
export const useQuickLogin = () => {
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  return (allowSAML && (oAuthProviders?.length ?? 0) === 0) || (!allowSAML && (oAuthProviders?.length ?? 0) === 1);
};

/**
 * Performs a login request using the current form values (username/password/OTP/SSO tokens).
 * On success, invalidates the `whoami` query and navigates to any stored post-login redirect.
 *
 * @returns A mutation object with a `mutate()` method that triggers the login attempt.
 */
export const useLoginRequest = () => {
  const { t } = useTranslation(['login']);
  const navigate = useNavigate();
  const { showErrorMessage } = useAppSnackbar();
  const form = useLoginForm();

  const redirectTo = useAppConfigStore(s => s.auth.redirectTo);
  const setStore = useAppConfigSetStore();
  const resetLogin = useLoginReset();
  const saveSettings = useSaveAppConfig();

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
      form.setFieldValue('loading', t('login.loading'));
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
      invalidateAPIQuery(({ url }) => '/api/v4/user/whoami/' === url, 0);

      if (redirectTo) {
        navigate(redirectTo);
        setStore(s => {
          s.auth.redirectTo = null;
          return s;
        });
        saveSettings();
      }
    }
  }));
};
