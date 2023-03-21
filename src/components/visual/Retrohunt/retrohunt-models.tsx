export type RetrohuntParamProps = {};

export type RetrohuntPost = {
  description: string;
  classification: string;
  archive_only: boolean;
  yara_signature: string;
};

export type Retrohunt = {
  code: any;
  creator: any;
  tags: any;
  description: any;
  created: any;
  classification: any;
  yara_signature: any;
  raw_query: any;
  total_indices: any;
  pending_indices: any;
  pending_candidates: any;
  errors: any;
  hits: any;
  finished: any;
  truncated: any;
  archive_only?: boolean;
};

export const DEFAULT_RETROHUNT: Retrohunt = {
  code: 'c7e5da580df940ed8883182396be4baa',
  creator: 'admin',
  tags: {},
  description: 'words',
  created: '2023-03-13T18:21:48.744095Z',
  classification: 'TLP:W',
  yara_signature: `
  rule test_sig {
    strings:
      $first = "Content_Types"
    condition:
      $first
  }
  `,
  raw_query: '{436f6e74656e745f5479706573}',
  total_indices: 3,
  pending_indices: 3,
  pending_candidates: 0,
  errors: [],
  hits: [],
  finished: false,
  truncated: false,
  archive_only: false
};
