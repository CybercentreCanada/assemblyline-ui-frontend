import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import { registerYaraCompletionItemProvider, yaraConfig, yaraDef } from 'helpers/yara';
import 'moment/locale/fr';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

type Props = {
  data: string;
  isEditable?: boolean;
  onDataChange?: (value: string) => void;
  reload?: () => void;
};

export const WrappedYaraEditor = ({
  data = ``,
  isEditable = true,
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

  const beforeMount = monaco => {
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'yara')) {
      // Register a new language
      monaco.languages.register({ id: 'yara' });
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('yara', yaraDef);
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration('yara', yaraConfig);
      // Set the yara snippets
      monaco.languages.registerCompletionItemProvider('yara', registerYaraCompletionItemProvider(monaco));
    }
  };

  const onMount = editor => {
    editor.focus();
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
                  language="yara"
                  width={width}
                  height={height}
                  theme={isDarkTheme ? 'vs-dark' : 'vs'}
                  loading={t('loading.yara')}
                  value={data}
                  onChange={value => onDataChange(value)}
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

export const YaraEditor = React.memo(WrappedYaraEditor);
export default YaraEditor;
