import { DateTimeLucene } from 'components/visual/DateTime/utils/DateTimeLucene';
import type { Moment } from 'moment';
import moment from 'moment';

export type DateTimeValues = {
  absolute: Moment;
  relative: DateTimeLucene;
  type: 'absolute' | 'relative';
};

export type DateTimeRange = `[${string} TO ${string}]`;

export const QUICK_SELECT_OPTIONS = [
  { primary: 'today', value: '[now/d TO now/d]' },
  { primary: 'last_24h', value: '[now-24h/h TO now]' },
  { primary: 'this_week', value: '[now/w TO now/w]' },
  { primary: 'last_7d', value: '[now-7d/d TO now]' },
  { primary: 'last_15m', value: '[now-15m TO now]' },
  { primary: 'last_30d', value: '[now-30d/d TO now]' },
  { primary: 'last_30m', value: '[now-30m TO now]' },
  { primary: 'last_90d', value: '[now-90d/d TO now]' },
  { primary: 'last_1h', value: '[now-1h TO now]' },
  { primary: 'last_1y', value: '[now-1y/d TO now]' }
] as const;

export const RELATIVE_DATETIME_OPTIONS = [
  { primary: 'seconds_ago', value: '-s' },
  { primary: 'minutes_ago', value: '-m' },
  { primary: 'hours_ago', value: '-h' },
  { primary: 'days_ago', value: '-d' },
  { primary: 'weeks_ago', value: '-w' },
  { primary: 'months_ago', value: '-M' },
  { primary: 'years_ago', value: '-y' },

  { primary: 'seconds_from_now', value: '+s' },
  { primary: 'minutes_from_now', value: '+m' },
  { primary: 'hours_from_now', value: '+h' },
  { primary: 'days_from_now', value: '+d' },
  { primary: 'weeks_from_now', value: '+w' },
  { primary: 'months_from_now', value: '+M' },
  { primary: 'years_from_now', value: '+y' }
] as const;

/**
 * Validates if a string is of the format [${string}TO${string}].
 * @param {string} value - The string to validate.
 * @returns {boolean} - True if the string is valid, otherwise false.
 */
export const isValidDateTimeRange = (value: string): value is DateTimeRange => {
  // Regex to match the format: [${string}TO${string}]
  const regex = /^\[.+?TO.+?\]$/;

  // Check if the value matches the regex pattern
  return regex.test(value);
};

export const isValidRelativeDateTime = (input: unknown): input is RelativeDateTime => {
  if (typeof input !== 'string') return false;
  const relativeDatetimeRegex = /^now([+-]\d+)?[smhdwMy]?$/;
  return relativeDatetimeRegex.test(input);
};

// type RelativeDateTime = {
//   timeSpanAmount: number;
//   relativeTimeSpan: (typeof RELATIVE_DATETIME_OPTIONS)[number]['value'];
// };

export const convertAbsoluteToRelativeDateTime = (value: Moment): RelativeDateTimeParts => {
  if (!value) {
    // Default when datetime is null
    return { timeSpanAmount: 0, relativeTimeSpan: '[now/d TO now/d]' };
  }

  // Calculate the difference between the given datetime and now in milliseconds
  const now = moment();
  const diff = value.diff(now); // Positive if future, negative if past

  // Determine the time span in absolute terms and the unit of difference
  const seconds = Math.abs(diff / 1000);
  const minutes = Math.abs(seconds / 60);
  const hours = Math.abs(minutes / 60);
  const days = Math.abs(hours / 24);
  const weeks = Math.abs(days / 7);
  const months = Math.abs(days / 30); // Approximation
  const years = Math.abs(days / 365); // Approximation

  // Assign the closest relative option
  if (seconds < 60) {
    return {
      timeSpanAmount: Math.round(seconds),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'seconds_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'seconds_from_now').value
    };
  } else if (minutes < 60) {
    return {
      timeSpanAmount: Math.round(minutes),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'minutes_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'minutes_from_now').value
    };
  } else if (hours < 24) {
    return {
      timeSpanAmount: Math.round(hours),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'hours_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'hours_from_now').value
    };
  } else if (days < 7) {
    return {
      timeSpanAmount: Math.round(days),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'days_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'days_from_now').value
    };
  } else if (weeks < 4) {
    return {
      timeSpanAmount: Math.round(weeks),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'weeks_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'weeks_from_now').value
    };
  } else if (months < 12) {
    return {
      timeSpanAmount: Math.round(months),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'months_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'months_from_now').value
    };
  } else {
    return {
      timeSpanAmount: Math.round(years),
      relativeTimeSpan:
        diff < 0
          ? RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'years_ago').value
          : RELATIVE_DATETIME_OPTIONS.find(opt => opt.primary === 'years_from_now').value
    };
  }
};

