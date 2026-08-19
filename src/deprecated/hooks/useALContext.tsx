import { useAppConfigStore } from 'core/config';
import { useCallback, useMemo } from 'react';

export const useALContext = () => {
  const c12nDef = useAppConfigStore(s => s.c12nDef);
  const classificationAliases = useAppConfigStore(s => s.classificationAliases);
  const configuration = useAppConfigStore(s => s.configuration);
  const indexes = useAppConfigStore(s => s.indexes);
  const settings = useAppConfigStore(s => s.settings);
  const systemMessage = useAppConfigStore(s => s.systemMessage);
  const user = useAppConfigStore(s => s.user);

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
