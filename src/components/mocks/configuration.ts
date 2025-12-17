import type { Configuration } from 'components/models/base/config';

export const MOCK_CONFIGURATION: Configuration = {
  auth: {
    allow_2fa: true,
    allow_apikeys: true,
    allow_extended_apikeys: true,
    allow_security_tokens: true,
    apikey_max_dtl: null
  },
  core: {
    archiver: {
      alternate_dtl: 0,
      metadata: undefined,
      minimum_required_services: [],
      use_metadata: false
    },
    ingester: {
      default_max_extracted: 0,
      default_max_supplementary: 0
    },
    scaler: {
      service_defaults: {
        min_instances: 0
      }
    }
  },
  datastore: {
    archive: {
      enabled: false
    }
  },
  retrohunt: {
    dtl: 30,
    enabled: false,
    max_dtl: 0
  },
  submission: {
    dtl: 30,
    file_sources: {
      md5: {
        auto_selected: ['Assemblyline'],
        pattern: '^[a-f0-9]{32}$',
        sources: ['Assemblyline']
      },
      sha1: {
        auto_selected: [],
        pattern: '^[a-f0-9]{40}$',
        sources: ['Assemblyline']
      },
      sha256: {
        auto_selected: [],
        pattern: '^[a-f0-9]{64}$',
        sources: ['Assemblyline']
      },
      ssdeep: {
        auto_selected: [],
        pattern: '^[0-9]{1,18}:[a-zA-Z0-9/+]{0,64}:[a-zA-Z0-9/+]{0,64}$',
        sources: []
      },
      tlsh: {
        auto_selected: [],
        pattern: '^((?:T1)?[0-9a-fA-F]{70})$',
        sources: []
      },
      url: {
        auto_selected: [],
        pattern: '',
        sources: []
      }
    },
    max_dtl: 0,
    max_file_size: 104857600,
    metadata: {
      archive: {},
      submit: {},
      ingest: undefined,
      strict_schemes: []
    },
    profiles: {
      static: {
        description:
          'Analyze files using static analysis techniques and extract information from the file without executing it, such as metadata, strings, and structural information.',
        display_name: '[OFFLINE] Static Analysis',
        params: {
          services: {
            excluded: [],
            rescan: [],
            resubmit: [],
            selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking']
          }
        },
        restricted_params: {}
      },
      static_and_dynamic_with_internet: {
        description:
          'Perform comprehensive file analysis using traditional static and dynamic analysis techniques with internet access.',
        display_name: '[ONLINE] Static + Dynamic Analysis',
        params: {
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
          }
        },
        restricted_params: {}
      },
      static_with_dynamic: {
        description:
          'Analyze files using static analysis techniques along with executing them in a controlled environment to observe their behavior and capture runtime activities, interactions with the system, network communications, and any malicious behavior exhibited by the file during execution.',
        display_name: '[OFFLINE] Static + Dynamic Analysis',
        params: {
          services: {
            excluded: [],
            rescan: [],
            resubmit: [],
            selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Dynamic Analysis']
          }
        },
        restricted_params: {}
      },
      static_with_internet: {
        description:
          'Combine traditional static analysis techniques with internet-connected services to gather additional information and context about the file being analyzed.',
        display_name: '[ONLINE] Static Analysis',
        params: {
          services: {
            excluded: [],
            rescan: [],
            resubmit: [],
            selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Internet Connected']
          }
        },
        restricted_params: {}
      }
    },
    verdicts: {
      highly_suspicious: 700,
      info: 0,
      malicious: 1000,
      suspicious: 300
    },
    default_max_extracted: 0,
    default_max_supplementary: 0,
    max_extraction_depth: 0,
    max_metadata_length: 0,
    tag_types: {
      attribution: [],
      behavior: [],
      ioc: []
    }
  },
  system: {
    organisation: 'ACME',
    type: 'development',
    version: '4.6.0.dev0',
    support: {
      documentation: 'https://cybercentrecanada.github.io/assemblyline4_docs/',
      email: null
    }
  },
  ui: {
    ai: {
      enabled: false
    },
    alerting_meta: {
      important: [
        'original_source',
        'protocol',
        'subject',
        'submitted_url',
        'source_url',
        'url',
        'web_url',
        'from',
        'to',
        'cc',
        'bcc',
        'ip_src',
        'ip_dst',
        'source'
      ],
      subject: ['subject'],
      url: ['submitted_url', 'source_url', 'url', 'web_url']
    },
    allow_malicious_hinting: false,
    allow_raw_downloads: true,
    allow_replay: false,
    allow_url_submissions: true,
    allow_zip_downloads: true,
    api_proxies: {},
    apps: [],
    banner: null,
    banner_level: 'info',
    community_feed: 'https://alpytest.blob.core.windows.net/pytest/community.json',
    enforce_quota: false,
    external_links: {
      hash: undefined,
      metadata: undefined,
      tag: undefined
    },
    external_source_tags: {},
    external_sources: [],
    fqdn: "hostname -I | awk '{print $1}'`.nip.io",
    read_only: false,
    rss_feeds: [
      'https://alpytest.blob.core.windows.net/pytest/stable.json',
      'https://alpytest.blob.core.windows.net/pytest/services.json',
      'https://alpytest.blob.core.windows.net/pytest/community.json',
      'https://alpytest.blob.core.windows.net/pytest/blog.json'
    ],
    services_feed: 'https://alpytest.blob.core.windows.net/pytest/services.json',
    tos: false,
    tos_lockout: false,
    tos_lockout_notify: false,
    url_submission_auto_service_selection: ['URLDownloader'],
    audit: false,
    default_zip_password: '',
    download_encoding: 'cart',
    ingest_max_priority: 0
  },
  user: {
    api_priv_map: {
      CUSTOM: ['C'],
      EXTENDED: ['R', 'W', 'E'],
      READ: ['R'],
      READ_WRITE: ['R', 'W'],
      WRITE: ['W']
    },
    priv_role_dependencies: {
      C: [],
      E: [
        'administration',
        'apikey_access',
        'file_purge',
        'obo_access',
        'replay_system',
        'self_manage',
        'signature_import',
        'signature_manage',
        'workflow_manage'
      ],
      R: [
        'alert_view',
        'archive_view',
        'archive_download',
        'badlist_view',
        'bundle_download',
        'external_query',
        'file_detail',
        'file_download',
        'heuristic_view',
        'safelist_view',
        'signature_download',
        'signature_view',
        'submission_view',
        'workflow_view',
        'retrohunt_view'
      ],
      W: [
        'alert_manage',
        'archive_trigger',
        'archive_manage',
        'badlist_manage',
        'replay_trigger',
        'safelist_manage',
        'submission_create',
        'submission_delete',
        'submission_manage',
        'submission_customize',
        'retrohunt_run'
      ]
    },
    role_dependencies: {
      admin: [
        'external_query',
        'archive_trigger',
        'signature_download',
        'submission_view',
        'retrohunt_view',
        'archive_manage',
        'archive_download',
        'apikey_access',
        'assistant_use',
        'heuristic_view',
        'replay_system',
        'administration',
        'archive_comment',
        'submission_manage',
        'self_manage',
        'badlist_manage',
        'alert_manage',
        'archive_view',
        'safelist_manage',
        'file_detail',
        'badlist_view',
        'submission_create',
        'replay_trigger',
        'workflow_view',
        'bundle_download',
        'alert_view',
        'obo_access',
        'signature_manage',
        'retrohunt_run',
        'submission_delete',
        'safelist_view',
        'workflow_manage',
        'signature_view',
        'file_purge',
        'file_download',
        'submission_customize',
        'signature_import'
      ],
      signature_importer: [
        'signature_download',
        'safelist_manage',
        'self_manage',
        'badlist_manage',
        'signature_view',
        'signature_import'
      ],
      signature_manager: [
        'external_query',
        'archive_trigger',
        'signature_download',
        'submission_view',
        'retrohunt_view',
        'archive_manage',
        'archive_download',
        'apikey_access',
        'heuristic_view',
        'archive_comment',
        'submission_manage',
        'self_manage',
        'badlist_manage',
        'alert_manage',
        'archive_view',
        'safelist_manage',
        'file_detail',
        'badlist_view',
        'submission_create',
        'replay_trigger',
        'workflow_view',
        'bundle_download',
        'alert_view',
        'obo_access',
        'signature_manage',
        'retrohunt_run',
        'submission_delete',
        'safelist_view',
        'workflow_manage',
        'signature_view',
        'file_download',
        'submission_customize'
      ],
      submitter: ['submission_create', 'apikey_access', 'replay_trigger', 'obo_access', 'retrohunt_run', 'self_manage'],
      user: [
        'external_query',
        'archive_trigger',
        'signature_download',
        'submission_view',
        'retrohunt_view',
        'archive_manage',
        'heuristic_view',
        'archive_comment',
        'submission_manage',
        'self_manage',
        'badlist_manage',
        'alert_manage',
        'archive_view',
        'safelist_manage',
        'file_detail',
        'submission_create',
        'bundle_download',
        'alert_view',
        'obo_access',
        'submission_delete',
        'safelist_view',
        'workflow_manage',
        'file_download',
        'submission_customize',
        'archive_download',
        'apikey_access',
        'badlist_view',
        'replay_trigger',
        'workflow_view',
        'retrohunt_run',
        'signature_view'
      ],
      viewer: [
        'badlist_view',
        'file_detail',
        'submission_view',
        'apikey_access',
        'workflow_view',
        'heuristic_view',
        'obo_access',
        'alert_view',
        'safelist_view',
        'self_manage',
        'signature_view'
      ],
      custom: []
    },
    roles: [
      'external_query',
      'archive_trigger',
      'signature_download',
      'submission_view',
      'retrohunt_view',
      'archive_manage',
      'archive_download',
      'apikey_access',
      'assistant_use',
      'heuristic_view',
      'replay_system',
      'administration',
      'archive_comment',
      'submission_manage',
      'self_manage',
      'badlist_manage',
      'alert_manage',
      'archive_view',
      'safelist_manage',
      'file_detail',
      'badlist_view',
      'submission_create',
      'replay_trigger',
      'workflow_view',
      'bundle_download',
      'alert_view',
      'obo_access',
      'signature_manage',
      'retrohunt_run',
      'submission_delete',
      'safelist_view',
      'workflow_manage',
      'signature_view',
      'file_purge',
      'file_download',
      'submission_customize',
      'signature_import'
    ],
    types: ['admin', 'user', 'signature_manager', 'signature_importer', 'viewer', 'submitter']
  }
};
