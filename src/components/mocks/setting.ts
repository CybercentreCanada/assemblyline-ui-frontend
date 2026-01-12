import type { UserSettings } from 'components/models/base/user_settings';

export const MOCK_SETTINGS: UserSettings = {
  classification: 'TLP:CLEAR',
  default_external_sources: [],
  default_zip_password: 'infected',
  download_encoding: 'cart',
  executive_summary: true,
  expand_min_score: 500,
  preferred_submission_profile: 'default',
  service_spec: [
    {
      name: 'APKaye',
      params: [
        { default: 0, hide: true, name: 'canada_vendors.xls', type: 'int', value: 0 },
        {
          default: 'provide',
          hide: false,
          list: ['state', 'Program', 'One'],
          name: 'program_evaluate_technologies.doc',
          type: 'list',
          value: 'state'
        },
        { default: 1, hide: false, name: 'bcip_assist_environment.lnk', type: 'int', value: 1 },
        { default: 2, hide: true, name: 'testing.doc', type: 'int', value: 2 },
        {
          default: 'from',
          hide: true,
          list: ['Program', 'market'],
          name: 'us_key.gif',
          type: 'list',
          value: 'Program'
        },
        { default: true, hide: false, name: 'marketplace.jpg', type: 'bool', value: true }
      ]
    },
    {
      name: 'Extract',
      params: [
        { default: 'Government', hide: true, list: ['One', 'Government'], name: 'in.pdf', type: 'list', value: 'One' },
        {
          default: 'the',
          hide: true,
          list: ['services', 'transition'],
          name: 'innovation_emerging_all.gif',
          type: 'list',
          value: 'services'
        },
        { default: true, hide: true, name: 'examine_product.lnk', type: 'bool', value: true },
        { default: 'vendors', hide: true, name: 'survey_development_order.lnk', type: 'str', value: 'vendors' },
        {
          default: 'private',
          hide: false,
          list: ['participating', 'supports', 'testing', 'also'],
          name: 'open_state.doc',
          type: 'list',
          value: 'participating'
        },
        { default: 1, hide: false, name: 'market_stays.ppt', type: 'int', value: 1 },
        { default: false, hide: true, name: 'of_across.doc', type: 'bool', value: false },
        { default: 'promote', hide: false, name: 'product.xls', type: 'str', value: 'promote' },
        { default: 2, hide: false, name: 'partnerships_country.exe', type: 'int', value: 2 }
      ]
    },
    {
      name: 'Metadefender',
      params: [
        {
          default: 'complex',
          hide: false,
          list: ['performs', 'art', 'innovation'],
          name: 'innovation_order_selling.exe',
          type: 'list',
          value: 'performs'
        },
        { default: 0, hide: true, name: 'companies_examine_do.gif', type: 'int', value: 0 },
        { default: 0, hide: true, name: 'for_engaging.xls', type: 'int', value: 0 },
        { default: true, hide: true, name: 'innovation_provide_commercial.xls', type: 'bool', value: true },
        { default: 'improve', hide: true, name: 'participating_product.jpg', type: 'str', value: 'improve' },
        { default: 'on', hide: true, name: 'state.jpg', type: 'str', value: 'on' }
      ]
    },
    {
      name: 'NSRL',
      params: [
        {
          default: 'problems',
          hide: true,
          list: ['The', 'complex', 'collaborating'],
          name: 'across_vendors_technology.exe',
          type: 'list',
          value: 'The'
        },
        { default: 'website', hide: true, name: 'open_experts.exe', type: 'str', value: 'website' },
        { default: 'Canada', hide: false, name: 'invite.pdf', type: 'str', value: 'Canada' },
        { default: true, hide: true, name: 'engaging_our.doc', type: 'bool', value: true },
        { default: 0, hide: false, name: 'selling_of_performs.doc', type: 'int', value: 0 },
        { default: 'laboratory', hide: false, name: 'in_laboratory_problems.pdf', type: 'str', value: 'laboratory' },
        { default: 1, hide: true, name: 'website_cutting_open.xls', type: 'int', value: 1 },
        { default: true, hide: false, name: 'partnerships_centre_also.gif', type: 'bool', value: true }
      ]
    },
    {
      name: 'PDFId',
      params: [
        { default: 'Innovation', hide: true, name: 'invite_the_support.ppt', type: 'str', value: 'Innovation' },
        { default: 1, hide: true, name: 'are_canada_key.ppt', type: 'int', value: 1 },
        { default: 2, hide: false, name: 'the_them.lnk', type: 'int', value: 2 },
        { default: 'One', hide: true, name: 'innovation_services.doc', type: 'str', value: 'One' },
        {
          default: 'partnerships',
          hide: true,
          list: ['BCIP', 'also', 'cutting', 'feedback'],
          name: 'private_emerging_them.xls',
          type: 'list',
          value: 'BCIP'
        },
        { default: 'assist', hide: true, list: ['For', 'government'], name: 'defence.ppt', type: 'list', value: 'For' },
        { default: 'testing', hide: true, name: 'laboratory_this.ppt', type: 'str', value: 'testing' },
        { default: 3, hide: false, name: 'enhanced.lnk', type: 'int', value: 3 }
      ]
    },
    {
      name: 'PE',
      params: [
        {
          default: 'bringing',
          hide: true,
          list: ['them', 'order', 'this'],
          name: 'sizes.pdf',
          type: 'list',
          value: 'them'
        },
        { default: false, hide: true, name: 'us_participating.xls', type: 'bool', value: false },
        {
          default: 'Government',
          hide: false,
          list: ['private', 'development'],
          name: 'the.xls',
          type: 'list',
          value: 'private'
        },
        { default: 'defence', hide: true, list: ['of', 'do'], name: 'build.jpg', type: 'list', value: 'of' },
        { default: true, hide: false, name: 'selling_state_bcip.gif', type: 'bool', value: true },
        { default: 'cutting', hide: false, name: 'invite_supports.lnk', type: 'str', value: 'cutting' },
        { default: true, hide: false, name: 'of_learn_one.jpg', type: 'bool', value: true }
      ]
    },
    {
      name: 'Suricata',
      params: [
        { default: 0, hide: false, name: 'private.lnk', type: 'int', value: 0 },
        { default: false, hide: false, name: 'determine_survey_survey.ppt', type: 'bool', value: false },
        { default: 'about', hide: true, name: 'companies_with.ppt', type: 'str', value: 'about' },
        { default: 'BCIP', hide: false, list: ['new', 'supports'], name: 'performs.jpg', type: 'list', value: 'new' },
        { default: true, hide: false, name: 'academia_companies.jpg', type: 'bool', value: true },
        { default: 0, hide: true, name: 'cyber_environment.jpg', type: 'int', value: 0 },
        { default: 'Government', hide: false, name: 'examine_government_with.lnk', type: 'str', value: 'Government' }
      ]
    },
    {
      name: 'TagCheck',
      params: [
        {
          default: 'academia',
          hide: false,
          list: ['services', 'open', 'emerging'],
          name: 'certain_innovations_commercial.jpg',
          type: 'list',
          value: 'services'
        },
        { default: false, hide: false, name: 'determine_goods_tools.pdf', type: 'bool', value: false },
        { default: 'Build', hide: false, name: 'development_partnerships_cyber.doc', type: 'str', value: 'Build' },
        { default: true, hide: true, name: 'provide.exe', type: 'bool', value: true },
        {
          default: 'services',
          hide: false,
          list: ['vendors', 'order', 'testing'],
          name: 'marketplace_support.exe',
          type: 'list',
          value: 'vendors'
        },
        { default: true, hide: true, name: 'assist_our.ppt', type: 'bool', value: true },
        { default: 'learn', hide: true, list: ['survey', 'new'], name: 'defence.lnk', type: 'list', value: 'survey' },
        {
          default: 'new',
          hide: false,
          list: ['them', 'selling', 'determine', 'helps'],
          name: 'edge_to_provide.gif',
          type: 'list',
          value: 'them'
        }
      ]
    }
  ],
  services: [
    {
      name: 'Static Analysis',
      selected: true,
      services: [
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'APKaye',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'Characterize',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'FrankenStrings',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'PDFId',
          selected: true
        },
        {
          category: 'Static Analysis',
          description:
            'Cyber security sizes invite also market improve state testing also problems evaluate Government certain experts Cyber',
          is_external: false,
          name: 'PE',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'PeePDF',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'determine For We about participating cyber feedback Innovation The For companies',
          is_external: true,
          name: 'TagCheck',
          selected: true
        }
      ]
    },
    {
      name: 'External',
      selected: false,
      services: [
        {
          category: 'External',
          description: 'NA',
          is_external: true,
          name: 'Beaver',
          selected: false
        }
      ]
    },
    {
      name: 'Dynamic Analysis',
      selected: false,
      services: [
        {
          category: 'Dynamic Analysis',
          description:
            'role To the website technologies about art edge technologies innovative levels evaluate is supports We partnerships',
          is_external: true,
          name: 'Cuckoo',
          selected: false
        },
        {
          category: 'Dynamic Analysis',
          description:
            'role To the website technologies about art edge technologies innovative levels evaluate is supports We partnerships',
          is_external: true,
          name: 'URLDownloader',
          selected: false
        }
      ]
    },
    {
      name: 'Extraction',
      selected: true,
      services: [
        {
          category: 'Extraction',
          description: 'learn survey One participating The cyber open provide order industry',
          is_external: true,
          name: 'Extract',
          selected: true
        }
      ]
    },
    {
      name: 'Antivirus',
      selected: true,
      services: [
        {
          category: 'Antivirus',
          description: 'NA',
          is_external: true,
          name: 'McAfee',
          selected: true
        },
        {
          category: 'Antivirus',
          description: 'NA',
          is_external: false,
          name: 'Metadefender',
          selected: true
        }
      ]
    },
    {
      name: 'Filtering',
      selected: true,
      services: [
        {
          category: 'Filtering',
          description:
            'an to Canadian state state feedback selling learn technologies performs commercial participating across their technology visit innovation key',
          is_external: false,
          name: 'NSRL',
          selected: true
        }
      ]
    },
    {
      name: 'Networking',
      selected: true,
      services: [
        {
          category: 'Networking',
          description: 'NA',
          is_external: false,
          name: 'Suricata',
          selected: true
        }
      ]
    }
  ],
  submission_profiles: {
    default: {
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
  submission_view: 'report',
  deep_scan: false,
  default_metadata: undefined,
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
};
