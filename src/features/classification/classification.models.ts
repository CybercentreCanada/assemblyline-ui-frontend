/**
 * Alias used to render a classification label with a long and short form.
 */
export type Alias = {
  /** Full display name for the alias. */
  name: string;
  /** Short display name for the alias. */
  short_name: string;
};

/**
 * Lookup of alias names to their resolved display metadata.
 */
export type ClassificationAliases = Record<string, Alias>;

/**
 * Default classification aliases used before classification data is loaded.
 */
export const DEFAULT_CLASSIFICATION_ALIASES: ClassificationAliases = {};

/**
 * Output format for a classification string.
 * Long format keeps the full label names while short format keeps the short codes.
 */
export type FormatProp = 'long' | 'short';

/**
 * UI stylesheet metadata for a classification level.
 */
export type LevelStylesheet = {
  /** Name of the color scheme used for display. */
  banner?: string;
  /** Label styling reference. */
  label?: string;
  /** Text styling reference. */
  text?: string;
  /** Color token applied to the level when rendered in the UI. */
  color?: string;
};

/**
 * A classification level definition.
 * Higher numeric values are more restricted.
 */
export type ClassificationLevel = {
  /** Alternate names for the current marking. */
  aliases: string[];
  /** Stylesheet applied in the UI for the different levels. */
  css: LevelStylesheet;
  /** Description of the classification level. */
  description: string;
  /** Integer value of the classification level; higher is more classified. */
  lvl: number;
  /** Long name of the classification item. */
  name: string;
  /** Short name of the classification item. */
  short_name: string;
  /** Hidden from display in the frontend selection picker when set to true. */
  is_hidden?: boolean;
};

/**
 * A required token definition.
 * A user requesting access must have all required tokens to gain access.
 */
export type ClassificationRequired = {
  /** Alternate names for the token. */
  aliases: string[];
  /** Description of the requirement. */
  description: string;
  /** Long name of the requirement. */
  name: string;
  /** When true, the token is displayed in the groups portion of the classification string. */
  is_required_group?: boolean;
  /** Minimum classification level required for the token to be valid. */
  require_lvl?: number;
  /** Short name of the requirement. */
  short_name: string;
  /** Hidden from display when true. */
  is_hidden?: boolean;
};

/**
 * A classification group definition.
 * A user requesting access must be part of at least one of the groups selected for access.
 */
export type ClassificationGroup = {
  /** Alternate names for the group. */
  aliases: string[];
  /** When true, the group is auto-selected whenever any group is selected. */
  auto_select?: boolean;
  /** Description of the group. */
  description: string;
  /** Long name of the group. */
  name: string;
  /** Short name of the group. */
  short_name: string;
  /** Optional solitary display name used when this is the only group selected. */
  solitary_display_name?: string;
  /** Hidden from display when true. */
  is_hidden?: boolean;
};

/**
 * A subgroup definition.
 * A user must be part of at least one subgroup selected for access.
 */
export type ClassificationSubGroup = {
  /** Alternate names for the subgroup. */
  aliases: string[];
  /** When true, the subgroup auto-selects its corresponding group. */
  auto_select?: boolean;
  /** Description of the subgroup. */
  description: string;
  /** Ensures the subgroup can only be used with the specified group. */
  limited_to_group?: string;
  /** Long name of the subgroup. */
  name: string;
  /** Automatically adds the associated group when this subgroup is selected. */
  require_group?: string;
  /** Short name of the subgroup. */
  short_name: string;
  /** Optional solitary display name used when this is the only subgroup selected. */
  solitary_display_name?: string;
  /** Hidden from display when true. */
  is_hidden?: boolean;
};

/**
 * Top-level classification definition.
 */
