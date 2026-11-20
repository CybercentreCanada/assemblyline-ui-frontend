import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import type { HashParamBlueprintKind } from 'features/hash-params';
import type { PathParamBlueprintKind } from 'features/path-params';
import type { SearchParamBlueprintKind, SearchParamSource } from 'features/search-params';
import type { ReactNode } from 'react';

//*****************************************************************************************
// Param Kind
//*****************************************************************************************

/** Union of every blueprint kind a path, search, or hash param can resolve to. */
export type DevelopmentRoutesParamKind = PathParamBlueprintKind | SearchParamBlueprintKind | HashParamBlueprintKind;

/** Single-character label shown inside the kind badge for each param kind. */
export const PARAM_KIND_LABEL: Record<DevelopmentRoutesParamKind, string> = {
  string: 't',
  number: '#',
  boolean: 'b',
  enum: '≡',
  filters: 'f',
  object: '{}'
};

/** Shared `sx` override that squares off a chip's corners (used for value/option chips). */
export const SQUARE_CHIP_SX = { borderRadius: 0 } as const;

//*****************************************************************************************
// Path Param Spec
//*****************************************************************************************

/** Display-ready description of a single path (`:param`) blueprint. */
export type DevelopmentRoutesParamSpec = {
  /** Formatted default value shown next to the param key. */
  defaultValueLabel: string;
  /** Param key extracted from the route path. */
  key: string;
  /** Blueprint variant that produced this param. */
  kind: PathParamBlueprintKind;
  /** Formatted enum options, present only for `enum` blueprints. */
  options?: string[];
};

/** Default path param spec, used as a safe fallback when no blueprint is available. */
export const DEFAULT_DEVELOPMENT_ROUTES_PARAM_SPEC: DevelopmentRoutesParamSpec = {
  defaultValueLabel: '—',
  key: '',
  kind: 'string'
};

//*****************************************************************************************
// Search Param Spec
//*****************************************************************************************

/** Boolean configuration flag that can be active on a search param blueprint. */
export type DevelopmentRoutesSearchParamFlag = 'locked' | 'ephemeral' | 'nullable' | 'ignored';

/** Icon shown for each search param flag; the flag name itself is spelled out only in a tooltip. */
export const FLAG_CHIP_ICON: Record<DevelopmentRoutesSearchParamFlag, ReactNode> = {
  locked: <LockOutlinedIcon color="error" sx={{ fontSize: 24 }} />,
  ephemeral: <ScheduleOutlinedIcon color="warning" sx={{ fontSize: 24 }} />,
  nullable: <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>∅</span>,
  ignored: <VisibilityOffOutlinedIcon color="disabled" sx={{ fontSize: 24 }} />
};

/** Icon shown for each search param source; the source name itself is spelled out only in a tooltip. */
export const SOURCE_ICON: Record<SearchParamSource, ReactNode> = {
  search: <SearchOutlinedIcon sx={{ fontSize: 20 }} />,
  state: <StorageOutlinedIcon sx={{ fontSize: 20 }} />,
  transient: <BoltOutlinedIcon sx={{ fontSize: 20 }} />
};

/** Display-ready description of a single search param blueprint. */
export type DevelopmentRoutesSearchParamSpec = {
  /** Formatted default value shown next to the param key. */
  defaultValueLabel: string;
  /** Active boolean flags (`locked`, `ephemeral`, `nullable`, `ignored`). */
  flags: DevelopmentRoutesSearchParamFlag[];
  /** Param key configured on the search param engine. */
  key: string;
  /** Blueprint variant that produced this param. */
  kind: SearchParamBlueprintKind;
  /** Configured maximum, present only for `number` blueprints with a max. */
  max?: number | null;
  /** Configured minimum, present only for `number` blueprints with a min. */
  min?: number | null;
  /** Formatted enum options, present only for `enum` blueprints. */
  options?: string[];
  /** Where this param resolves its value from. */
  source: SearchParamSource;
};

/** Default search param spec, used as a safe fallback when no blueprint is available. */
export const DEFAULT_DEVELOPMENT_ROUTES_SEARCH_PARAM_SPEC: DevelopmentRoutesSearchParamSpec = {
  defaultValueLabel: '—',
  flags: [],
  key: '',
  kind: 'string',
  source: 'search'
};

//*****************************************************************************************
// Hash Param Spec
//*****************************************************************************************

/** Display-ready description of a route's single hash param blueprint. */
export type DevelopmentRoutesHashParamSpec = {
  /** Formatted default value shown next to the kind badge. */
  defaultValueLabel: string;
  /** Blueprint variant that produced this param. */
  kind: HashParamBlueprintKind;
  /** Formatted enum options, present only for `enum` blueprints. */
  options?: string[];
};

/** Default hash param spec, used as a safe fallback when no blueprint is available. */
export const DEFAULT_DEVELOPMENT_ROUTES_HASH_PARAM_SPEC: DevelopmentRoutesHashParamSpec = {
  defaultValueLabel: '—',
  kind: 'string'
};

//*****************************************************************************************
// Table Row
//*****************************************************************************************

/** Flattened, display-ready representation of a single `AppRoute` for the inventory table. */
export type DevelopmentRoutesTableRowData = {
  /** Route ancestor path, or a placeholder when the route has none. */
  ancestor: string;
  /** Formatted source text of the route's `disabled` guard function. */
  disabled: string;
  /** Formatted source text of the route's `forbidden` guard function. */
  forbidden: string;
  /** Rendered full icon element, or a placeholder when the route has none. */
  fullIcon: ReactNode;
  /** Translated full name, in English. */
  fullNameEN: string;
  /** Translated full name, in French. */
  fullNameFR: string;
  /** Hash param spec, or `null` when the route has no hash configured. */
  hashParam: DevelopmentRoutesHashParamSpec | null;
  /** Route path pattern (e.g. `/submission/detail/:id`). */
  path: string;
  /** Path param specs, one per `:param` segment. */
  pathParams: DevelopmentRoutesParamSpec[];
  /** Original route definition this row was derived from. */
  route: AppRoute;
  /** Search param specs, one per configured search param key. */
  searchParams: DevelopmentRoutesSearchParamSpec[];
  /** Rendered short icon element, or a placeholder when the route has none. */
  shortIcon: ReactNode;
  /** Translated short name, in English. */
  shortNameEN: string;
  /** Translated short name, in French. */
  shortNameFR: string;
};
