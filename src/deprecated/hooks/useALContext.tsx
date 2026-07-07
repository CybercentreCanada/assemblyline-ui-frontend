import { useAppConfig } from 'core/config';
import { useCallback, useMemo } from 'react';

export const useALContext = () => {
  const c12nDef = useAppConfig(s => s.c12nDef);
  const classificationAliases = useAppConfig(s => s.classificationAliases);
  const configuration = useAppConfig(s => s.configuration);
  const indexes = useAppConfig(s => s.indexes);
  const settings = useAppConfig(s => s.settings);
  const systemMessage = useAppConfig(s => s.systemMessage);
  const user = useAppConfig(s => s.user);

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

  return useMemo(
    () => ({
      c12nDef,
      classificationAliases,
      configuration,
      indexes,
      settings,
      systemMessage,
      user,
      scoreToVerdict
    }),
    [c12nDef, classificationAliases, configuration, indexes, scoreToVerdict, settings, systemMessage, user]
  );
};

export default useALContext;
