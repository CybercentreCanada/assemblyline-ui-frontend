import type { BabelOptions } from '@vitejs/plugin-react';
import type { PluginOptions } from 'babel-plugin-react-compiler';

export const createReactCompilerBabelOptions = (env: Record<string, string>): BabelOptions => {
  const compilerOptions: PluginOptions = {
    compilationMode: 'annotation',
    target: '19',
    panicThreshold: 'none',
    logger:
      env.REACT_COMPILER_DEBUG === 'true'
        ? {
            logEvent(filename, event) {
              if (event.kind === 'CompileSuccess') {
                console.info('[react-compiler]', event.kind, filename);
              } else if (event.kind === 'CompileError' || event.kind === 'PipelineError') {
                console.error('[react-compiler]', event.kind, filename, event);
              }
            }
          }
        : undefined
  };

  return {
    plugins: env.REACT_COMPILER === 'false' ? [] : [['babel-plugin-react-compiler', compilerOptions]],
    ignore: [/\.(?:test|spec|pom)\.[jt]sx?$/]
  };
};
