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

type ClassificationParts = {
  lvlIdx: string;
  lvl: string;
  req: string[];
  groups: string[];
  subgroups: string[];
};

type ClassificationGroups = {
  groups: string[];
  subgroups: string[];
};

export const defaultParts = {
  lvlIdx: '',
  lvl: '',
  req: [],
  groups: [],
  subgroups: []
};

export function getLevelText(
  lvl: string,
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

function getLevelIndex(c12n: string, c12nDef: ClassificationDefinition): string {
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
    }
  }

  if (format === 'long' && !isMobile) {
    const g1Out = [];
    for (const gr of g1) {
      g1Out.push(c12nDef.groups_map_stl[gr]);
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
