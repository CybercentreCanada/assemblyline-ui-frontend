import type { i18n } from 'i18next';
import { MODULE_NAME } from '../name';
import en_c from './c/en.json';
import fr_c from './c/fr.json';
import en from './en.json';
import fr from './fr.json';
import en_pa from './pa/en.json';
import fr_pa from './pa/fr.json';
import en_pb from './pb/en.json';
import fr_pb from './pb/fr.json';
import en_pc from './pc/en.json';
import fr_pc from './pc/fr.json';
import en_s from './s/en.json';
import fr_s from './s/fr.json';
import en_ts from './ts/en.json';
import fr_ts from './ts/fr.json';
import en_u from './u/en.json';
import fr_u from './u/fr.json';

export function addTranslations(i18n: i18n) {
  i18n.addResourceBundle('en', MODULE_NAME, en);
  i18n.addResourceBundle('fr', MODULE_NAME, fr);
  i18n.addResourceBundle('en', `${MODULE_NAME}.u`, en_u);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.u`, fr_u);
  i18n.addResourceBundle('en', `${MODULE_NAME}.pa`, en_pa);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.pa`, fr_pa);
  i18n.addResourceBundle('en', `${MODULE_NAME}.pb`, en_pb);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.pb`, fr_pb);
  i18n.addResourceBundle('en', `${MODULE_NAME}.pc`, en_pc);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.pc`, fr_pc);
  i18n.addResourceBundle('en', `${MODULE_NAME}.c`, en_c);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.c`, fr_c);
  i18n.addResourceBundle('en', `${MODULE_NAME}.s`, en_s);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.s`, fr_s);
  i18n.addResourceBundle('en', `${MODULE_NAME}.ts`, en_ts);
  i18n.addResourceBundle('fr', `${MODULE_NAME}.ts`, fr_ts);
}
