import type { Configuration, FileSource, HashPatternMap } from 'models/base/config';
import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import type { PossibleColor } from 'shared/utils/colors';
import { LOWERCASE_HASH, URL_REGEX } from 'shared/utils/constant';

/**
 * @name toTitleCase
 * @description Converts a string to Title Case by splitting on `_` and whitespace.
 * @param s - string to convert to title case
 * @returns title cased string
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
 * @name getFileName
 * @description Extracts the `filename` parameter from a `Content-Disposition` HTTP response header.
 * @param disposition - `Content-Disposition` header value
 * @returns the filename, or null if not found
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
 * @name humanSeconds
 * @description Converts a duration in seconds to a human-readable string.
 * @param seconds - duration in seconds
 * @param t - i18n translation function
 * @returns human-readable duration string
 */
export function humanSeconds(seconds: number, t) {
  if (seconds < 1) {
    return Math.floor(seconds * 1000) + ' ' + t('milliseconds');
  } else {
    return seconds.toFixed(1) + ' ' + t('seconds');
  }
}

/**
 * @name bytesToSize
 * @description Converts a byte count to a human-readable string (base 2).
 * @param bytes - total bytes
 * @returns human-readable size string
 */
export function bytesToSize(bytes: number | null) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0 || bytes === null) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

/**
 * @name getVersionQuery
 * @description Formats a version string into an Elasticsearch query for `response.service_version`.
 * @param version - version string to parse
 * @returns Elasticsearch query string
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
 * @name humanReadableNumber
 * @description Converts a number to a human-readable string with an SI suffix (base 10).
 * @param num - number to convert
 * @returns human-readable string with SI suffix
 */
export function humanReadableNumber(num: number | null) {
  const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e', 'z', 'y'];
  if (num === 0 || num === null) return '0 ';
  const i = Math.floor(Math.log(num) / Math.log(1000));
  return `${Math.round(num / Math.pow(1000, i))}${sizes[i]} `;
}

/**
 * @name resetFavicon
 * @description Resets the favicon to the default icon.
 */
export function resetFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `/favicon.ico`;
}

/**
 * @name setNotifyFavicon
 * @description Sets the favicon to the notify/done icon.
 */
export function setNotifyFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `/favicon_done.ico`;
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
 * @name verdictToColor
 * @description Returns the MUI color name corresponding to the given verdict string.
 * @param verdict - maliciousness verdict
 * @returns MUI color name
 */
