export type FormatProp = 'long' | 'short';

type LevelStylesheet = {
  banner: string;
  label: string;
  text: string;
  color?: string;
};

type ClassificationLevel = {
  aliases: string[];
  css: LevelStylesheet;
  description: string;
  lvl: number;
  name: string;
  short_name: string;
};

type ClassificationRequired = {
  aliases: string[];
  description: string;
  name: string;
  is_required_group?: boolean;
  require_lvl?: number;
  short_name: string;
};

type ClassificationGroup = {
  aliases: string[];
  auto_select?: boolean;
  description: string;
  name: string;
  short_name: string;
  solitary_display_name?: string;
};

type ClassificationSubGroup = {
  aliases: string[];
  auto_select?: boolean;
  description: string;
  limited_to_group?: string;
  name: string;
  require_group?: string;
  short_name: string;
  solitary_display_name?: string;
};

type ClassificationYAMLDefinition = {
  enforce: boolean;
  groups: ClassificationGroup[];
  levels: ClassificationLevel[];
  required: ClassificationRequired[];
  restricted: string;
  subgroups: ClassificationSubGroup[];
  unrestricted: string;
};

type StringMap = {
  [propName: string]: string;
};

type StringMapArray = {
  [propName: string]: string[];
};

type StylesheetMap = {
  [propName: string]: LevelStylesheet;
};

type ParamsMap = {
  is_required_group?: boolean;
  solitary_display_name?: string;
  require_group?: string;
  limited_to_group?: string;
};

export type ClassificationDefinition = {
  RESTRICTED: string;
  UNRESTRICTED: string;
  access_req_aliases: StringMapArray;
  access_req_map_lts: StringMap;
  access_req_map_stl: StringMap;
  description: StringMap;
  dynamic_groups: boolean;
  enforce: boolean;
  groups_aliases: StringMapArray;
  groups_auto_select: string[];
  groups_auto_select_short: string[];
  groups_map_lts: StringMap;
  groups_map_stl: StringMap;
  invalid_mode: boolean;
  levels_aliases: StringMap;
  levels_map: StringMap;
  levels_map_lts: StringMap;
  levels_map_stl: StringMap;
  levels_styles_map: StylesheetMap;
  original_definition: ClassificationYAMLDefinition;
  params_map: ParamsMap;
  subgroups_aliases: StringMapArray;
  subgroups_auto_select: string[];
  subgroups_auto_select_short: string[];
  subgroups_map_lts: StringMap;
  subgroups_map_stl: StringMap;
};

export type ClassificationParts = {
  lvlIdx: number;
  lvl: string;
  req: string[];
  groups: string[];
  subgroups: string[];
};

type ClassificationGroups = {
  groups: string[];
  subgroups: string[];
};

export const defaultParts: ClassificationParts = {
  lvlIdx: 0,
  lvl: '',
  req: [],
  groups: [],
  subgroups: []
};

type DisabledControls = {
  levels: string[];
  groups: string[];
};

export const defaultDisabled: DisabledControls = {
  groups: [],
  levels: []
};

export function getLevelText(
  lvl: number,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): string {
  let text = null;
  if (c12nDef != null) {
    text = c12nDef.levels_map[lvl.toString()];
  }

  if (text === undefined || text == null) {
    text = '';
  }

  if (format === 'long' && !isMobile) {
    return c12nDef.levels_map_stl[text];
  }

  return text;
}

function getLevelIndex(c12n: string, c12nDef: ClassificationDefinition): number {
  let retIndex = null;
  const splitIdx = c12n.indexOf('//');
  let c12nLvl = c12n;
  if (splitIdx !== -1) {
    c12nLvl = c12n.slice(0, splitIdx);
  }

  if (c12nDef.levels_map[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nLvl];
  } else if (c12nDef.levels_map_lts[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nDef.levels_map_lts[c12nLvl]];
  } else if (c12nDef.levels_aliases[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nDef.levels_aliases[c12nLvl]];
  }

  return retIndex;
}

function getRequired(c12n: string, c12nDef: ClassificationDefinition, format: FormatProp, isMobile: boolean): string[] {
  const returnSet = [];
  const partSet = c12n.split('/');
  for (const p of partSet) {
    if (p in c12nDef.access_req_map_lts) {
      returnSet.push(c12nDef.access_req_map_lts[p]);
    } else if (p in c12nDef.access_req_map_stl) {
      returnSet.push(p);
    } else if (p in c12nDef.access_req_aliases) {
      for (const a of c12nDef.access_req_aliases[p]) {
        returnSet.push(a);
      }
    }
  }

  if (format === 'long' && !isMobile) {
    const out = [];
    for (const r of returnSet) {
      out.push(c12nDef.access_req_map_stl[r]);
    }

    return out.sort();
  }

  return returnSet.sort();
}

