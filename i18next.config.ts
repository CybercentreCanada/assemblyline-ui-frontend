import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'fr'],
  extract: {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    keySeparator: false,
    nsSeparator: ':',
    output: (language, namespace) => `src/locales/${language}/${namespace}.json`,
    removeUnusedKeys: true
  }
});
