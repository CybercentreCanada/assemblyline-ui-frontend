import Editor, { loader } from '@monaco-editor/react';
import { Alert, LinearProgress, useTheme } from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

type Props = {
  yara_signature: string;
  error: any;
  beautify: boolean;
};

const WrappedMonacoViewer = ({ yara_signature = null, error = null, beautify = false }: Props) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const { isDark: isDarkTheme } = useAppTheme();

  const containerEL = useRef<HTMLDivElement>();

  useEffectOnce(() => {
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const beautifyJSON = inputData => {
    if (!beautify) return inputData;

    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  };

  return yara_signature !== null && yara_signature !== undefined ? (
    <div ref={containerEL} style={{ flexGrow: 1, border: `1px solid ${theme.palette.divider}`, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <ReactResizeDetector handleHeight handleWidth targetRef={containerEL}>
          {({ width, height }) => (
            <div ref={containerEL}>
              <Editor
                language="yara"
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                value={beautifyJSON(yara_signature)}
                options={{ links: false, readOnly: true }}
              />
            </div>
          )}
        </ReactResizeDetector>
      </div>
    </div>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

export const MonacoViewer = React.memo(WrappedMonacoViewer);