/**
 * Converts a Moment datetime to a relative datetime string.
 * @param {Moment} absoluteMoment - The absolute Moment datetime to convert.
 * @returns {string} The relative datetime string (e.g. "now+5m", "now-2h", "now").
 */
export const convertAbsoluteToRelativeDateTime2 = (input: Moment): RelativeDateTime => {
  // Get the current time as a Moment object
  const now = moment();

  // Calculate the difference between `absoluteMoment` and `now` in seconds
  const diffInSeconds = input.diff(now, 'seconds');

  // Check if the time is now (within 1 second tolerance)
  if (Math.abs(diffInSeconds) < 1) {
    return 'now'; // Return "now" if the time is essentially the current moment
  }

  // Determine the sign (positive or negative) based on the difference
  const sign = diffInSeconds > 0 ? '+' : '-';

  // Get the absolute difference in seconds
  const absoluteDiff = Math.abs(diffInSeconds);

  // Format the relative time in terms of larger units (s, m, h, d, w, M, y)
  if (absoluteDiff < 60) {
    return `now${sign}${absoluteDiff}s`; // Seconds
  } else if (absoluteDiff < 3600) {
    const minutes = Math.round(absoluteDiff / 60);
    return `now${sign}${minutes}m`; // Minutes
  } else if (absoluteDiff < 86400) {
    const hours = Math.round(absoluteDiff / 3600);
    return `now${sign}${hours}h`; // Hours
  } else if (absoluteDiff < 604800) {
    const days = Math.round(absoluteDiff / 86400);
    return `now${sign}${days}d`; // Days
  } else if (absoluteDiff < 2592000) {
    const weeks = Math.round(absoluteDiff / 604800);
    return `now${sign}${weeks}w`; // Weeks
  } else if (absoluteDiff < 31536000) {
    const months = Math.round(absoluteDiff / 2592000);
    return `now${sign}${months}M`; // Months
  } else {
    const years = Math.round(absoluteDiff / 31536000);
    return `now${sign}${years}y`; // Years
  }
};

/**
 * Splits a relative datetime (e.g., "now+5m", "now-2h") into its components.
 * @param {string} relativeDatetime - The relative datetime string to split.
 * @returns {RelativeDatetimeComponents | null} The sign, amount, and time span, or null if the input is invalid.
 */
export const splitRelativeDatetime = (relativeDatetime: string): RelativeDateTimeParts | null => {
  // Regex to match the format: now[+|-][number][s|m|h|d|w|M|y]
  const regex = /^now([+-])(\d+)([smhdwMy])$/;

  const match = relativeDatetime.match(regex);
  if (!match) {
    // If the format doesn't match, return null
    return null;
  }

  const [, sign, amount, timeSpan] = match;

  return {
    sign: sign as '+' | '-',
    amount: parseInt(amount, 10),
    timeSpan: timeSpan as 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'
  };
};

export const convertRelativeToAbsoluteDateTime = (relativeDateTime: RelativeDateTime): Moment => {
  // Match against the relative datetime pattern
  const regex = /^now([+-]\d+)?([smhdwMy])?$/;
  const match = relativeDateTime.match(regex);

  if (!match) {
    throw new Error('Invalid relative datetime format');
  }

  // Destructure the matched groups
  const [, offsetExpression = '', unit = ''] = match;

  // If it's "now" without offset, return the current time
  if (!offsetExpression) {
    return moment();
  }

  // Parse the offset as a number and check the direction (+ or -)
  const direction = offsetExpression.startsWith('+') ? 'add' : 'subtract';
  const amount = parseInt(offsetExpression.slice(1), 10); // Remove + or - and parse the number

  // Apply the offset using the appropriate unit
  return direction === 'add'
    ? moment().add(amount, unit as moment.DurationInputArg2)
    : moment().subtract(amount, unit as moment.DurationInputArg2);
};

