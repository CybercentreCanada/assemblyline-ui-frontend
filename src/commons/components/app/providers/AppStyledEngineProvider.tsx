import { StyledEngineProvider } from '@mui/material';
import { useAppConfigs } from 'commons/components/app/hooks';
import type { FC, PropsWithChildren } from 'react';

export const AppStyledEngineProvider: FC<PropsWithChildren> = ({ children }) => {
  const { overrides } = useAppConfigs();
  const _styledEngine = overrides?.providers?.styledEngine?.provider;

  if (_styledEngine) {
    return <_styledEngine>{children}</_styledEngine>;
  }

  return <StyledEngineProvider>{children}</StyledEngineProvider>;
};