export type ClassificationYAMLDefinition = {
  /** Turn on/off dynamic group creation. */
  dynamic_groups: boolean;
  /** Set the type of dynamic groups to be used: email, group, or all. */
  dynamic_groups_type: string;
  /** Turn on/off classification enforcement. */
  enforce: boolean;
  /** List of access control groups. */
  groups: ClassificationGroup[];
  /** Graded list where a smaller number is less restricted than a larger one. */
  levels: ClassificationLevel[];
  /** List of required tokens a user must hold to access the item. */
  required: ClassificationRequired[];
  /** Default restricted classification. */
  restricted: string;
  /** List of subgroups that can be selected for access. */
  subgroups: ClassificationSubGroup[];
  /** Default unrestricted classification. */
  unrestricted: string;
};

/**
 * Mapping of a key to a string value.
 */
export type StringMap = Record<string, string>;

/**
 * Mapping of a key to a string-array value.
 */
export type StringMapArray = Record<string, string[]>;

/**
 * Mapping of a level code to stylesheet metadata.
 */
export type StylesheetMap = Record<string, LevelStylesheet>;

/**
 * Optional metadata for a classification parameter.
 */
export type ParamsMap = Record<
  string,
  {
    is_required_group?: boolean;
    solitary_display_name?: string;
    require_lvl?: number;
    require_group?: string;
    limited_to_group?: string;
    is_hidden?: boolean;
  }
>;

/**
 * Full classification definition used by the classification utilities.
 */
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

/**
 * Default classification definition used before classification data is loaded.
 */
export const DEFAULT_CLASSIFICATION_DEFINITION: ClassificationDefinition = {
  RESTRICTED: '',
  UNRESTRICTED: '',
  access_req_aliases: {},
  access_req_map_lts: {},
  access_req_map_stl: {},
  description: {},
  dynamic_groups: false,
  dynamic_groups_type: 'email',
  enforce: false,
  groups_aliases: {},
  groups_auto_select: [],
  groups_auto_select_short: [],
  groups_map_lts: {},
  groups_map_stl: {},
  invalid_mode: true,
  levels_aliases: {},
  levels_map: {},
  levels_map_lts: {},
  levels_map_stl: {},
  levels_styles_map: {},
  original_definition: {
    dynamic_groups: false,
    dynamic_groups_type: '',
    enforce: false,
    groups: [],
    levels: [],
    required: [],
    restricted: '',
    subgroups: [],
    unrestricted: ''
  },
  params_map: {},
  subgroups_aliases: {},
  subgroups_auto_select: [],
  subgroups_auto_select_short: [],
  subgroups_map_lts: {},
  subgroups_map_stl: {}
};

/**
 * Parsed classification parts produced from a raw classification string.
 */
export type ClassificationParts = {
  /** Selected level index. */
  lvlIdx: number;
  /** Level code. */
  lvl: string;
  /** Required access entries. */
  req: string[];
  /** Group entries. */
  groups: string[];
  /** Subgroup entries. */
  subgroups: string[];
};

/**
 * Default parsed classification state.
 */
export const DEFAULT_CLASSIFICATION_PARTS: ClassificationParts = {
  lvlIdx: 0,
  lvl: '',
  req: [],
  groups: [],
  subgroups: []
};

/**
 * Container for classification validation states.
 */
export type ClassificationGroups = {
  /** Group entries parsed from the raw classification string. */
  groups: string[];
  /** Subgroup entries parsed from the raw classification string. */
  subgroups: string[];
  /** Unparsed entries left over after classification resolution. */
  others: string[];
};

/**
 * Disabled controls for invalid options in a classification form.
 */
export type DisabledControls = {
  /** Disabled levels. */
  levels: string[];
  /** Disabled groups. */
  groups: string[];
};

/**
 * Default disabled control state.
 */
export const DEFAULT_DISABLED_CONTROLS: DisabledControls = {
  groups: [],
  levels: []
};

/**
 * Parsed classification state alongside the disabled combinations.
 */
export type ClassificationValidator = {
  disabled: DisabledControls;
  parts: ClassificationParts;
};

/**
 * Default classification validator state.
 */
export const DEFAULT_CLASSIFICATION_VALIDATOR: ClassificationValidator = {
  disabled: DEFAULT_DISABLED_CONTROLS,
  parts: DEFAULT_CLASSIFICATION_PARTS
};
