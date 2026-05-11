/** Individual enrichment attribute from an external data source. */
export type ExternalEnrichmentItem = {
  /** Type or grouping for the result. */
  group: string;
  /** Name key for the enrichment attribute. */
  name: string;
  /** Description/help text for the name field. */
  name_description: string;
  /** Enrichment value. */
  value: string;
  /** Description/help text for the value field. */
  value_description: string;
  /** Classification level of the enrichment item. */
  classification: string;
};

/** Result returned by an external data source enrichment query. */
export type ExternalEnrichmentResult = {
  /** URL link to the enrichment results. */
  link: string;
  /** Number of hits found in the enrichment search. */
  count: number;
  /** Classification level of the search result. */
  classification: string;
  /** Whether the result is confirmed as malicious. */
  confirmed: boolean;
  /** Summary/description of the findings. */
  description: string;
  /** Whether the result is identified as malicious. */
  malicious: boolean;
  /** List of enrichment attributes from the data source. */
  enrichment: ExternalEnrichmentItem[];
};

/** Enrichment results from a single external data source for a given query. */
export type ExternalEnrichmentResults = Record<
  string,
  {
    /** Error message returned by the data source, if any. */
    error?: null | string;
    /** List of enrichment results returned by the data source. */
    items?: ExternalEnrichmentResult[];
    /** Whether the enrichment query is currently in progress. */
    inProgress?: null | boolean;
  }
>;

/** Cached enrichment state indexed by tag key (tag_name_tag_value). */
export type ExternalEnrichmentState = Record<string, ExternalEnrichmentResults>;
