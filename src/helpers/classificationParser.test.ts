import { describe, expect, it } from '@jest/globals';
import {
  applyClassificationRules,
  ClassificationDefinition,
  getMaxClassification,
  getParts,
  isAccessible,
  normalizedClassification
} from 'helpers/classificationParser';

const c12nDef: ClassificationDefinition = {
  RESTRICTED: 'TLP:AMBER+STRICT//MAPLE//REL TO MOOSE',
  UNRESTRICTED: 'TLP:CLEAR',
  access_req_aliases: {},
  access_req_map_lts: {
    MAPLE: 'MPL',
    LEAF: 'LF'
  },
  access_req_map_stl: {
    MPL: 'MAPLE',
    LF: 'LEAF'
  },
  description: {
    MAPLE: 'Member of the Maple Team',
    MPL: 'Member of the Maple Team',
    LEAF: 'Can access additional information',
    LF: 'Can access additional information',
    BEAVER: 'Employees of Beaver Inc',
    MOOSE: 'Employees of Moose Org',
    SUBGRP: 'Sub Group',
    SG: 'Sub Group',
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
  dynamic_groups_type: 'group',
  enforce: true,
  groups_aliases: {},
  groups_auto_select: ['MOOSE'],
  groups_auto_select_short: ['M'],
  groups_map_lts: {
    MOOSE: 'M',
    BEAVER: 'B'
  },
  groups_map_stl: {
    M: 'MOOSE',
    B: 'BEAVER'
  },
  invalid_mode: false,
  levels_aliases: {
    RESTRICTED: 'TLP:A+S',
    'TLP:W': 'TLP:C',
    'TLP:WHITE': 'TLP:C',
    UNRESTRICTED: 'TLP:C'
  },
  levels_map: {
    '100': 'TLP:C',
    '110': 'TLP:G',
    '120': 'TLP:A',
    '125': 'TLP:A+S',
    'TLP:A': '120',
    'TLP:A+S': '125',
    'TLP:C': '100',
    'TLP:G': '110'
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
      color: 'warning'
    },
    'TLP:A+S': {
      color: 'warning'
    },
    'TLP:AMBER': {
      color: 'warning'
    },
    'TLP:AMBER+STRICT': {
      color: 'warning'
    },
    'TLP:C': {
      color: 'default'
    },
    'TLP:CLEAR': {
      color: 'default'
    },
    'TLP:G': {
      color: 'success'
    },
    'TLP:GREEN': {
      color: 'success'
    }
  },
  original_definition: {
    dynamic_groups: true,
    dynamic_groups_type: 'group',
    enforce: true,
    groups: [
      {
        aliases: [],
        auto_select: true,
        description: 'Employees of MOOSE Org',
        name: 'MOOSE',
        short_name: 'M'
      },
      {
        aliases: [],
        auto_select: false,
        description: 'Employees of BEAVER Inc',
        name: 'BEAVER',
        short_name: 'B'
      }
    ],
    levels: [
      {
        aliases: ['UNRESTRICTED', 'TLP:W', 'TLP:WHITE'],
        css: {
          color: 'default'
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
          color: 'success'
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
          color: 'warning'
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
          color: 'warning'
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
        description: 'Member of the Maple Team',
        name: 'MAPLE',
        short_name: 'MPL'
      },
      {
        aliases: [],
        description: 'Can access additional information',
        name: 'LEAF',
        short_name: 'LF'
      }
    ],
    restricted: 'TLP:A+S//MPL//REL TO M',
    subgroups: [
      {
        aliases: ['SUB'],
        description: 'Sub Group',
        name: 'SUBGRP',
        short_name: 'SG'
      }
    ],
    unrestricted: 'TLP:C'
  },
  params_map: {
    MAPLE: {},
    MPL: {},
    SUBGRP: {},
    SG: {},
    SUB: {},
    MOOSE: {},
    'TLP:A': {},
    'TLP:A+S': {},
    'TLP:AMBER': {},
    'TLP:AMBER+STRICT': {},
    'TLP:C': {},
    'TLP:CLEAR': {},
    'TLP:G': {},
    'TLP:GREEN': {}
  },
  subgroups_aliases: {
    SUB: ['SUBGRP']
  },
  subgroups_auto_select: [],
  subgroups_auto_select_short: [],
  subgroups_map_lts: {
    SUBGRP: 'SG'
  },
  subgroups_map_stl: {
    SG: 'SUBGRP'
  }
};

describe('`normalizedClassification` correctly formats', () => {
  it('Should use short format when `short` is passed in', () => {
    const parts = getParts('TLP:CLEAR//MAPLE', c12nDef, 'short', false);
    const result = normalizedClassification(parts, c12nDef, 'short', false);
    expect(result).toBe('TLP:C//MPL');
  });

  it('Should use short format when `isMobile` is used', () => {
    const parts = getParts('TLP:CLEAR//MAPLE', c12nDef, 'long', true);
    const result = normalizedClassification(parts, c12nDef, 'long', true);
    expect(result).toBe('TLP:C//MPL');
  });

  it('Should use long format when `long` format is used and `isMobile` is `false`', () => {
    const parts = getParts('TLP:C//MAPLE//REL B', c12nDef, 'long', false);
    const result = normalizedClassification(parts, c12nDef, 'long', false);
    expect(result).toBe('TLP:CLEAR//MAPLE//REL TO BEAVER');
  });

  it('Should convert aliases to real name', () => {
    const parts = getParts('TLP:WHITE//MOOSE/SUB', c12nDef, 'long', false);
    const result = normalizedClassification(parts, c12nDef, 'long', false);
    expect(result).toBe('TLP:CLEAR//REL TO MOOSE/SUBGRP');
  });
});

describe('isAccessible correctly parses classifications', () => {
  it('Should return `true` if inputs are the same', () => {
    const result = isAccessible('TLP:C', 'TLP:C', c12nDef, true);
    expect(result).toBe(true);
  });

  it('Should return `true` if not enforced', () => {
    const result = isAccessible('TLP:C', 'TLP:A', c12nDef, false);
    expect(result).toBe(true);
  });

  it('Should return `false` if user classification is lower than given classification', () => {
    const result = isAccessible('TLP:C', 'TLP:A', c12nDef, true);
    expect(result).toBe(false);
  });

  it('Should return `true` if user classification is higher than given classification', () => {
    const result = isAccessible('TLP:A', 'TLP:G', c12nDef, true);
    expect(result).toBe(true);
  });

  it('Should return `true` if user has all `required` values', () => {
    let result = isAccessible('TLP:A//MAPLE', 'TLP:G//MAPLE', c12nDef, true);
    expect(result).toBe(true);

    result = isAccessible('TLP:A//MPL/LF', 'TLP:G//LEAF', c12nDef, true);
    expect(result).toBe(true);

    result = isAccessible('TLP:A//MAPLE', 'TLP:G', c12nDef, true);
    expect(result).toBe(true);
  });

  it('Should return `false` if user is missing a single `required` value', () => {
    let result = isAccessible('TLP:A', 'TLP:G//MAPLE', c12nDef, true);
    expect(result).toBe(false);

    result = isAccessible('TLP:A//MAPLE', 'TLP:G//MAPLE/LEAF', c12nDef, true);
    expect(result).toBe(false);

    result = isAccessible('TLP:A//MAPLE', 'TLP:G//LEAF', c12nDef, true);
    expect(result).toBe(false);
  });

  it('Should return `true` if user has any required group', () => {
    const result = isAccessible('TLP:A//REL MOOSE', 'TLP:G//REL MOOSE/BEAVER', c12nDef, true);
    expect(result).toBe(true);
  });

  it('Should return `false` if user ism issing all required groups', () => {
    const result = isAccessible('TLP:A//MPL', 'TLP:G//REL MOOSE/BEAVER', c12nDef, true);
    expect(result).toBe(false);
  });
});

describe('getMaxClassification correctly identifies the maximum', () => {
  it('Should return the higher single classification', () => {
    let result = getMaxClassification('TLP:CLEAR', 'TLP:A', c12nDef, 'long', false);
    expect(result).toBe('TLP:AMBER');

    result = getMaxClassification('TLP:GREEN', 'TLP:C', c12nDef, 'short', false);
    expect(result).toBe('TLP:G');
  });

  it('Should return the higher single classification and merge a single required', () => {
    let result = getMaxClassification('TLP:G//MAPLE', 'TLP:A', c12nDef, 'long', false);
    expect(result).toBe('TLP:AMBER//MAPLE');

    result = getMaxClassification('TLP:AMBER', 'TLP:C//LEAF', c12nDef, 'short', false);
    expect(result).toBe('TLP:A//LF');
  });

  it('Should return the higher single classification and merge all required', () => {
    let result = getMaxClassification('TLP:G//MAPLE', 'TLP:A//LF', c12nDef, 'long', false);
    expect(result).toBe('TLP:AMBER//MAPLE/LEAF');

    result = getMaxClassification('TLP:AMBER', 'TLP:C//LEAF/MAPLE', c12nDef, 'short', false);
    expect(result).toBe('TLP:A//MPL/LF');
  });

  it('Should return the higher single classification and merge all groups', () => {
    let result = getMaxClassification('TLP:G//MOOSE', 'TLP:C', c12nDef, 'long', false);
    expect(result).toBe('TLP:GREEN//REL TO MOOSE');

    result = getMaxClassification('TLP:AMBER//BEAVER', 'TLP:C//MOOSE', c12nDef, 'short', false);
    expect(result).toBe('TLP:A//REL B/M');
  });

  it('Should return the higher single classification and merge all required and groups', () => {
    let result = getMaxClassification('TLP:G//MAPLE//MOOSE', 'TLP:C//LEAF', c12nDef, 'long', false);
    expect(result).toBe('TLP:GREEN//MAPLE/LEAF//REL TO MOOSE');

    result = getMaxClassification('TLP:AMBER//BEAVER/MOOSE', 'TLP:C//MAPLE/LEAF', c12nDef, 'short', false);
    expect(result).toBe('TLP:A//MPL/LF//REL B/M');
  });
});

describe('`applyClassificationRules` should correctly identify classifications passed in', () => {
  const disabled = { groups: [], levels: [] };

  it('Should return no disabled, and the single classification parts', () => {
    const parts = getParts('TLP:CLEAR//MAPLE', c12nDef, 'long', false);
    let result = applyClassificationRules(parts, c12nDef, 'short', false);
    expect(result.disabled).toEqual(disabled);
    expect(result.parts).toEqual({ groups: [], lvl: 'TLP:C', lvlIdx: '100', req: ['MPL'], subgroups: [] });

    result = applyClassificationRules(parts, c12nDef, 'long', false, true);
    expect(result.disabled).toEqual(disabled);
    expect(result.parts).toEqual({ groups: [], lvl: 'TLP:CLEAR', lvlIdx: '100', req: ['MAPLE'], subgroups: [] });
  });

  it('Should return no disabled, and the multiple classification parts', () => {
    const parts = getParts('TLP:AMBER//MAPLE/LEAF//MOOSE/SUBGRP/BEAVER', c12nDef, 'short', false);
    const result = applyClassificationRules(parts, c12nDef, 'short', false);
    expect(result.disabled).toEqual(disabled);
    expect(result.parts).toEqual({
      groups: ['B', 'M'],
      lvl: 'TLP:A',
      lvlIdx: '120',
      req: ['LF', 'MPL'],
      subgroups: ['SG']
    });
  });

  it('Should return disabled, and the multiple classification parts', () => {
    const parts = getParts('TLP:BAD//MAPLES/LEAF//MOOSE/SUBGRP/BEAVERS', c12nDef, 'short', false);
    const result = applyClassificationRules(parts, c12nDef, 'short', false);
    expect(result.parts).toEqual({
      groups: ['M'],
      lvl: 'INVALID',
      lvlIdx: null,
      req: ['LF'],
      subgroups: ['SG']
    });
    expect(result.disabled).toEqual('');
  });
});

//todo test more invalid
