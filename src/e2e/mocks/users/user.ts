import type { WhoAmIProps } from 'components/hooks/useMyUser';
import { MOCK_CLASSIFICATION_DEFINITION } from 'e2e/mocks/users/__classification__';
import { MOCK_CONFIGURATION } from 'e2e/mocks/users/__configuration__';
import { MOCK_INDEXES } from 'e2e/mocks/users/__indexes__';
import { MOCK_SERVICE_SPEC, MOCK_SERVICES } from 'e2e/mocks/users/__settings__';

export const MOCK_USER_WHOAMI: WhoAmIProps = {
  agrees_with_tos: '2000-01-01T00:00:00.000000Z',
  api_daily_quota: 1000,
  avatar: null,
  c12nDef: MOCK_CLASSIFICATION_DEFINITION,
  classification: 'TLP:AMBER+STRICT//COMMERCIAL//REL TO CSE',
  classification_aliases: {},
  configuration: MOCK_CONFIGURATION,
  email: 'user@assemblyline.cyber.gc.ca',
  groups: [],
  indexes: MOCK_INDEXES,
  is_active: true,
  is_admin: true,
  name: 'User',
  roles: [
    'alert_view',
    'apikey_access',
    'archive_comment',
    'archive_view',
    'badlist_view',
    'file_detail',
    'heuristic_view',
    'retrohunt_view',
    'safelist_view',
    'self_manage',
    'signature_view',
    'submission_create',
    'submission_view',
    'workflow_view'
  ],
  settings: {
    default_external_sources: [],
    default_zip_password: 'infected',
    download_encoding: 'cart',
    executive_summary: true,
    expand_min_score: 500,
    preferred_submission_profile: 'default',
    service_spec: MOCK_SERVICE_SPEC,
    services: MOCK_SERVICES,
    submission_profiles: {
      default: {
        classification: 'TLP:CLEAR',
        deep_scan: false,
        generate_alert: false,
        ignore_cache: false,
        ignore_filtering: false,
        ignore_recursion_prevention: false,
        priority: 1000,
        service_spec: {},
        services: {
          selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking'],
          excluded: [],
          rescan: [],
          resubmit: []
        },
        ttl: 30
      },
      static: {
        classification: 'TLP:CLEAR',
        deep_scan: false,
        generate_alert: false,
        ignore_cache: false,
        ignore_filtering: false,
        ignore_recursion_prevention: false,
        priority: 1000,
        service_spec: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking']
        },
        ttl: 30
      },
      static_and_dynamic_with_internet: {
        classification: 'TLP:CLEAR',
        deep_scan: false,
        generate_alert: false,
        ignore_cache: false,
        ignore_filtering: false,
        ignore_recursion_prevention: false,
        priority: 1000,
        service_spec: {
          CAPE: {
            routing: 'internet'
          },
          URLDownloader: {
            proxy: 'localhost_proxy'
          }
        },
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: [
            'Filtering',
            'Antivirus',
            'Static Analysis',
            'Extraction',
            'Networking',
            'Internet Connected',
            'Dynamic Analysis'
          ]
        },
        ttl: 30
      },
      static_with_dynamic: {
        classification: 'TLP:CLEAR',
        deep_scan: false,
        generate_alert: false,
        ignore_cache: false,
        ignore_filtering: false,
        ignore_recursion_prevention: false,
        priority: 1000,
        service_spec: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Dynamic Analysis']
        },
        ttl: 30
      },
      static_with_internet: {
        classification: 'TLP:CLEAR',
        deep_scan: false,
        generate_alert: false,
        ignore_cache: false,
        ignore_filtering: false,
        ignore_recursion_prevention: false,
        priority: 1000,
        service_spec: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Internet Connected']
        },
        ttl: 30
      }
    },

    // This has been added
    submission_view: 'report',
    classification: '',
    deep_scan: false,
    description: '',
    generate_alert: false,
    ignore_cache: false,
    ignore_dynamic_recursion_prevention: false,
    ignore_filtering: false,
    ignore_recursion_prevention: false,
    initial_data: '',
    malicious: false,
    priority: 0,
    ttl: 0
    // to here
  },
  submission_daily_quota: 0,
  type: ['user'],

  // this has been added
  username: 'user',
  system_message: {
    user: '',
    title: '',
    severity: 'error',
    message: ''
  },
  api_quota: 0,
  apikeys: undefined,
  apps: undefined,
  can_impersonate: false,
  id: '',
  password: '',
  submission_quota: 0,
  security_tokens: [],
  uname: '',
  dynamic_group: ''
  // to here
};