/**
 * Parses a RelativeDateTimeStr into its components.
 * @param {RelativeDateTimeStr} value - The relative datetime string to parse.
 * @returns {RelativeDateTime | null} The parsed object or null if the input is invalid.
 */
export const parseRelativeDateTime = (value: string): RelativeDateTime | null => {
  // Regex to match the relative datetime format
  const regex = /^now(?:(\+|-)(\d+)([smhdwMy]))?(?:\/([smhdwMy]))?$/;

  // Match the input string
  const match = value.match(regex);
  if (!match) {
    // Return null if the input doesn't match the expected structure
    return null;
  }

  const [, sign, amountStr, timeSpan, rounded] = match;

  // If "sign" is null/undefined, it's just "now"
  if (!sign) {
    return {
      sign: '+',
      amount: 0,
      timeSpan: 's', // Default to 's' (seconds), as "now" implies no offset
      rounded: null // No rounding specified
    };
  }

  return {
    sign: sign as '+' | '-',
    amount: parseInt(amountStr, 10),
    timeSpan: timeSpan as RelativeDateTime['timeSpan'],
    rounded: rounded ? (rounded as RelativeDateTime['rounded']) : null
  };
};

/**
 * Parses a Lucene datetime string (e.g., "now-2d/d") into its components (RelativeDateTimeParts).
 *
 * @param input - A relative Lucene datetime string (e.g., "now-2d/d").
 * @returns The parsed components as a RelativeDateTimeParts object.
 * @throws An error if the input is not a valid Lucene datetime string.
 */
export const parseLuceneDateTime = (input: string): RelativeDateTimeParts => {
  // Regex to match Lucene datetime strings
  const regex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;

  // Match the input string against the regex
  const match = input.match(regex);

  // If the string doesn't match the expected pattern, throw an error
  if (!match) {
    throw new Error(`Invalid Lucene datetime format: "${input}"`);
  }

  // Extract the components of the match
  const [, sign = '+', amount = '0', timeSpan = 'd', rounded = null] = match;

  // Construct and return the RelativeDateTimeParts object
  return {
    sign: sign as '+' | '-', // "+" or "-"
    amount: parseInt(amount, 10), // Convert the amount to a number (default is 0)
    timeSpan: timeSpan as TimeSpan, // Ensure the timeSpan is one of the valid TimeSpan types
    rounded: rounded as TimeSpan | null // Convert the rounded unit (if present) or leave it as null
  };
};

/**
 * Converts a RelativeDateTimeParts object into its corresponding Lucene datetime string.
 *
 * @param parts - The `RelativeDateTimeParts` object to convert.
 * @returns The equivalent Lucene datetime string (e.g., "now-2d/d").
 */
export const relativeDateTimeToLucene = (parts: RelativeDateTimeParts): string => {
  const { sign, amount, timeSpan, rounded } = parts;

  // Begin with "now"
  let result = 'now';

  // Add the relative offset (e.g., "-2d" or "+3h")
  if (amount > 0) {
    result += `${sign}${amount}${timeSpan}`;
  }

  // Add rounding (e.g., "/d")
  if (rounded) {
    result += `/${rounded}`;
  }

  return result;
};

/**
 * Converts a Moment object to a relative datetime object (RelativeDateTimeParts).
 * The relative datetime is based on the difference between the provided Moment object
 * and the current date & time (`now`).
 *
 * @param target - The target Moment object (to calculate the relative time from `now`).
 * @param roundTo - The optional TimeSpan for rounding (e.g., "d" for day, "h" for hour).
 *                  If provided, the function will round `now` and `target` to that unit.
 * @returns A `RelativeDateTimeParts` object describing the relative datetime.
 */
