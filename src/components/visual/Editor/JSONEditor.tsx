import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import 'moment/locale/fr';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

type Props = {
  data: string;
  isEditable?: boolean;
  beautify?: boolean;
  onDataChange?: (d: object) => void;
  reload?: () => void;
};

export const WrappedJSONEditor = ({
  data = null,
  isEditable = true,
  beautify = false,
  onDataChange = () => null,
  reload = () => null
}: Props) => {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const { isDark: isDarkTheme } = useAppTheme();

  useEffect(() => {
    if (!data) reload();
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const beforeMount = monaco => {};

  const onMount = editor => {
    editor.focus();
  };

  const beautifyJSON = inputData => {
    if (!beautify) return inputData;

    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  };

  if (!data) return null;
  else
    return (
      <div
        ref={containerEL}
        style={{
          flexGrow: 1,
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <ReactResizeDetector handleHeight handleWidth targetRef={containerEL}>
            {({ width, height }) => (
              <div ref={containerEL}>
                <Editor
                  language="json"
                  width={width}
                  height={height}
                  theme={isDarkTheme ? 'vs-dark' : 'vs'}
                  loading={t('loading.yara')}
                  value={beautifyJSON(data)}
                  beforeMount={beforeMount}
                  onMount={onMount}
                  options={{ links: false, readOnly: !isEditable }}
                />
              </div>
            )}
          </ReactResizeDetector>
        </div>
      </div>
    );
};

export const JSONEditor = React.memo(WrappedJSONEditor);
export default JSONEditor;
