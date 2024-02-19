/** Data Types based on the elastic definitions */
export const FIELD_TYPES = [
  'null',
  'boolean',
  'byte',
  'short',
  'integer',
  'long',
  'unsigned_long',
  'double',
  'float',
  'half_float',
  'scaled_float',
  'keyword',
  'text',
  'binary',
  'date',
  'ip',
  'version',
  'object',
  'nested'
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/** Search through specified index for a given query. Uses lucene search syntax for query. */
export type SearchResult<Item> = {
  /** List of results */
  items: Item[];

  /** Offset in the result list */
  offset: number;

  /** Number of results returned */
  rows: number;

  /** Total results found */
  total: number;
};

/** Perform statistical analysis of an integer field to get its min, max, average and count values */
export type StatResult = {
  /** Number of times this field is seen */
  count: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Average value */
  avg: number;

  /** Sum of all values */
  sum: number;
};

/** Generate an histogram based on a time or and int field using a specific gap size */
export type HistogramResult = { [step: string]: number };

/**
 * Perform field analysis on the selected field. (Also known as facetting in lucene)
    This essentially counts the number of instances a field is seen with each specific values
    where the documents matches the specified queries.
 */
export type FacetResult = { [step: string]: number };

export type FieldsResult = {
  [field: string]: {
    default?: boolean;

    /** Is the field indexed */
    indexed: boolean;

    /** Is the field a list */
    list: boolean;

    /** Is the field stored */
    stored: boolean;

    /** What type of data in the field */
    type: FieldType;

    name: string;
  };
};
