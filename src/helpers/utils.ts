import { ConfigurationDefinition } from 'components/hooks/useMyUser';
import { PossibleColors } from 'components/visual/CustomChip';

/**
 *
 * Given a string, converts to Title Case by splitting on `_` and whitespace
 *
 * @param s - string to conver to title case
 *
 * @returns title cased string
 *
 */
export function toTitleCase(s: string) {
  return s
    .replace(/_/g, ' ')
    .split(' ')
    .filter(x => typeof x === 'string' && x.length > 0)
    .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
    .join(' ');
}

/**
 *
 * Extract the `filename` parameter out of the `Content-Disposition` HTTP response header
 *
 * @param disposition - `Content-Disposition` header
 *
 * @returns filename contents
 *
 */
export function getFileName(disposition: string): string {
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName: string = null;
  if (utf8FilenameRegex.test(disposition)) {
    fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
  } else {
    // prevent ReDos attacks by anchoring the ascii regex to string start and
    //  slicing off everything before 'filename='
    const filenameStart = disposition.toLowerCase().indexOf('filename=');
    if (filenameStart >= 0) {
      const partialDisposition = disposition.slice(filenameStart);
      const matches = asciiFilenameRegex.exec(partialDisposition);
      if (matches != null && matches[2]) {
        fileName = matches[2];
      }
    }
  }
  return fileName;
}

/**
 *
 * Convert a given second to human readable form
 *
 * @param seconds - seconds to convert
 *
 * @returns Human readable string
 *
 */
export function humanSeconds(seconds: number, t) {
  if (seconds < 1) {
    return Math.floor(seconds * 1000) + ' ' + t('milliseconds');
  } else {
    return seconds.toFixed(1) + ' ' + t('seconds');
  }
}

/**
 *
 * Convert a given bytes to human readable form (base 2)
 *
 * @param bytes - total bytes to convert
 *
 * @returns Human readable string
 *
 */
export function bytesToSize(bytes: number | null) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0 || bytes === null) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

/**
 *
 * Format a version string into a standard response.
 *
 * @param verison - version string to parse
 *
 * @returns response.service_version:<framework>.<major>.<minor>.<build>
 *
 */
export function getVersionQuery(version: string | null) {
  try {
    const [framework, major, minor, build] = version.replace('stable', '').split('.');
    if (build.indexOf('dev') === -1) {
      return `response.service_version:${framework}.${major}.${minor}.${build} OR response.service_version:${framework}.${major}.${minor}.stable${build}`;
    }
    return `response.service_version:${version}`;
  } catch (e) {
    return `response.service_version:${version}`;
  }
}

/**
 *
 * Convert a given number to human readable form (base 10)
 *
 * @param number - number to convert
 *
 * @returns Human readable string (with SI suffix)
 *
 */
export function humanReadableNumber(num: number | null) {
  const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e', 'z', 'y'];
  if (num === 0 || num === null) return '0 ';
  const i = Math.floor(Math.log(num) / Math.log(1000));
  return `${Math.round(num / Math.pow(1000, i))}${sizes[i]} `;
}

/**
 *
 * Sets the favicon link back to the default icon
 *
 * @returns {void}
 *
 */
export function resetFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `${process.env.PUBLIC_URL}/favicon.ico`;
}

/**
 *
 * Sets the favicon to the default notify/done icon
 *
 * @returns {void}
 *
 */
export function setNotifyFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `${process.env.PUBLIC_URL}/favicon_done.ico`;
}

/**
 * Mapping of string verdict to css-color
 */
const COLOR_MAP = {
  safe: 'success',
  info: 'default',
  suspicious: 'warning',
  highly_suspicious: 'warning',
  malicious: 'error'
};

/**
 *
 * Get the corresponding color class for the given verdict
 *
 * @param verdict - maliciousness verdict
 *
 * @returns color
 *
 */
export function verdictToColor(verdict): PossibleColors {
  return COLOR_MAP[verdict];
}

/**
 * Mapping of string rank to number rank
 */
const RANK_MAP = {
  safe: 4,
  info: 3,
  suspicious: 2,
  highly_suspicious: 1,
  malicious: 0
};

/**
 *
 * Get the corresponding ranking number for the given verdict
 *
 * @param verdict - maliciousness verdict
 *
 * @returns rank
 *
 */
export function verdictRank(verdict): number {
  return RANK_MAP[verdict];
}

/**
 *
 * Get the text representation of the given priority number
 *
 * @param priority - priority number
 *
 * @returns human readable priority
 *
 */
export function priorityText(priority: number | null) {
  if (priority >= 1500) {
    return 'user-high';
  }

  if (priority >= 1000) {
    return 'user-medium';
  }

  if (priority >= 500) {
    return 'user-low';
  }

  if (priority >= 300) {
    return 'critical';
  }

  if (priority >= 200) {
    return 'high';
  }

  if (priority >= 100) {
    return 'medium';
  }

  return 'low';
}

