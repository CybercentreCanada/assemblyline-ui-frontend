import type { ROLES } from 'components/models/base/user';

export type PossibleColor = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const METHOD_COLOR: Record<Method, PossibleColor> = {
  DELETE: 'error',
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'default'
};

export const STATUS_CODE_COLOR: Record<number, PossibleColor> = {
  1: 'info',
  2: 'success',
  3: 'warning',
  4: 'error',
  5: 'error'
};

export const ROLES_COLOR: Record<(typeof ROLES)[number], PossibleColor> = {
  archive_comment: 'default',
  administration: 'error',
  alert_manage: 'info',
  alert_view: 'default',
  apikey_access: 'default',
  archive_download: 'warning',
  archive_manage: 'info',
  archive_trigger: 'warning',
  archive_view: 'default',
  assistant_use: 'info',
  badlist_manage: 'info',
  badlist_view: 'default',
  bundle_download: 'warning',
  external_query: 'default',
  file_detail: 'default',
  file_download: 'warning',
  file_purge: 'default',
  heuristic_view: 'default',
  obo_access: 'default',
  replay_system: 'info',
  replay_trigger: 'warning',
  retrohunt_run: 'default',
  retrohunt_view: 'default',
  safelist_manage: 'info',
  safelist_view: 'default',
  self_manage: 'info',
  signature_download: 'warning',
  signature_import: 'success',
  signature_manage: 'info',
  signature_view: 'default',
  submission_create: 'success',
  submission_customize: 'info',
  submission_delete: 'error',
  submission_manage: 'info',
  submission_view: 'default',
  workflow_manage: 'info',
  workflow_view: 'default'
};