function getGroups(
  c12n: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): ClassificationGroups {
  const g1 = [];
  const g2 = [];
  const other = [];

  const groupParts = c12n.split('//');
  let groups = [];
  for (let grpPart of groupParts) {
    grpPart = grpPart.replace('REL TO ', '');
    const tempGroup = grpPart.split(',');
    for (const tg of tempGroup) {
      groups = groups.concat(tg.trim().split('/'));
    }
  }

  for (const g of groups) {
    if (g in c12nDef.groups_map_lts) {
      g1.push(c12nDef.groups_map_lts[g]);
    } else if (g in c12nDef.groups_map_stl) {
      g1.push(g);
    } else if (g in c12nDef.groups_aliases) {
      for (const a of c12nDef.groups_aliases[g]) {
        g1.push(a);
      }
    } else if (g in c12nDef.subgroups_map_lts) {
      g2.push(c12nDef.subgroups_map_lts[g]);
    } else if (g in c12nDef.subgroups_map_stl) {
      g2.push(g);
    } else if (g in c12nDef.subgroups_aliases) {
      for (const sa of c12nDef.subgroups_aliases[g]) {
        g2.push(sa);
      }
    } else {
      other.push(g);
    }
  }

  if (c12nDef.dynamic_groups) {
    for (const o of other) {
      if (
        !(o in c12nDef.access_req_map_lts) &&
        !(o in c12nDef.access_req_map_stl) &&
        !(o in c12nDef.access_req_aliases) &&
        !(o in c12nDef.levels_map) &&
        !(o in c12nDef.levels_map_lts) &&
        !(o in c12nDef.levels_aliases)
      ) {
        g1.push(o);
      }
    }
  }

  if (format === 'long' && !isMobile) {
    const g1Out = [];
    for (const gr of g1) {
      g1Out.push(gr in c12nDef.groups_map_stl ? c12nDef.groups_map_stl[gr] : gr);
    }

    const g2Out = [];
    for (const sgr of g2) {
      g2Out.push(c12nDef.subgroups_map_stl[sgr]);
    }

    return { groups: g1Out.sort(), subgroups: g2Out.sort() };
  }

  return { groups: g1.sort(), subgroups: g2.sort() };
}

export function getParts(
  c12n: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): ClassificationParts {
  const grps = getGroups(c12n, c12nDef, format, isMobile);
  const lvlIdx = getLevelIndex(c12n, c12nDef);
  return {
    lvlIdx,
    lvl: getLevelText(lvlIdx, c12nDef, format, isMobile),
    req: getRequired(c12n, c12nDef, format, isMobile),
    groups: grps.groups,
    subgroups: grps.subgroups
  };
}

export function normalizedClassification(
  parts: ClassificationParts,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): string {
  const { lvl, req, subgroups } = parts;
  let { groups } = parts;

  let out = lvl;

  const reqGrp = [];
  for (const r of req) {
    if (c12nDef.params_map[r] !== undefined) {
      if (c12nDef.params_map[r].is_required_group !== undefined) {
        if (c12nDef.params_map[r].is_required_group) {
          reqGrp.push(r);
        }
      }
    }
  }

  for (const rg of reqGrp) {
    req.splice(req.indexOf(rg), 1);
  }

  if (req.length > 0) {
    out += `//${req.join('/')}`;
  }
  if (reqGrp.length > 0) {
    out += `//${reqGrp.join('/')}`;
  }

  if (groups.length > 0) {
    if (reqGrp.length > 0) {
      out += '/';
    } else {
      out += '//';
    }

    if (groups.length === 1) {
      const group = groups[0];
      if (c12nDef.params_map[group] !== undefined) {
        if (c12nDef.params_map[group].solitary_display_name !== undefined) {
          out += c12nDef.params_map[group].solitary_display_name;
        } else {
          out += `REL TO ${group}`;
        }
      } else {
        out += `REL TO ${group}`;
      }
    } else {
      if (format === 'short' || isMobile) {
        for (const alias in c12nDef.groups_aliases) {
          if ({}.hasOwnProperty.call(c12nDef.groups_aliases, alias)) {
            const values = c12nDef.groups_aliases[alias];
            if (values.length > 1) {
              if (JSON.stringify(values.sort()) === JSON.stringify(groups)) {
                groups = [alias];
              }
            }
          }
        }
      }
      out += `REL TO ${groups.join(', ')}`;
    }
  }

  if (subgroups.length > 0) {
    if (groups.length > 0 || reqGrp.length > 0) {
      out += '/';
    } else {
      out += '//';
    }
    out += subgroups.join('/');
  }

  return out;
}

