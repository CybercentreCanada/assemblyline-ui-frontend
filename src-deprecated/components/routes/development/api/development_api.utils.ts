import type { Method } from 'components/models/utils/request';
import type { Request } from 'components/routes/development/api/development_api.models';
import type { PossibleColor } from 'helpers/colors';

export const METHOD_COLOR_MAP: Record<Method, PossibleColor> = {
  GET: 'success',
  HEAD: 'default',
  POST: 'info',
  PUT: 'primary',
  DELETE: 'error',
  CONNECT: 'default',
  OPTIONS: 'default',
  TRACE: 'default',
  PATCH: 'default'
};

export const STATUS_CODES: Record<number, { name: string; description: string }> = {
  100: {
    name: 'Continue',
    description:
      'This interim response indicates that the client should continue the request or ignore the response if the request is already finished.'
  },
  101: {
    name: 'Switching Protocols',
    description:
      'This code is sent in response to an Upgrade request header from the client and indicates the protocol the server is switching to.'
  },
  102: {
    name: 'Processing (Deprecated)',
    description:
      'This code was used in WebDAV contexts to indicate that a request has been received by the server, but no status was available at the time of the response.'
  },
  103: {
    name: 'Early Hints',
    description:
      'This status code is primarily intended to be used with the Link header, letting the user agent start preloading resources while the server prepares a response or preconnect to an origin from which the page will need resources.'
  },
  200: {
    name: 'OK',
    description: "The request succeeded. The result and meaning of 'success' depends on the HTTP method."
  },
  201: {
    name: 'Created',
    description:
      'The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests.'
  },
  202: {
    name: 'Accepted',
    description:
      'The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request.'
  },
  203: {
    name: 'Non-Authoritative Information',
    description:
      'This response code means the returned metadata is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy.'
  },
  204: {
    name: 'No Content',
    description:
      'There is no content to send for this request, but the headers are useful. The user agent may update its cached headers for this resource with the new ones.'
  },
  205: {
    name: 'Reset Content',
    description: 'Tells the user agent to reset the document which sent this request.'
  },
  206: {
    name: 'Partial Content',
    description:
      'This response code is used in response to a range request when the client has requested a part or parts of a resource.'
  },
  207: {
    name: 'Multi-Status (WebDAV)',
    description:
      'Conveys information about multiple resources, for situations where multiple status codes might be appropriate.'
  },
  208: {
    name: 'Already Reported (WebDAV)',
    description:
      'Used inside a <dav:propstat> response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.'
  },
  226: {
    name: 'IM Used (HTTP Delta encoding)',
    description:
      'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.'
  },
  300: {
    name: 'Multiple Choices',
    description:
      'In agent-driven content negotiation, the request has more than one possible response and the user agent or user should choose one of them.'
  },
  301: {
    name: 'Moved Permanently',
    description: 'The URL of the requested resource has been changed permanently. The new URL is given in the response.'
  },
  302: {
    name: 'Found',
    description: 'This response code means that the URI of requested resource has been changed temporarily.'
  },
  303: {
    name: 'See Other',
    description:
      'The server sent this response to direct the client to get the requested resource at another URI with a GET request.'
  },
  304: {
    name: 'Not Modified',
    description:
      'This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.'
  },
  305: {
    name: 'Use Proxy (Deprecated)',
    description:
      'Defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns.'
  },
  306: {
    name: 'Unused',
    description:
      'This response code is no longer used but is reserved. It was used in a previous version of the HTTP/1.1 specification.'
  },
  307: {
    name: 'Temporary Redirect',
    description:
      'The server sends this response to direct the client to get the requested resource at another URI with the same method that was used in the prior request.'
  },
  308: {
    name: 'Permanent Redirect',
    description:
      'This means that the resource is now permanently located at another URI, specified by the Location response header.'
  },
  400: {
    name: 'Bad Request',
    description:
      'The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).'
  },
  401: {
    name: 'Unauthorized',
    description:
      "Although the HTTP standard specifies 'unauthorized', semantically this response means 'unauthenticated'. That is, the client must authenticate itself to get the requested response."
  },
  402: {
    name: 'Payment Required',
    description:
      'The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.'
  },
  403: {
    name: 'Forbidden',
    description:
      "The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server."
  },
  404: {
    name: 'Not Found',
    description:
      'The server cannot find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.'
  },
  405: {
    name: 'Method Not Allowed',
    description:
      'The request method is known by the server but is not supported by the target resource. For example, an API may not allow DELETE on a resource, or the TRACE method entirely.'
  },
  406: {
    name: 'Not Acceptable',
    description:
      "This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content that conforms to the criteria given by the user agent."
  },
  407: {
    name: 'Proxy Authentication Required',
    description: 'This is similar to 401 Unauthorized but authentication is needed to be done by a proxy.'
  },
  408: {
    name: 'Request Timeout',
    description:
      'This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers use HTTP pre-connection mechanisms to speed up browsing. Some servers may shut down a connection without sending this message.'
  },
  409: {
    name: 'Conflict',
    description:
      'This response is sent when a request conflicts with the current state of the server. In WebDAV remote web authoring, 409 responses are errors sent to the client so that a user might be able to resolve a conflict and resubmit the request.'
  },
  410: {
    name: 'Gone',
    description:
      "This response is sent when the requested content has been permanently deleted from the server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for 'limited-time, promotional services'. APIs should not feel compelled to indicate resources that have been deleted with this status code."
  },
  411: {
    name: 'Length Required',
    description:
      'The server rejected the request because the Content-Length header field is not defined and the server requires it.'
  },
  412: {
    name: 'Precondition Failed',
    description:
      'In conditional requests, the client has indicated preconditions in its headers which the server does not meet.'
  },
  413: {
    name: 'Content Too Large',
    description:
      'The request body is larger than limits defined by the server. The server might close the connection or return a Retry-After header field.'
  },
  414: {
    name: 'URI Too Long',
    description: 'The URI requested by the client is longer than the server is willing to interpret.'
  },
  415: {
    name: 'Unsupported Media Type',
    description:
      'The media format of the requested data is not supported by the server, so the server is rejecting the request.'
  },
  416: {
    name: 'Range Not Satisfiable',
    description:
      "The ranges specified by the Range header field in the request cannot be fulfilled. It's possible that the range is outside the size of the target resource's data."
  },
  417: {
    name: 'Expectation Failed',
    description:
      'This response code means the expectation indicated by the Expect request header field cannot be met by the server.'
  },
  418: {
    name: "I'm a Teapot",
    description: 'The server refuses the attempt to brew coffee with a teapot.'
  },
  421: {
    name: 'Misdirected Request',
    description:
      'The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.'
  },
  422: {
    name: 'Unprocessable Content (WebDAV)',
    description: 'The request was well-formed but was unable to be followed due to semantic errors.'
  },
  423: {
    name: 'Locked (WebDAV)',
    description: 'The resource that is being accessed is locked.'
  },
  424: {
    name: 'Failed Dependency (WebDAV)',
    description: 'The request failed due to failure of a previous request.'
  },
  425: {
    name: 'Too Early (Experimental)',
    description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.'
  },
  426: {
    name: 'Upgrade Required',
    description:
      'The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an Upgrade header in a 426 response to indicate the required protocol(s).'
  },
  428: {
    name: 'Precondition Required',
    description:
      "The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client GETs a resource's state, modifies it and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict."
  },
  429: {
    name: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time (rate limiting).'
  },
  431: {
    name: 'Request Header Fields Too Large',
    description:
      'The server is unwilling to process the request because its header fields are too large. The request may be resubmitted after reducing the size of the request header fields.'
  },
  451: {
    name: 'Unavailable For Legal Reasons',
    description:
      'The user agent requested a resource that cannot legally be provided, such as a web page censored by a government.'
  },
  500: {
    name: 'Internal Server Error',
    description:
      'The server has encountered a situation it does not know how to handle. This error is generic, indicating that the server cannot find a more appropriate 5XX status code to respond with.'
  },
  501: {
    name: 'Not Implemented',
    description:
      'The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.'
  },
  502: {
    name: 'Bad Gateway',
    description:
      'This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.'
  },
  503: {
    name: 'Service Unavailable',
    description:
      'The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This response should be used for temporary conditions and the Retry-After HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.'
  },
  504: {
    name: 'Gateway Timeout',
    description:
      'This error response is given when the server is acting as a gateway and cannot get a response in time.'
  },
  505: {
    name: 'HTTP Version Not Supported',
    description: 'The HTTP version used in the request is not supported by the server.'
  },
  506: {
    name: 'Variant Also Negotiates',
    description:
      'The server has an internal configuration error: during content negotiation, the chosen variant is configured to engage in content negotiation itself, which results in circular references when creating responses.'
  },
  507: {
    name: 'Insufficient Storage (WebDAV)',
    description:
      'The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.'
  },
  508: {
    name: 'Loop Detected (WebDAV)',
    description: 'The server detected an infinite loop while processing the request.'
  },
  510: {
    name: 'Not Extended',
    description:
      'The client request declares an HTTP Extension (RFC 2774) that should be used to process the request, but the extension is not supported.'
  },
  511: {
    name: 'Network Authentication Required',
    description: 'Indicates that the client needs to authenticate to gain network access.'
  }
};