export const momentToRelativeDateTime = (target: Moment, roundTo: TimeSpan | null = null): RelativeDateTimeParts => {
  // Get the current datetime ("now")
  const now = roundTo ? moment().startOf(roundTo) : moment();

  // Optionally round the target time to the specified unit
  const roundedTarget = roundTo ? target.clone().startOf(roundTo) : target;

  // Calculate the difference in milliseconds between `now` and `target`
  const diffInMs = roundedTarget.diff(now);

  // Determine the sign ("+" for future, "-" for past)
  const sign = diffInMs >= 0 ? '+' : '-';

  // Convert the absolute difference into a Moment duration
  const duration = moment.duration(Math.abs(diffInMs));

  // Determine the appropriate TimeSpan based on the largest non-zero unit of the duration
  let amount: number;
  let timeSpan: TimeSpan;

  if (duration.years() > 0) {
    amount = duration.years();
    timeSpan = 'y';
  } else if (duration.months() > 0) {
    amount = duration.months();
    timeSpan = 'M';
  } else if (duration.weeks() > 0) {
    amount = Math.floor(duration.asWeeks());
    timeSpan = 'w';
  } else if (duration.days() > 0) {
    amount = duration.days();
    timeSpan = 'd';
  } else if (duration.hours() > 0) {
    amount = duration.hours();
    timeSpan = 'h';
  } else if (duration.minutes() > 0) {
    amount = duration.minutes();
    timeSpan = 'm';
  } else {
    amount = duration.seconds();
    timeSpan = 's';
  }

  // Return the RelativeDateTimeParts object
  return {
    sign,
    amount,
    timeSpan,
    rounded: roundTo // The unit for rounding (or null if not provided)
  };
};

/**
 * Converts a relative Lucene datetime string (e.g., "now-2d/d") to an absolute Moment datetime.
 *
 * @param input - A relative datetime string in the Lucene format (e.g., "now-2d/d").
 * @returns The equivalent absolute Moment datetime.
 */
export const relativeToAbsoluteMoment = (input: string): Moment => {
  // Match patterns like "now", "now-2d", "now-2d/d", or "now+5h/h"
  const regex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error(`Invalid relative datetime format: "${input}"`);
  }

  // Extract matches from the regex
  const [, sign, amount, timeSpan, rounded] = match;

  // Default values
  const offsetSign = sign === '-' ? -1 : 1; // Determine if it's a "+" or "-"
  const offsetAmount = amount ? parseInt(amount, 10) : 0; // Default to 0 if no amount is specified
  const offsetTimeSpan = (timeSpan as TimeSpan) || 'd'; // Default to "d" (days) if no unit is specified
  const roundingTimeSpan = rounded ? (rounded as TimeSpan) : null; // Optional rounding

  // Start with the "now" timestamp
  let result = moment();

  // Apply the offset (if any, based on sign, amount, and timeSpan)
  if (offsetAmount > 0) {
    result = result.add(offsetSign * offsetAmount, offsetTimeSpan);
  }

  // Apply rounding (if specified)
  if (roundingTimeSpan) {
    result = result.startOf(roundingTimeSpan);
  }

  return result;
};

/**
 * Parses a date-time string and determines whether it is an absolute or relative date-time.
 * @param {string} value - The input date-time string to parse.
 * @returns {DateTimeValues} An object containing the absolute and relative representations of the date-time.
 */
export const parseDateTimeString = (value: string): DateTimeValues => {
  // If the input is a valid absolute date (e.g., ISO 8601 or other valid formats)
  if (moment(value, moment.ISO_8601, true).isValid()) {
    const absolute = moment(value);
    const relative = DateTimeLucene.fromMoment(absolute);
    return { absolute, relative, type: 'absolute' };
  }

  // If the input is a valid relative date/time (e.g., "now-4d", "now+2h/M")
  if (DateTimeLucene.isValid(value)) {
    const relative = DateTimeLucene.fromLuceneString(value);
    console.log(value, relative);
    const absolute = relative.toMoment();
    return { absolute, relative, type: 'relative' };
  }

  // Fallback: If the input is invalid, default to 'now'
  console.warn(`Invalid date-time string provided: "${value}", defaulting to 'now'.`);

  const relative = DateTimeLucene.fromLuceneString('now');
  const absolute = relative.toMoment();
  return { absolute, relative, type: 'relative' };
};
