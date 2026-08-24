import type { Role } from 'components/models/base/user';
import type { Method, RequestBuilder } from 'components/models/utils/request';

/** Represents a single API detail */
export type ApiDocumentation = {
  /** Does the API require login? */
  protected: boolean;

  /** List of roles allowed to access the API */
  require_role: Role[];

  /** Name of the API (e.g., 'Api Doc') */
  name: string;

  /** Unique ID for the API (e.g., 'api_doc') */
  id: string;

  /** Function being called in the code (e.g., 'api.v4.apiv4.api_doc') */
  function: string;

  /** API endpoint path (e.g., '/api/path/<variable>/') */
  path: string;

  /** Is this API only available to the UI? */
  ui_only: boolean;

  /** List of allowed HTTP methods (e.g., ['GET', 'POST']) */
  methods: Method[];

  /** Documentation or description of the API */
  description: string;

  /** Is the documentation complete? */
  complete: boolean;

  /** Does this API count towards the usage quota? */
  count_towards_quota: boolean;
};

/**
 * @name /
 * @description Returns a list of API definition.
 * @method GET
 */
type ApiDocumentationRequest = RequestBuilder<`/api/v4/`, 'GET', null>;

type ApiDocumentationResponse = {
  /** List of API definitions */
  apis: ApiDocumentation[];

  /** Mapping of blueprint names to their documentation */
  blueprints: Record<string, string>;
};

// Define the structure of a single page entry in the result
export type Path = {
  /** The function name or identifier, potentially including a prefix (e.g., "api.v4.") */
  function: string;

  /** The URL to the page */
  url: string;

  /** HTTP methods allowed to access the page (e.g., ["GET", "POST"]) */
  methods: string[];

  /** Indicates if the page is protected by a login decorator */
  protected: boolean;

  /** List of user roles allowed to view the page, or false if no roles are required */
  required_type: boolean | string[];

  /** Indicates if auditing is enabled for the page */
  audit: boolean;

  /** Indicates if the page contributes to a quota count */
  count_towards_quota: boolean;
};

/**
 * @name /site_map/
 * @description Check if all pages have been protected by a login decorator
 * @method GET
 */
type SiteMapRequest = RequestBuilder<`/api/v4/site_map/`, 'GET', null>;

export type SiteMapResponse = Path[];

// prettier-ignore
export type RootRequests =
  | ApiDocumentationRequest
  | SiteMapRequest

// prettier-ignore
export type RootResponses<Request extends RootRequests> =
  Request extends ApiDocumentationRequest ? ApiDocumentationResponse :
  Request extends SiteMapRequest ? SiteMapResponse :
  never;
