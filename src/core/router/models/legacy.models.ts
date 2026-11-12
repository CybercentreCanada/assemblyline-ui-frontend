export type LegacyResolution = {
  /** New href for panel 1 (drawer), if present. */
  1?: string;
  /** New href for panel 0 (main). */
  0: string;
};

export type LegacyRouteTemplate = {
  /** Hash template without the leading `#`. */
  hash?: string;
  /** Pathname template. */
  pathname: string;
};

export type LegacyRule = {
  /** Legacy location templates to match. */
  from: LegacyRouteTemplate;
  /** New panel href templates to produce. */
  to: LegacyResolution;
};