/**
 *
 * Get a value from an object for a given path
 *
 * @param obj - the object to parse
 * @param path - the dotted path to look up
 *
 * @returns value from path
 *
 */
export function getValueFromPath(obj: object, path: string) {
  if (path === undefined || path === null) {
    return undefined;
  }
  const paths = path.split('.');
  let current = obj;
  let i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current;
}

/**
 *
 * Get the oauth provider info
 *
 * @returns oauth provider
 *
 */
export function getProvider() {
  if (window.location.pathname.indexOf(`${process.env.PUBLIC_URL}/oauth/`) !== -1) {
    return window.location.pathname.split(`${process.env.PUBLIC_URL}/oauth/`).pop().slice(0, -1);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('provider');
}

/**
 *
 * Check if we are receiving a SAML sign-in message
 *
 * @returns oauth provider
 *
 */
export function getSAMLData() {
  if (window.location.pathname.indexOf(`${process.env.PUBLIC_URL}/saml/`) !== -1) {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data !== null || data !== undefined) {
      return JSON.parse(atob(data).toString());
    }
  }

  return null;
}

/**
 *
 * Convert the returned result count from an Elasticsearch query into a meaningful string.
 * Only in the case of results exactly totaling the limit, Elastic may or may not still have more results.
 * In this case, a '+' is appended to indicate an approximiation.
 *
 * @param count - number of results returned from an Elasticsearch query
 * @param max - the result limit set in Elasticsearch
 *
 * @returns count
 *
 */
export function searchResultsDisplay(count: number, max: number = 10000) {
  const params = new URLSearchParams(window.location.search);
  const trackedHits = params.get('track_total_hits');

  if (count === parseInt(trackedHits) || (trackedHits === null && count === max)) {
    return `${count}+`;
  }

  return `${count}`;
}

/**
 *
 * Truncate the given string to the provided length and append ellipses.
 *
 * @param str - string to truncate
 * @param len - max length of string
 *
 * @returns truncated string
 *
 */
export function maxLenStr(str: string, len: number) {
  if (str.length > len) {
    return `${str.substr(0, len - 3)}...`;
  }
  return str;
}

/**
 *
 * Converts data to a string, escapes double backslash and double quotes and wraps in double quotes.
 *
 * @param data - data to esacpe
 *
 * @returns escaped string
 *
 */
export function safeFieldValue(data: string | number | boolean) {
  const temp = String(data);
  return `"${temp.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 *
 * Converts data to a "safe" string and then URI encodes it.
 *
 * @param data - data to esacpe
 *
 * @returns URI encoded, escaped string
 *
 */
export function safeFieldValueURI(data: string | number | boolean) {
  return `${encodeURIComponent(safeFieldValue(data))}`;
}

/**
 *
 * Matches on valid SHA256 hashes and returns the hash. Returns `null` on invalid hashes.
 *
 * @param data - data to parse
 *
 * @returns sha256 hash as a string, or null
 *
 */
export function matchSHA256(data: string) {
  const sha256ParseRE = /^\s*([a-fA-F0-9]{64})\s*$/;
  const output = sha256ParseRE.exec(data);
  return output ? output[1] : output;
}

/**
 *
 * Matches on valid URL and returns the result array. Returns `null` on invalid URLs.
 * Note: Path and Query params are validated but not captured.
 *
 * @param data - string to parse
 *
 * @returns Matching RegEx Result Array or NULL
 *
 */
export function matchURL(data: string): RegExpExecArray | null {
  const urlParseRE =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
  return urlParseRE.exec(data);
}

/**
 *
 * A function working the same way as array.filter but for object
 *
 * @param obj - obj to filter
 * @param callback - function used to do the filtering
 *
 * @returns new object with filtered keys
 *
 */
export function filterObject(obj: Object, callback) {
  return Object.fromEntries(Object.entries(obj).filter(([key, val]) => callback(val, key)));
}

/**
 *
 * A function that determines the submittable type of the input string, if any.
 *
 * @param input - value to check
 *
 * @returns type as string or NULL
 *
 */
export function getSubmitType(input: string, configuration: ConfigurationDefinition): string | null {
  // If we're trying to auto-detect the input type, iterate over file sources
  if (!input || input === undefined) return null;
  if (!configuration?.submission?.file_sources) return null;

  let detectedHashType = Object.entries(configuration.submission.file_sources).find(
    ([_, hashProps]) => hashProps && input.match(new RegExp(hashProps?.pattern))
  )?.[0];

  if (!detectedHashType && matchURL(input)) {
    // Check to see if the input is a valid URL
    detectedHashType = 'url';
  }
  return detectedHashType;
}

/**
 *
 * Sum all the values of an object
 *
 * @param obj an object of values to be added together
 *
 * @returns type as number
 *
 */
type ObjectOfInts = {
  [name: string]: number;
};
export const sumValues = (obj: ObjectOfInts) => Object.values(obj).reduce((a, b) => a + b, 0);