export function verdictToColor(verdict: string): PossibleColor {
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
 * @name verdictRank
 * @description Returns a numeric rank for the given verdict, where lower is more severe.
 * @param verdict - maliciousness verdict
 * @returns numeric rank
 */
export function verdictRank(verdict: string): number {
  return RANK_MAP[verdict];
}

/**
 * @name priorityText
 * @description Returns a human-readable label for the given numeric priority.
 * @param priority - numeric priority value
 * @returns human-readable priority label
 */
export function priorityText(priority: number | null) {
  if (priority > 1000) {
    return 'user-high';
  }

  if (priority > 500) {
    return 'user-medium';
  }

  if (priority > 400) {
    return 'user-low';
  }

  if (priority > 300) {
    return 'critical';
  }

  if (priority > 200) {
    return 'high';
  }

  if (priority > 100) {
    return 'medium';
  }

  return 'low';
}

/**
 * @name getValueFromPath
 * @description Retrieves a nested value from an object using a dot-separated path.
 * @param obj - the object to traverse
 * @param path - dot-separated path string (e.g. `"a.b.c"`)
 * @returns the value at the path, or `undefined` if not found
 */
export function getValueFromPath(obj: object, path: string): undefined | string | object {
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
 * @name getProvider
 * @description Returns the OAuth provider name from the current URL.
 * @returns OAuth provider name, or null if not found
 */
export function getProvider() {
  if (window.location.pathname.indexOf(`/oauth/`) !== -1) {
    return window.location.pathname.split(`/oauth/`).pop().slice(0, -1);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('provider');
}

/**
 * @name getSAMLData
 * @description Parses SAML sign-in data from the current URL.
 * @returns parsed SAML data object, or null if not a SAML sign-in
 */
export function getSAMLData() {
  if (window.location.pathname.indexOf('/saml/') !== -1) {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data == null) {
      return JSON.parse(atob(data).toString());
    }
  }

  return null;
}

/**
 * @name searchResultsDisplay
 * @description Converts an Elasticsearch result count to a display string.
 * Appends `+` when the count exactly matches the limit, indicating more results may exist.
 * @param count - number of results returned
 * @param max - result cap used in the query (default: 10000)
 * @returns display string, e.g. `"42"` or `"10000+"`
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
 * @name maxLenStr
 * @description Truncates a string to the given length and appends `...` if truncated.
 * @param str - string to truncate
 * @param len - maximum length
 * @returns truncated string
 */
export function maxLenStr(str: string, len: number) {
  if (str.length > len) {
    return `${str.substr(0, len - 3)}...`;
  }
  return str;
}

/**
 * @name safeFieldValue
 * @description Wraps a value in double quotes for use in Elasticsearch field queries,
 * escaping backslashes and double quotes.
 * @param data - value to escape
 * @returns quoted, escaped string (e.g. `"foo \"bar\""`)
 */
export function safeFieldValue(data: string | number | boolean) {
  const temp = String(data);
  return `"${temp.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * @name safeFieldValueURI
 * @description Identical to `safeFieldValue` — wraps and escapes a value for use in Elasticsearch field queries.
 * The URI-encoding step was removed; use `safeFieldValue` directly instead.
 * @param data - value to escape
 * @returns quoted, escaped string
 */
export function safeFieldValueURI(data: string | number | boolean) {
  return `${encodeURIComponent(safeFieldValue(data))}`;
}

/**
 * @name matchSHA256
 * @description Matches a valid SHA-256 hash and returns it, trimming surrounding whitespace.
 * Returns `null` for non-matching input.
 * @param data - string to test
 * @returns SHA-256 hash string, or null
 */
export function matchSHA256(data: string) {
  const sha256ParseRE = /^\s*([a-fA-F0-9]{64})\s*$/;
  const output = sha256ParseRE.exec(data);
  return output ? output[1] : output;
}

/**
 * @name refang
 * @description Reverses common URL defanging techniques to restore a usable URL.
 * See https://www.npmjs.com/package/fanger for the techniques handled.
 * @param value - defanged URL string
 * @returns refanged URL string
 */
const refang = (value: string): string =>
  value
    .replaceAll(' ', '')
    .replaceAll(/[[|(|{](\.|dot)[\]|)|}]/g, '.')
    .replaceAll(/[[|(|{](@|at)[\]|)|}]/g, '@')
    .replaceAll(/[[|(|{]\/[\]|)|}]/g, '/')
    .replaceAll(/[[|(|{]:[\]|)|}]/g, ':')
    .replaceAll(/[[|(|{]:\/\/[\]|)|}]/g, '://')
    .replaceAll('\\.', '.')
    .replaceAll(/h(x|X){1,2}p/g, 'http');

/**
 * @name isURL
 * @description Matches on valid URLs and returns `true` for valid input.
 * Defanged URLs (e.g. `hxxp://`, `[.]`) are refanged before matching.
 * @param value - string to test
 * @returns `true` if the value is a valid (or defanged) URL
 */
export const isURL = (value: string): boolean => !!URL_REGEX.exec(refang(value));

/**
 * @name filterObject
 * @description Filters an object's entries by a callback, similar to `Array.prototype.filter`.
 * @param obj - object to filter
 * @param callback - `(value, key) => boolean` predicate
 * @returns new object containing only entries for which the callback returns truthy
 */
export function filterObject<T extends object>(
  obj: T,
  callback: (val: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).filter(([key, val]) => callback(val, key))
  ) as Partial<T>;
}

/**
 * @name getSubmitType
 * @description Determines the submittable type of the input string (hash type, URL, or unknown).
 * @param input - value to classify
 * @param configuration - Assemblyline configuration (used for file source patterns)
 * @returns tuple of `[type, normalizedInput]`; type is `null` when unrecognised
 */
export function getSubmitType(input: string, configuration: Configuration): [HashPatternMap, string] {
  const value = String(input);

  // Return null if the parameters are invalid
  if (!input || !configuration?.submission?.file_sources) return [null, input];

  // If we're trying to auto-detect the input type, iterate over file sources
  const detectedHashType = Object.entries(configuration.submission.file_sources).find(
    ([hashType, hashProps]: [HashPatternMap, FileSource]) =>
      hashProps &&
      (LOWERCASE_HASH.includes(hashType) ? value.toLowerCase() : value).trim().match(new RegExp(hashProps?.pattern))
  )?.[0] as HashPatternMap;

  if (detectedHashType)
    return [detectedHashType, (LOWERCASE_HASH.includes(detectedHashType) ? value.toLowerCase() : value).trim()];
  else if (!detectedHashType && isURL(value)) return ['url', value.trimStart()];
  else return [null, input];
}

/**
 * @name sumValues
 * @description Sums all numeric values of an object.
 * @param obj - object whose values are numbers
 * @returns sum of all values
 */
type ObjectOfInts = Record<string, number>;
export const sumValues = (obj: ObjectOfInts) => Object.values(obj).reduce((a, b) => a + b, 0);

/**
 * @name getSHA256
 * @description Computes the SHA-256 hash of a string.
 * @param value - input string to hash
 * @returns SHA-256 hash as a lowercase hexadecimal string
 */
export const getSHA256 = (value: string) =>
  new Promise<string>(async (resolve, reject) => {
    try {
      // Encode the string as a Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(value);

      // Compute the SHA-256 hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convert the hash to a hexadecimal string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

      resolve(hashHex);
    } catch (error) {
      reject(null);

      // eslint-disable-next-line no-console
      console.error(`Hashing of value "${value}" failed: ${error}`);
    }
  });

/**
 * @name getTextContent
 * @description Recursively extracts and concatenates all text content from a `ReactNode` tree.
 * Returns the result lowercased with spaces replaced by `-`.
 * @param children - React node tree to extract text from
 * @returns concatenated, lowercased, hyphenated text content
 */
export const getTextContent = (children: ReactNode): string => {
  let textContent = '';

  // Children.forEach is used to safely iterate over `children`, even if it's an array, null, or other types.
  Children.forEach(children, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      // If the child is a simple string or number, add it to the textContent
      textContent += child;
    } else if (isValidElement(child)) {
      // If the child is a valid React element, recursively process its `props.children`
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      textContent += getTextContent(child.props?.['children']);
    }
    // Other types like `null`, `undefined`, or `boolean` are ignored as they don't contribute to text content
  });

  return textContent.toLowerCase().replaceAll(' ', '-'); // Return the concatenated text content
};
