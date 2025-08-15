import type { ClassificationDefinition } from 'helpers/classificationParser';

export const MOCK_CLASSIFICATION_DEFINITION: ClassificationDefinition = {
  RESTRICTED: 'TLP:AMBER+STRICT//COMMERCIAL//REL TO CSE',
  UNRESTRICTED: 'TLP:CLEAR',
  access_req_aliases: {},
  access_req_map_lts: {
    COMMERCIAL: 'CMR'
  },
  access_req_map_stl: {
    CMR: 'COMMERCIAL'
  },
  description: {
    CCCS: 'Member of the Canadian Centre for Cyber Security',
    CMR: 'Produced using a commercial tool with limited distribution',
    COMMERCIAL: 'Produced using a commercial tool with limited distribution',
    CSE: 'Employees of CSE',
    IR: 'Member of Incident Response team',
    'IR TEAM': 'Member of Incident Response team',
    'TLP:A':
      'Recipients may only share TLP:AMBER information with members of their own organization and with clients or customers who need to know the information to protect themselves or prevent further harm.',
    'TLP:A+S': 'Recipients may only share TLP:AMBER+STRICT information with members of their own organization.',
    'TLP:AMBER':
      'Recipients may only share TLP:AMBER information with members of their own organization and with clients or customers who need to know the information to protect themselves or prevent further harm.',
    'TLP:AMBER+STRICT':
      'Recipients may only share TLP:AMBER+STRICT information with members of their own organization.',
    'TLP:C': 'Subject to standard copyright rules, TLP:CLEAR information may be distributed without restriction.',
    'TLP:CLEAR': 'Subject to standard copyright rules, TLP:CLEAR information may be distributed without restriction.',
    'TLP:G':
      'Recipients may share TLP:GREEN information with peers and partner organizations within their sector or community, but not via publicly accessible channels. Information in this category can be circulated widely within a particular community. TLP:GREEN information may not be released outside of the community.',
    'TLP:GREEN':
      'Recipients may share TLP:GREEN information with peers and partner organizations within their sector or community, but not via publicly accessible channels. Information in this category can be circulated widely within a particular community. TLP:GREEN information may not be released outside of the community.'
  },
  dynamic_groups: true,
  dynamic_groups_type: 'all',
  enforce: true,
  groups_aliases: {},
  groups_auto_select: ['CSE'],
  groups_auto_select_short: ['CSE'],
  groups_map_lts: {
    CSE: 'CSE'
  },
  groups_map_stl: {
    CSE: 'CSE'
  },
  invalid_mode: false,
  levels_aliases: {
    RESTRICTED: 'TLP:A+S',
    'TLP:W': 'TLP:C',
    'TLP:WHITE': 'TLP:C',
    U: 'TLP:C',
    UNCLASSIFIED: 'TLP:C',
    UNRESTRICTED: 'TLP:C'
  },
  levels_map: {
    '100': 'TLP:C',
    '110': 'TLP:G',
    '120': 'TLP:A',
    '125': 'TLP:A+S',
    'TLP:A': 120,
    'TLP:A+S': 125,
    'TLP:C': 100,
    'TLP:G': 110
  },
  levels_map_lts: {
    'TLP:AMBER': 'TLP:A',
    'TLP:AMBER+STRICT': 'TLP:A+S',
    'TLP:CLEAR': 'TLP:C',
    'TLP:GREEN': 'TLP:G'
  },
  levels_map_stl: {
    'TLP:A': 'TLP:AMBER',
    'TLP:A+S': 'TLP:AMBER+STRICT',
    'TLP:C': 'TLP:CLEAR',
    'TLP:G': 'TLP:GREEN'
  },
  levels_styles_map: {
    'TLP:A': {
      banner: 'alert-warning2',
      label: 'label-warning',
      text: 'text-warning2'
    },
    'TLP:A+S': {
      banner: 'alert-warning2',
      label: 'label-warning',
      text: 'text-warning2'
    },
    'TLP:AMBER': {
      banner: 'alert-warning2',
      label: 'label-warning',
      text: 'text-warning2'
    },
    'TLP:AMBER+STRICT': {
      banner: 'alert-warning2',
      label: 'label-warning',
      text: 'text-warning2'
    },
    'TLP:C': {
      banner: 'alert-default',
      label: 'label-default',
      text: 'text-muted'
    },
    'TLP:CLEAR': {
      banner: 'alert-default',
      label: 'label-default',
      text: 'text-muted'
    },
    'TLP:G': {
      banner: 'alert-success',
      label: 'label-success',
      text: 'text-success'
    },
    'TLP:GREEN': {
      banner: 'alert-success',
      label: 'label-success',
      text: 'text-success'
    }
  },
  original_definition: {
    dynamic_groups: true,
    dynamic_groups_type: 'all',
    enforce: true,
    groups: [
      {
        aliases: [],
        auto_select: true,
        description: 'Employees of CSE',
        name: 'CSE',
        short_name: 'CSE'
      }
    ],
    levels: [
      {
        aliases: ['UNRESTRICTED', 'UNCLASSIFIED', 'U', 'TLP:W', 'TLP:WHITE'],
        css: {
          banner: 'alert-default',
          label: 'label-default',
          text: 'text-muted'
        },
        description:
          'Subject to standard copyright rules, TLP:CLEAR information may be distributed without restriction.',
        lvl: 100,
        name: 'TLP:CLEAR',
        short_name: 'TLP:C'
      },
      {
        aliases: [],
        css: {
          banner: 'alert-success',
          label: 'label-success',
          text: 'text-success'
        },
        description:
          'Recipients may share TLP:GREEN information with peers and partner organizations within their sector or community, but not via publicly accessible channels. Information in this category can be circulated widely within a particular community. TLP:GREEN information may not be released outside of the community.',
        lvl: 110,
        name: 'TLP:GREEN',
        short_name: 'TLP:G'
      },
      {
        aliases: [],
        css: {
          banner: 'alert-warning2',
          label: 'label-warning',
          text: 'text-warning2'
        },
        description:
          'Recipients may only share TLP:AMBER information with members of their own organization and with clients or customers who need to know the information to protect themselves or prevent further harm.',
        lvl: 120,
        name: 'TLP:AMBER',
        short_name: 'TLP:A'
      },
      {
        aliases: ['RESTRICTED'],
        css: {
          banner: 'alert-warning2',
          label: 'label-warning',
          text: 'text-warning2'
        },
        description: 'Recipients may only share TLP:AMBER+STRICT information with members of their own organization.',
        lvl: 125,
        name: 'TLP:AMBER+STRICT',
        short_name: 'TLP:A+S'
      }
    ],
    required: [
      {
        aliases: [],
        description: 'Produced using a commercial tool with limited distribution',
        name: 'COMMERCIAL',
        short_name: 'CMR'
      }
    ],
    restricted: 'TLP:AMBER+STRICT//CMR//REL TO CSE',
    subgroups: [
      {
        aliases: [],
        description: 'Member of Incident Response team',
        name: 'IR TEAM',
        short_name: 'IR'
      },
      {
        aliases: [],
        description: 'Member of the Canadian Centre for Cyber Security',
        name: 'CCCS',
        require_group: 'CSE',
        short_name: 'CCCS'
      }
    ],
    unrestricted: 'TLP:C'
  },
  params_map: {
    CCCS: {
      require_group: 'CSE'
    },
    CMR: {},
    COMMERCIAL: {},
    CSE: {},
    IR: {},
    'IR TEAM': {},
    'TLP:A': {},
    'TLP:A+S': {},
    'TLP:AMBER': {},
    'TLP:AMBER+STRICT': {},
    'TLP:C': {},
    'TLP:CLEAR': {},
    'TLP:G': {},
    'TLP:GREEN': {}
  },
  subgroups_aliases: {},
  subgroups_auto_select: [],
  subgroups_auto_select_short: [],
  subgroups_map_lts: {
    CCCS: 'CCCS',
    'IR TEAM': 'IR'
  },
  subgroups_map_stl: {
    CCCS: 'CCCS',
    IR: 'IR TEAM'
  }
};
