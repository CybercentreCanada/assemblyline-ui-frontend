import { useAppConfig } from 'core/config';
import { useCallback } from 'react';

export const useALContext = () => {
  const s = useAppConfig(s => s);

  const configuration = useAppConfig(s => s.configuration);

  const scoreToVerdict = useCallback(
    (score: number | null) => {
      if (score >= configuration.submission.verdicts.malicious) {
        return 'malicious';
      }

      if (score >= configuration.submission.verdicts.highly_suspicious) {
        return 'highly_suspicious';
      }

      if (score >= configuration.submission.verdicts.suspicious) {
        return 'suspicious';
      }

      if (score === null || score >= configuration.submission.verdicts.info) {
        return 'info';
      }

      return 'safe';
    },
    [
      configuration?.submission?.verdicts?.highly_suspicious,
      configuration?.submission?.verdicts?.info,
      configuration?.submission?.verdicts?.malicious,
      configuration?.submission?.verdicts?.suspicious
    ]
  );

  return {
    ...s,
    scoreToVerdict
  };
};

export default useALContext;
