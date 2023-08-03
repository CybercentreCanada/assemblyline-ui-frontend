import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import 'moment/locale/fr';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

// Supported Languages
type Language =
  | 'abap'
  | 'aes'
  | 'apex'
  | 'azcli'
  | 'bat'
  | 'bicep'
  | 'c'
  | 'cameligo'
  | 'clojure'
  | 'coffeescript'
  | 'cpp'
  | 'csharp'
  | 'csp'
  | 'css'
  | 'cypher'
  | 'dart'
  | 'dockerfile'
  | 'ecl'
  | 'elixir'
  | 'flow9'
  | 'freemarker2.tag-angle.interpolation-bracket'
  | 'freemarker2.tag-angle.interpolation-dollar'
  | 'freemarker2.tag-auto.interpolation-bracket'
  | 'freemarker2.tag-auto.interpolation-dollar'
  | 'freemarker2.tag-bracket.interpolation-bracket'
  | 'freemarker2.tag-bracket.interpolation-dollar'
  | 'freemarker2'
  | 'fsharp'
  | 'go'
  | 'graphql'
  | 'handlebars'
  | 'hcl'
  | 'html'
  | 'ini'
  | 'java'
  | 'javascript'
  | 'json'
  | 'julia'
  | 'kotlin'
  | 'less'
  | 'lexon'
  | 'liquid'
  | 'lua'
  | 'm3'
  | 'markdown'
  | 'mips'
  | 'msdax'
  | 'mysql'
  | 'objective-c'
  | 'pascal'
  | 'pascaligo'
  | 'perl'
  | 'pgsql'
  | 'php'
  | 'pla'
  | 'plaintext'
  | 'postiats'
  | 'powerquery'
  | 'powershell'
  | 'proto'
  | 'pug'
  | 'python'
  | 'qsharp'
  | 'r'
  | 'razor'
  | 'redis'
  | 'redshift'
  | 'restructuredtext'
  | 'ruby'
  | 'rust'
  | 'sb'
  | 'scala'
  | 'scheme'
  | 'scss'
  | 'shell'
  | 'sol'
  | 'sparql'
  | 'sql'
  | 'st'
  | 'swift'
  | 'systemverilog'
  | 'tcl'
  | 'twig'
  | 'typescript'
  | 'vb'
  | 'verilog'
  | 'xml'
  | 'yaml'
  | 'yara';

// Supported Options
interface Options {
  readOnly?: boolean;
  links?: boolean;
  beautify?: boolean;
}

type EditorProps = {
  diff?: boolean;
  value?: string;
  test: unknown;
  language?: Language;
  options?: Options;
  onChange?: (value: string) => void;
  reload?: () => void;
};

type DiffEditorProps = {
  diff?: boolean;
  original?: string;
  modified?: string;
  language?: Language;
  options?: Options;
  onChange?: (value: string) => void;
  reload?: () => void;
};

const WrappedMonacoEditor: React.FC<EditorProps | DiffEditorProps> = ({
  diff = false,
  value,
  original,
  modified,
  language = 'plaintext',
  options = {},
  onChange = () => null,
  reload = () => null
}: EditorProps & DiffEditorProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();

  useEffect(() => {
    if (!value) reload();
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const beforeMount = useCallback(monaco => {
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'magic')) {
      // Register a new language
      monaco.languages.register({ id: 'magic' });
    }
  }, []);

  const onMount = useCallback(editor => {
    editor.focus();
  }, []);

  const beautifyJSON = useCallback(inputData => {
    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  }, []);

  return (
    <div
      style={{
        flexGrow: 1,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <AutoSizer>
          {({ width, height }) =>
            diff ? (
              <DiffEditor
                language={language}
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                original={original}
                modified={modified}
                loading={t('loading')}
                options={{ links: false, renderSideBySide: false, readOnly: true }}
              />
            ) : (
              <Editor
                language={language}
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                loading={t('loading')}
                value={language === 'json' && options.beautify ? beautifyJSON(value) : value}
                onChange={v => onChange(v)}
                beforeMount={beforeMount}
                onMount={onMount}
                options={{ links: false, readOnly: false, ...options }}
              />
            )
          }
        </AutoSizer>
      </div>
    </div>
  );
};

export const MonacoEditor = React.memo(WrappedMonacoEditor);
export default MonacoEditor;
