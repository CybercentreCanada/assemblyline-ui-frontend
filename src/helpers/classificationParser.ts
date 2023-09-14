export type FormatProp = 'long' | 'short';

type LevelStylesheet = {
  banner?: string;
  label?: string;
  text?: string;
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
  dynamic_groups: boolean;
  dynamic_groups_type: string;
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
  [propName: string]: {
    is_required_group?: boolean;
    solitary_display_name?: string;
    require_lvl?: number;
    require_group?: string;
    limited_to_group?: string;
  };
};

export type ClassificationDefinition = {
  RESTRICTED: string;
  UNRESTRICTED: string;
  access_req_aliases: StringMapArray;
  access_req_map_lts: StringMap;
  access_req_map_stl: StringMap;
  description: StringMap;
  dynamic_groups: boolean;
  dynamic_groups_type: 'email' | 'group' | 'all';
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
  others: string[];
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

export class InvalidClassification extends Error {}

export function getLevelText(
  lvl: number,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): string {
  let text = null;
  if (c12nDef != null && lvl != null) {
    text = c12nDef.levels_map[lvl.toString()];
  }

  if (text === undefined || text == null) {
    throw new InvalidClassification(
      `Classification level number '${lvl}' was not found in your classification definition.`
    );
  }

  if (format === 'long' && !isMobile) {
    return c12nDef.levels_map_stl[text];
  }

  return text;
}

function getLevelIndex(c12n: string, c12nDef: ClassificationDefinition): [number, string] {
  // assumes c12nDef is coming from the Assemblyline API and all values will be in UPPER case
  let retIndex = null;
  const [level, unused, _x] = c12n.split(/\/\/(.*)/);
  const c12nLvl = level.toUpperCase();

  if (c12nDef.levels_map[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nLvl];
  } else if (c12nDef.levels_map_lts[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nDef.levels_map_lts[c12nLvl]];
  } else if (c12nDef.levels_aliases[c12nLvl] !== undefined) {
    retIndex = c12nDef.levels_map[c12nDef.levels_aliases[c12nLvl]];
  } else {
    throw new InvalidClassification(`Classification level '${level}' was not found in your classification definition.`);
  }

  return [retIndex, unused];
}

function getRequired(
  c12n: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): [string[], string[]] {
  const returnSet = [];
  const unused = [];
  if (!c12n) {
    return [returnSet.sort(), unused];
  }
  const partSet = c12n.toUpperCase().split('/');
  for (const p of partSet) {
    if (p in c12nDef.access_req_map_lts) {
      returnSet.push(c12nDef.access_req_map_lts[p]);
    } else if (p in c12nDef.access_req_map_stl) {
      returnSet.push(p);
    } else if (p in c12nDef.access_req_aliases) {
      for (const a of c12nDef.access_req_aliases[p]) {
        returnSet.push(a);
      }
    } else {
      unused.push(p);
    }
  }

  if (format === 'long' && !isMobile) {
    const out = [];
    for (const r of returnSet) {
      out.push(c12nDef.access_req_map_stl[r]);
    }

    return [out.sort(), unused];
  }

  return [returnSet.sort(), unused];
}

function getGroups(
  groupParts: string[],
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): ClassificationGroups {
  // Note: this function assumes c12nDef is coming from the Assemblyline API and all values will be in UPPER case
  // and that this function is called AFTER getLevelIndex and getRequired functions with the used values passed in.
  const g1Set = new Set<string>();
  const g2Set = new Set<string>();
  let others = new Set<string>();

  let groups = [];
  const subgroups = [];

  for (const grpPart of groupParts) {
    if (!grpPart) {
      continue;
    }
    const gp = grpPart.toUpperCase();
    // if there is a rel marking we know we have groups
    if (gp.startsWith('REL ')) {
      const tempGroups = new Set(gp.replace('REL TO ', '').replace('REL ', '').split(','));
      for (let tg of tempGroups) {
        tg = tg.trim();
        for (let tsg of tg.split('/')) {
          tsg = tsg.trim();
          groups.push(tsg);
        }
      }
    } else {
      // if there is not a rel marking we either have a subgroup or a
      // solitary_display_name alias for a group, which we will filter out later
      subgroups.push(gp);
    }
  }

  for (const g of groups) {
    if (g in c12nDef.groups_map_lts) {
      g1Set.add(c12nDef.groups_map_lts[g]);
    } else if (g in c12nDef.groups_map_stl) {
      g1Set.add(g);
    } else if (g in c12nDef.groups_aliases) {
      for (const a of c12nDef.groups_aliases[g]) {
        g1Set.add(a);
      }
    } else {
      others.add(g);
    }
  }

  for (const g of subgroups) {
    if (g in c12nDef.subgroups_map_lts) {
      g2Set.add(c12nDef.subgroups_map_lts[g]);
    } else if (g in c12nDef.subgroups_map_stl) {
      g2Set.add(g);
    } else if (g in c12nDef.subgroups_aliases) {
      for (const sa of c12nDef.subgroups_aliases[g]) {
        g2Set.add(sa);
      }
    }
    // Here is where we catch any solitary_display_name aliases for groups
    // within the subgroup sections
    else if (g in c12nDef.groups_aliases) {
      // Check that this alias is actually a solitary name, don't
      // let other aliases leak outside the REL marking
      const grps = c12nDef.groups_aliases[g];
      if (grps.length > 1) {
        // Unclear use of alias
        throw new InvalidClassification(`Unclear use of alias: ${g}`);
      }
      g1Set.add(grps[0]);
    } else {
      // Unknown component
      throw new InvalidClassification(`Unknown component: ${g}`);
    }
  }

  // If dynamic groups are active all remaining parts should be groups found under a
  // REL TO marking that we can merge in with the other groups
  if (c12nDef.dynamic_groups) {
    for (const o of others) {
      g1Set.add(o);
    }
    others = new Set<string>();
  }

  // Check if there are any required group assignments
  for (const subgroup of g2Set) {
    const required = c12nDef.params_map?.[subgroup]?.require_group;
    if (!!required) {
      g1Set.add(required);
    }
  }

  // Check if there are any forbidden group assignments
  for (const subgroup of g2Set) {
    const limitedToGroup = c12nDef.params_map?.[subgroup]?.limited_to_group;
    if (limitedToGroup !== null && limitedToGroup !== undefined) {
      if (g1Set.size > 1 || (g1Set.size === 1 && !g1Set.has(limitedToGroup))) {
        throw new InvalidClassification(
          `Subgroup ${subgroup} is limited to group ${limitedToGroup} (found: ${Array.from(g1Set).toString()})`
        );
      }
    }
  }

  // should add auto select handling here...

  // swap to long format if required
  if (format === 'long' && !isMobile) {
    const g1Out = [];
    for (const gr of g1Set) {
      g1Out.push(gr in c12nDef.groups_map_stl ? c12nDef.groups_map_stl[gr] : gr);
    }

    const g2Out = [];
    for (const sgr of g2Set) {
      g2Out.push(c12nDef.subgroups_map_stl[sgr]);
    }

    return { groups: g1Out.sort(), subgroups: g2Out.sort(), others: Array.from(others).sort() };
  }
  return { groups: Array.from(g1Set).sort(), subgroups: Array.from(g2Set).sort(), others: Array.from(others).sort() };
}

export function getParts(
  c12n: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
): ClassificationParts {
  const [lvlIdx, unused] = getLevelIndex(c12n, c12nDef);
  const [req, unusedParts] = getRequired(unused, c12nDef, format, isMobile);
  const { groups, subgroups, others } = getGroups(unusedParts, c12nDef, format, isMobile);

  if (others.length > 0) {
    throw new InvalidClassification(`Unparsable classification parts: ${others.join(',')}`);
  }

  return {
    lvlIdx,
    lvl: getLevelText(lvlIdx, c12nDef, format, isMobile),
    req: req,
    groups: groups,
    subgroups: subgroups
  };
}

export function canSeeRequired(user_req, req) {
  // user's require values must be a superset of given require values
  // (ie. user must have all of the required values)
  if (req.length <= 0) return true;
  const userSet = new Set(user_req);
  const reqSet = new Set(req);

  for (const elem of reqSet) {
    if (!userSet.has(elem)) {
      return false;
    }
  }
  return true;
}

export function canSeeGroups(user_groups, groups) {
  // user's groups must have an intersection between required groups
  // (ie. user must have at least one of the given groups)
  if (groups.length === 0) return true;
  const groupSet = new Set(groups);
  const userSet = new Set(user_groups);

  for (const elem of groupSet) {
    if (userSet.has(elem)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize a given classification by applying the rules defined in the classification definition.
 * This function will remove any invalid parts and add missing parts to the classification.
 * It will also ensure that the display of the classification is always done the same way
 *
 * Note: This function mutates the passed in `parts` parameter.
 *
 * @param parts - `ClassificationParts` object containing the parsed classification components
 * @param c12nDef - ClassificationDefinition returned by the API server
 * @param format - return results in `long` or `short` format
 * @param isMobile - `true`/`false` if the results should be returned for display on a mobile device
 *
 * @returns A normalized version of the original classification
 *
 */
export function normalizedClassification(
  parts: ClassificationParts,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean,
  skipAutoSelect: boolean = false
): string {
  if (!c12nDef.enforce || !!c12nDef.invalid_mode) return c12nDef.UNRESTRICTED;

  const longFormat = format === 'short' || !!isMobile ? false : true;
  const groupDelim = !!longFormat ? 'REL TO ' : 'REL ';
  const { lvlIdx, lvl } = parts;
  let { groups, subgroups, req } = parts;

  // convert to correct format
  req = req.map(r => {
    if (!!longFormat) {
      return c12nDef.access_req_map_stl[r] || r;
    }
    return c12nDef.access_req_map_lts[r] || r;
  });
  groups = groups.map(g => {
    if (!!longFormat) {
      return c12nDef.groups_map_stl[g] || g;
    }
    return c12nDef.groups_map_lts[g] || g;
  });
  subgroups = subgroups.map(g => {
    if (!!longFormat) {
      return c12nDef.subgroups_map_stl[g] || g;
    }
    return c12nDef.subgroups_map_lts[g] || g;
  });

  // 1. Check for all required items if they need a specific level
  let out = lvl;
  let requiredLvlIdx = 0;
  for (const r of req) {
    const rl = !!c12nDef.params_map?.[r]?.require_lvl ? c12nDef.params_map[r].require_lvl : 0;
    requiredLvlIdx = Math.max(requiredLvlIdx, rl);
  }
  out = getLevelText(Math.max(lvlIdx, requiredLvlIdx), c12nDef, format, isMobile);

  // 2. Check for all required items if they should be shown inside the groups display part
  const reqGrp = new Set<string>();
  for (const r of req) {
    if (!!c12nDef.params_map[r]?.is_required_group) {
      reqGrp.add(r);
    }
  }
  let tempReq = Array.from(new Set([...req].filter(x => !reqGrp.has(x))));
  if (tempReq.length > 0) {
    out += '//' + tempReq.sort().join('/');
  }
  if (reqGrp.size > 0) {
    out += '//' + Array.from(reqGrp).sort().join('/');
  }

  // 3. Add auto-selected subgroups
  let tempSubGroups = [...subgroups];
  if (!!longFormat) {
    if (subgroups.length > 0 && c12nDef.subgroups_auto_select.length > 0 && !skipAutoSelect) {
      tempSubGroups = Array.from(new Set([...subgroups, ...c12nDef.subgroups_auto_select])).sort();
    }
  } else {
    if (subgroups.length > 0 && c12nDef.subgroups_auto_select_short.length > 0 && !skipAutoSelect) {
      tempSubGroups = Array.from(new Set([...subgroups, ...c12nDef.subgroups_auto_select_short])).sort();
    }
  }

  // 4. For every subgroup, check if the subgroup requires or is limited to a specific group
  let tempGroups = [];
  for (const sg of tempSubGroups) {
    const rGrp = c12nDef.params_map[sg]?.require_group;
    if (!!rGrp) {
      tempGroups.push(rGrp);
    }

    const limToGrp = c12nDef.params_map[sg]?.limited_to_group;
    if (!!limToGrp) {
      if (limToGrp in tempGroups) {
        tempGroups = [limToGrp];
      } else {
        tempGroups = [];
      }
    }
  }

  for (const g of tempGroups) {
    if (!!longFormat) {
      groups.push(c12nDef.groups_map_stl[g] || g);
    } else {
      groups.push(c12nDef.groups_map_lts[g] || g);
    }
  }
  groups = Array.from(new Set(groups));

  // 5. Add auto-selected groups
  if (!!longFormat) {
    if (groups.length > 0 && c12nDef.groups_auto_select.length > 0 && !skipAutoSelect) {
      groups = Array.from(new Set([...groups, ...c12nDef.groups_auto_select])).sort();
    }
  } else {
    if (groups.length > 0 && c12nDef.groups_auto_select_short.length > 0 && !skipAutoSelect) {
      groups = Array.from(new Set([...groups, ...c12nDef.groups_auto_select_short])).sort();
    }
  }

  if (groups.length > 0) {
    groups = groups.sort();
    out += reqGrp.size > 0 ? '/' : '//';
    if (groups.length === 1) {
      // 6. If only one group, check if it has a solitary display name.
      const grp = groups[0];
      const displayName = c12nDef.params_map[grp]?.solitary_display_name || grp;
      out += displayName !== grp ? displayName : groupDelim + grp;
    } else {
      if (!longFormat) {
        // 7. In short format mode, check if there is an alias that can replace multiple groups
        for (const [alias, values] of Object.entries(c12nDef.groups_aliases)) {
          if (values.length > 1) {
            if (JSON.stringify(values.sort()) === JSON.stringify(groups)) {
              groups = [alias];
            }
          }
        }
      }
      out += groupDelim + groups.sort().join(', ');
    }
  }

  if (tempSubGroups.length > 0) {
    if (groups.length > 0 || reqGrp.size > 0) {
      out += '/';
    } else {
      out += '//';
    }
    out += tempSubGroups.sort().join('/');
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

/**
 * Combines groups to find the maximum
 *
 * @param grps1 - First groups
 * @param grps2 - Second groups
 *
 * @returns The a combination of the given groups
 *
 */
function getMaxGroups(grps1: string[], grps2: string[]): string[] {
  let groups = new Set<string>();
  if (grps1.length > 0 && grps2.length > 0) {
    // intersect sets
    const g2 = new Set(grps2);
    groups = new Set([...grps1].filter(x => g2.has(x)));
  } else {
    // union sets
    groups = new Set([...grps1, ...grps2]);
  }

  if (grps1.length > 0 && grps2.length > 0 && groups.size <= 0) {
    // NOTE: Intersection generated nothing, we will raise an InvalidClassification exception
    throw new InvalidClassification(
      `Could not find any intersection between the groups. ${grps1.toString()} & ${grps2.toString()}`
    );
  }
  return Array.from(groups);
}

/**
 * Mixes two classifications and returns to most restrictive form for them
 *
 * @param c12n_1 - First classification
 * @param c12n_2 - Second classification
 * @param c12nDef - ClassificationDefinition returned by the API server
 * @param format - return results in `long` or `short` format
 * @param isMobile - `true`/`false` if the results should be returned for display on a mobile device
 *
 * @returns The most restrictive classification that we could create out of the two
 *
 */
export function getMaxClassification(
  c12n_1: string,
  c12n_2: string,
  c12nDef: ClassificationDefinition,
  format: FormatProp,
  isMobile: boolean
) {
  if (!c12nDef.enforce || !!c12nDef.invalid_mode) {
    const noEnforceParts = getParts(c12nDef.UNRESTRICTED, c12nDef, format, isMobile);
    return normalizedClassification(noEnforceParts, c12nDef, format, isMobile);
  }

  const c12n1Parts = getParts(c12n_1, c12nDef, format, isMobile);
  const c12n2Parts = getParts(c12n_2, c12nDef, format, isMobile);
  if (!c12n_1) {
    return normalizedClassification(c12n2Parts, c12nDef, format, isMobile);
  }
  if (!c12n_2) {
    return normalizedClassification(c12n1Parts, c12nDef, format, isMobile);
  }

  const req = Array.from(new Set([...c12n1Parts.req, ...c12n2Parts.req]));
  const groups = getMaxGroups(c12n1Parts.groups, c12n2Parts.groups);
  const subgroups = getMaxGroups(c12n1Parts.subgroups, c12n2Parts.subgroups);

  const lvlIdx = Math.max(c12n1Parts.lvlIdx, c12n2Parts.lvlIdx);
  const out: ClassificationParts = {
    lvlIdx: lvlIdx,
    lvl: getLevelText(lvlIdx, c12nDef, format, isMobile),
    req: req,
    groups: groups,
    subgroups: subgroups
  };

  return normalizedClassification(out, c12nDef, format, isMobile);
}

/**
 *
 * Given a user classification, check if a user is allow to see a certain classification
 *
 * @param user_c12n - Maximum classification for the user
 * @param c12n - Classification the user wishes to see
 * @param c12nDef - ClassificationDefinition returned by the API server
 * @param enforce - `true`/`false` if access controls are enabled
 * @param ignoreInvalid - `true`/`false` if invalid classifications should raise errors or just deny access
 *
 * @returns True is the user can see the classification
 *
 */
export function isAccessible(
  user_c12n: string,
  c12n: string,
  c12nDef: ClassificationDefinition,
  enforce: boolean = false,
  ignoreInvalid: boolean = false
) {
  if (!!c12nDef.invalid_mode) return false;
  if (!enforce) return true;
  if (!c12n) return true;

  try {
    const userParts = getParts(user_c12n, c12nDef, 'long', false);
    const parts = getParts(c12n, c12nDef, 'long', false);

    if (Number(userParts.lvlIdx) >= Number(parts.lvlIdx)) {
      if (!canSeeRequired(userParts.req, parts.req)) return false;
      if (!canSeeGroups(userParts.groups, parts.groups)) return false;
      if (!canSeeGroups(userParts.subgroups, parts.subgroups)) return false;
      return true;
    }
    return false;
  } catch (e) {
    if (e instanceof InvalidClassification) {
      if (!!ignoreInvalid) {
        return false;
      }
    }
    throw e;
  }
}
