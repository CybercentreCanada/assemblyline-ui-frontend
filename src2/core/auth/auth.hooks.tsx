import { useAppConfigStore } from 'core/config';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';

export const useScoreToVerdict = () => {
  const verdicts = useAppConfigStore(s => s?.configuration?.submission?.verdicts);

  return useCallback(
    (score: number | null) => {
      if (score >= verdicts.malicious) return 'malicious';
      else if (score >= verdicts.highly_suspicious) return 'highly_suspicious';
      else if (score >= verdicts.suspicious) return 'suspicious';
      else if (score === null || score >= verdicts.info) return 'info';
      else return 'safe';
    },
    [verdicts]
  );
};

export const useIsAppReady = () => {
  const agrees_with_tos = useAppConfigStore(s => s?.user?.agrees_with_tos);
  const is_active = useAppConfigStore(s => s?.user?.is_active);
  const tos = useAppConfigStore(s => s?.configuration?.ui?.tos);

  return useMemo(() => is_active && (agrees_with_tos || !tos), []);
};

export const useIsAuthenticating = () => {
  const { pathname } = useLocation();

  return useMemo(
    () => pathname.includes(`/oauth/`) || pathname.includes(`/saml/`) || pathname.includes(`/signin/`),
    [pathname]
  );
};
