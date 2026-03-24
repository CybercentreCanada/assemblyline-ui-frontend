import type { AppConfig } from 'core/config/config.models';

export const APP_CONFIG_LOCAL_STORAGE_KEY = 'al.settings';

export const DEFAULT_APP_CONFIG: AppConfig = {
  api: {
    staleTime: 0,
    gcTime: 0,
    showDevtools: false
  },
  auth: {
    login: null,
    mode: 'loading',
    disableWhoAmI: false,
    preferredMethod: null,
    redirectTo: null
  },
  layout: {
    mode: 'side',
    left_nav: {
      open: true,
      width: 500
    }
  },
  // config: {
  //   storageKey: 'al.storage'
  // },
  quota: {
    api: null,
    submission: null
  },
  router: {
    maxPanels: 3,
    maxNodes: 3
  },
  snackbar: {
    dense: true,
    maxSnack: 3
  },
  theme: {
    mode: 'system',
    variant: 'default'
  },
  c12nDef: undefined,
  classificationAliases: undefined,
  configuration: {
    auth: {
      allow_2fa: false,
      allow_apikeys: false,
      allow_extended_apikeys: false,
      allow_security_tokens: false,
      apikey_max_dtl: 0
    },
    core: {
      archiver: {
        alternate_dtl: 0,
        metadata: undefined,
        minimum_required_services: [],
        use_metadata: false,
        use_webhook: false,
        webhook: undefined
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
      enabled: false,
      dtl: 0,
      max_dtl: 0
    },
    submission: {
      default_max_extracted: 0,
      default_max_supplementary: 0,
      dtl: 0,
      file_sources: undefined,
      max_dtl: 0,
      max_extraction_depth: 0,
      max_file_size: 0,
      max_metadata_length: 0,
      metadata: {
        archive: undefined,
        ingest: undefined,
        strict_schemes: [],
        submit: undefined
      },
      profiles: undefined,
      tag_types: {
        attribution: [],
        behavior: [],
        ioc: []
      },
      verdicts: {
        info: 0,
        suspicious: 0,
        highly_suspicious: 0,
        malicious: 0
      }
    },
    system: {
      organisation: '',
      support: {
        documentation: '',
        email: ''
      },
      type: 'production',
      version: ''
    },
    ui: {
      ai: {
        enabled: false
      },
      alerting_meta: {
        important: [],
        subject: [],
        url: []
      },
      allow_malicious_hinting: false,
      allow_raw_downloads: false,
      allow_replay: false,
      allow_url_submissions: false,
      allow_zip_downloads: false,
      api_proxies: undefined,
      apps: [],
      audit: false,
      banner: undefined,
      banner_level: 'error',
      community_feed: '',
      default_zip_password: '',
      download_encoding: 'raw',
      enforce_quota: false,
      external_links: undefined,
      external_source_tags: undefined,
      external_sources: [],
      fqdn: '',
      ingest_max_priority: 0,
      read_only: false,
      rss_feeds: [],
      services_feed: '',
      tos_lockout_notify: false,
      tos_lockout: false,
      tos: false,
      url_submission_auto_service_selection: []
    },
    user: {
      api_priv_map: undefined,
      priv_role_dependencies: undefined,
      role_dependencies: undefined,
      roles: [],
      types: []
    }
  },
  flattenedProps: undefined,
  indexes: {
    alert: undefined,
    badlist: undefined,
    file: undefined,
    heuristic: undefined,
    result: undefined,
    retrohunt: undefined,
    safelist: undefined,
    signature: undefined,
    submission: undefined,
    workflow: undefined
  },
  settings: {
    classification: '',
    deep_scan: false,
    default_external_sources: [],
    default_metadata: undefined,
    default_zip_password: '',
    description: '',
    download_encoding: 'raw',
    executive_summary: false,
    expand_min_score: 0,
    generate_alert: false,
    ignore_cache: false,
    ignore_dynamic_recursion_prevention: false,
    ignore_filtering: false,
    ignore_recursion_prevention: false,
    initial_data: '',
    malicious: false,
    priority: 0,
    preferred_submission_profile: '',
    submission_profiles: undefined,
    service_spec: [],
    services: [],
    submission_view: 'report',
    ttl: 0
  },
  systemMessage: {
    user: '',
    title: '',
    severity: 'error',
    message: ''
  },
  user: undefined
};
