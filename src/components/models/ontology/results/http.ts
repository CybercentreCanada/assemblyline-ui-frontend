import type { File } from 'components/models/ontology/file';

/** HTTP Redirect. */
export type HTTPRedirect = {
  /** Source URL before redirection. */
  from_url: string;

  /** Destination URL after redirection. */
  to_url: string;
};

/** HTTP Task. */
export type HTTP = {
  /** The status code of the main page. */
  response_code: number;

  /** The final page of the requested URL. */
  redirection_url?: string;

  /** List of redirects. */
  redirects?: HTTPRedirect[];

  /** The file information of the main favicon. */
  favicon?: File;

  /** The title of the main page after any redirection. */
  title?: string;
};