function levelList(c12nDef: ClassificationDefinition) {
  const out = [];
  for (const i in c12nDef.levels_map) {
    if (!isNaN(parseInt(i))) {
      out.push(c12nDef.levels_map[i]);
    }
  }
  return out;
}

type ClassificationValidator = {
  disabled: DisabledControls;
  parts: ClassificationParts;
};

export const defaultClassificationValidator: ClassificationValidator = {
  disabled: defaultDisabled,
  parts: defaultParts
};

export function applyClassificationRules(
  parts: ClassificationParts,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean,
  userClassification: boolean = false
): ClassificationValidator {
  const requireLvl = {};
  const limitedToGroup = {};
  const requireGroup = {};
  const partsToCheck = ['req', 'groups', 'subgroups'];
  const retParts = { ...parts };
  const disabledList = {
    levels: [],
    groups: []
  };

  for (const item in c12nDef.params_map) {
    if ({}.hasOwnProperty.call(c12nDef.params_map, item)) {
      const data = c12nDef.params_map[item];
      if ('require_lvl' in data) {
        requireLvl[item] = data.require_lvl;
      }
      if ('limited_to_group' in data) {
        limitedToGroup[item] = data.limited_to_group;
      }
      if ('require_group' in data) {
        requireGroup[item] = data.require_group;
      }
    }
  }

  for (const partName in partsToCheck) {
    if ({}.hasOwnProperty.call(partsToCheck, partName)) {
      const part = retParts[partsToCheck[partName]];
      for (const value of part) {
        let triggerAutoSelect = false;
        if (value) {
          if (value in requireLvl) {
            if (retParts.lvlIdx < requireLvl[value]) {
              retParts.lvlIdx = requireLvl[value];
              retParts.lvl = getLevelText(requireLvl[value], c12nDef, format, isMobile);
            }
            const levels = levelList(c12nDef);
            for (const l of levels) {
              if (c12nDef.levels_map[l] < requireLvl[value]) {
                disabledList.levels.push(l);
              }
            }
          }
          if (value in requireGroup) {
            if (!retParts.groups.includes(requireGroup[value])) {
              retParts.groups.push(requireGroup[value]);
              for (const group of c12nDef.groups_auto_select) {
                if (!retParts.groups.includes(group)) retParts.groups.push(group);
              }
            }
          }
          if (value in limitedToGroup) {
            for (const g in c12nDef.groups_map_stl) {
              if (g !== limitedToGroup[value]) {
                disabledList.groups.push(g);
                if (retParts.groups.includes(g)) {
                  retParts.groups.splice(retParts.groups.indexOf(g), 1);
                }
              }
            }
          }
          if (!userClassification && partsToCheck[partName] === 'groups') {
            triggerAutoSelect = true;
          }
        }
        if (triggerAutoSelect) {
          for (const group of c12nDef.groups_auto_select) {
            if (!retParts.groups.includes(group)) retParts.groups.push(group);
          }
        }
      }
    }
  }

  // Sort all lists
  retParts.req = retParts.req.sort();
  retParts.groups = retParts.groups.sort();
  retParts.subgroups = retParts.subgroups.sort();

  return {
    disabled: disabledList,
    parts: retParts
  };
}

export function getMaxClassification(
  c12n_1: string,
  c12n_2: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
) {
  const lvlIdx = Math.max(getLevelIndex(c12n_1, c12nDef), getLevelIndex(c12n_2, c12nDef));
  const out = {
    lvlIdx,
    lvl: getLevelText(lvlIdx, c12nDef, format, isMobile),
    req: [
      ...Array.from(
        new Set(getRequired(c12n_1, c12nDef, format, isMobile).concat(getRequired(c12n_1, c12nDef, format, isMobile)))
      )
    ],
    groups: null,
    subgroups: null
  };

  const grps1 = getGroups(c12n_1, c12nDef, format, isMobile);
  const grps2 = getGroups(c12n_2, c12nDef, format, isMobile);
  if (grps1.groups.length > 0 && grps2.groups.length > 0) {
    out.groups = grps1.groups.filter(value => grps2.groups.includes(value));
  } else {
    out.groups = [...Array.from(new Set(grps1.groups.concat(grps2.groups)))];
  }
  if (grps1.subgroups.length > 0 && grps2.subgroups.length > 0) {
    out.subgroups = grps1.subgroups.filter(value => grps2.subgroups.includes(value));
  } else {
    out.subgroups = [...Array.from(new Set(grps1.subgroups.concat(grps2.subgroups)))];
  }

  return normalizedClassification(out, c12nDef, format, isMobile);
}
