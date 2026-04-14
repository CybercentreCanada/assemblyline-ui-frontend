import type { i18n } from 'i18next';
import { MODULE_NAME } from '../name';
import en from './en.json';
import fr from './fr.json';

export function addTranslations(i18n: i18n) {
  i18n.addResourceBundle('en', MODULE_NAME, en);
  i18n.addResourceBundle('fr', MODULE_NAME, fr);
}
