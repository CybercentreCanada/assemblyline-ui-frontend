import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import { registerYaraCompletionItemProvider, yaraConfig, yaraDef } from 'helpers/yara';
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
  | 'lisp'
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

export const LANGUAGE_SELECTOR: Record<string, Language> = {
  'assemblyline/ontology': 'json',
  'text/json': 'json',
  'text/jsons': 'json',
  'code/vbe': 'vb',
  'code/vbs': 'vb',
  'code/wsf': 'xml',
  'code/batch': 'bat',
  'code/ps1': 'powershell',
  'text/ini': 'ini',
  'text/autorun': 'ini',
  'code/java': 'java',
  'code/python': 'python',
  'code/php': 'php',
  'code/shell': 'shell',
  'code/xml': 'xml',
  'code/yaml': 'yaml',
  'code/javascript': 'javascript',
  'code/jscript': 'javascript',
  'code/typescript': 'typescript',
  'code/xfa': 'xml',
  'code/html': 'html',
  'code/hta': 'html',
  'code/html/component': 'html',
  'code/csharp': 'csharp',
  'code/jsp': 'java',
  'code/c': 'cpp',
  'code/h': 'cpp',
  'code/clickonce': 'xml',
  'code/css': 'css',
  'code/markdown': 'markdown',
  'code/sql': 'sql',
  'code/go': 'go',
  'code/ruby': 'ruby',
  'code/perl': 'perl',
  'code/rust': 'rust',
  'code/lisp': 'lisp'
};

// Supported Options
interface Options {
  readOnly?: boolean;
  links?: boolean;
  beautify?: boolean;
}

type EditorProps = {
  diff?: boolean;
  value?: string;
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
                original={language === 'json' && options?.beautify ? beautifyJSON(original) : original}
                modified={language === 'json' && options?.beautify ? beautifyJSON(modified) : modified}
                loading={t('loading')}
                options={{ links: false, renderSideBySide: false, readOnly: true, ...options }}
              />
            ) : (
              <Editor
                language={language}
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                loading={t('loading')}
                value={language === 'json' && options?.beautify ? beautifyJSON(value) : value}
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
