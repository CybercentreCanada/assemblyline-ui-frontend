import type { Moment } from 'moment';
import moment from 'moment';

export type TimeSpan = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';

export type RelativeDateTime = 'now' | `now${'+' | '-'}${number}${TimeSpan}`;

export type RelativeDateTimeParts = {
  sign: '+' | '-';
  amount: number;
  timeSpan: TimeSpan;
  rounded: null | TimeSpan;
};

export type DateTimeRange = `[${RelativeDateTime} TO ${RelativeDateTime}]`;

export const QUICK_SELECT_OPTIONS = [
  { primary: 'today', value: '[now/d TO now/d]' },
  { primary: 'last_24h', value: '[now-24h/h TO now]' },
  { primary: 'this_week', value: '[now/w TO now/w]' },
  { primary: 'last_7days', value: '[now-7d/d TO now]' },
  { primary: 'last_15min', value: '[now-15m TO now]' },
  { primary: 'last_30days', value: '[now-30d/d TO now]' },
  { primary: 'last_30min', value: '[now-30m TO now]' },
  { primary: 'last_90days', value: '[now-90d/d TO now]' },
  { primary: 'last_1hour', value: '[now-1h TO now]' },
  { primary: 'last_1year', value: '[now-1y/d TO now]' }
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

export const isValidRelativeDateTime = (input: unknown): input is RelativeDateTime => {
  if (typeof input !== 'string') return false;
  const relativeDatetimeRegex = /^now([+-]\d+)?[smhdwMy]?$/;
  return relativeDatetimeRegex.test(input);
};

// type RelativeDateTime = {
//   timeSpanAmount: number;
//   relativeTimeSpan: (typeof RELATIVE_DATETIME_OPTIONS)[number]['value'];
// };

export const convertAbsoluteToRelativeDateTime = (value: Moment): RelativeDateTime => {
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

type RelativeDatetimeComponents = {
  sign: '+' | '-';
  amount: number;
  timeSpan: 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';
};

/**
 * Splits a relative datetime (e.g., "now+5m", "now-2h") into its components.
 * @param {string} relativeDatetime - The relative datetime string to split.
 * @returns {RelativeDatetimeComponents | null} The sign, amount, and time span, or null if the input is invalid.
 */
export const splitRelativeDatetime = (relativeDatetime: string): RelativeDatetimeComponents | null => {
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