export const parseRequest = (input: string): Request => {
  // Initialize the output object with default values
  let result: Request = {
    comment: null,
    url: null,
    method: null,
    body: null,
    response: null,
    error: null
  };

  // Extract the comment block (e.g., /** comment */) from the input
  result.comment = input.match(/\/\*[\s\S]*?\*\//)?.[0] || null;

  try {
    // Remove the comment from the input and parse the remaining JSON string
    const jsonString = input.replace(result.comment || '', '').trim();
    const parsedData = JSON.parse(jsonString) as Partial<Request>;

    // Update the result object with parsed data, falling back to defaults
    result = {
      ...result,
      url: parsedData.url || null,
      method: parsedData.method || null,
      body: parsedData.body || null,
      response: parsedData.response || null,
      error: null // Ensure error is cleared in case of successful parsing
    };
  } catch (error: unknown) {
    // Capture any parsing errors and store them in the result
    result.error = error instanceof Error ? error : new Error('Unknown parsing error');
  }

  return result; // Return the processed request object
};

export const stringifyRequest = ({
  comment = '',
  url = '',
  method = 'GET',
  body = null,
  response = null
}: Request): string => {
  // Escape dynamic segments in the URL and format with placeholders
  const formattedUrl = url.replaceAll(/<[^>]*>/g, (match, index) => `\${${index}:${match}}`);

  // Format the body: null or stringified JSON
  const formattedBody =
    body === null ? 'null' : typeof body === 'string' ? `"${body}"` : JSON.stringify(body, null, '\t');

  // Format the response: null or pretty-printed JSON
  const formattedResponse = response ? JSON.stringify(response, null, '\t') : 'null';

  // Construct the request string in a clear, formatted way
  return [
    comment, // Add the comment block at the beginning
    '{',
    `\t"url": "${formattedUrl}",`,
    `\t"method": "${method}",`,
    `\t"body": ${formattedBody},`,
    `\t"response": ${formattedResponse}`,
    '}'
  ].join('\n'); // Join all lines with a newline character
};

export const formatMilliseconds = (milliseconds: number): string => {
  // Guard clause: Check if the input is null, undefined, or invalid
  if (!milliseconds || typeof milliseconds !== 'number' || milliseconds < 0) {
    return null;
  }

  // Define time constants
  const MS_IN_A_SECOND = 1000;
  const MS_IN_A_MINUTE = MS_IN_A_SECOND * 60;
  const MS_IN_AN_HOUR = MS_IN_A_MINUTE * 60;
  const MS_IN_A_DAY = MS_IN_AN_HOUR * 24;

  // Calculate time components
  const days = Math.floor(milliseconds / MS_IN_A_DAY);
  milliseconds %= MS_IN_A_DAY;

  const hours = Math.floor(milliseconds / MS_IN_AN_HOUR);
  milliseconds %= MS_IN_AN_HOUR;

  const minutes = Math.floor(milliseconds / MS_IN_A_MINUTE);
  milliseconds %= MS_IN_A_MINUTE;

  const seconds = Math.floor(milliseconds / MS_IN_A_SECOND);
  milliseconds %= MS_IN_A_SECOND;

  // Remove fractional part by flooring the milliseconds
  milliseconds = Math.floor(milliseconds);

  // Build the human-readable string with short labels
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}hr`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0) parts.push(`${seconds}sec`);
  if (milliseconds > 0 || parts.length === 0) {
    parts.push(`${milliseconds}ms`);
  }

  return parts.join(', ');
};
