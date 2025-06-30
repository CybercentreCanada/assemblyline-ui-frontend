import type { Moment } from 'moment';
import moment from 'moment';
// Define the TimeSpan type (e.g., "d" for days, "h" for hours, etc.)
export type TimeSpan = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';

export type RelativeDateTime = 'now' | `now${'+' | '-'}${TimeSpan}${TimeSpan extends null ? `` : `/${TimeSpan}`}`;

// Define the structure of the relative datetime object
export type RelativeDateTimeParts = {
  /** Indicates whether the time is in the future ("+") or past ("-") */
  sign: '+' | '-';

  /** The numeric value of the offset (e.g., "2" in "now-2d") */
  amount: number;

  /** Unit of time for the offset (e.g., "d" for days) */
  timeSpan: TimeSpan;

  /** If not null, the unit of time to which the result is rounded (e.g., "d" means rounded to the day) */
  rounded: null | TimeSpan;
};

export class DateTimeLucene {
  sign: '+' | '-'; // Whether the offset is in the future ("+") or the past ("-")
  amount: number; // The numeric value representing the offset
  timeSpan: TimeSpan; // The unit of time for the offset (e.g., "d" for days)
  rounded: null | TimeSpan; // The unit of time for rounding (optional, or null if not rounded)

  /**
   * Constructor to initialize the RelativeDateTimeParts object.
   * @param sign - "+" (future) or "-" (past).
   * @param amount - The numeric offset (e.g., 2 for "2 days").
   * @param timeSpan - The unit of time for the offset (e.g., "d" for days).
   * @param rounded - The unit of time to round to (e.g., "d" for days), or `null` if none.
   */
  constructor(sign: '+' | '-', amount: number, timeSpan: TimeSpan, rounded: null | TimeSpan = null) {
    if (amount < 0) {
      throw new Error('Amount must be a non-negative number.');
    }

    this.sign = sign;
    this.amount = amount;
    this.timeSpan = timeSpan;
    this.rounded = rounded;
  }

  static isValid(input: string): input is RelativeDateTime {
    if (typeof input !== 'string') return false;
    const relativeDatetimeRegex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;
    return relativeDatetimeRegex.test(input);
  }

  /**
   * Converts a Lucene timestamp string (e.g., "now-2d/d") into a RelativeDateTimeParts object.
   * @param input - A relative Lucene datetime string.
   * @returns An instance of `RelativeDateTimeParts`.
   */
  static fromLuceneString(input: string): DateTimeLucene {
    const regex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;
    const match = input.match(regex);

    if (!match) {
      throw new Error(`Invalid Lucene datetime format: "${input}"`);
    }

    const [, sign = '+', amount = '0', timeSpan = 'd', rounded = null] = match;

    return new DateTimeLucene(
      sign as '+' | '-',
      parseInt(amount, 10),
      timeSpan as TimeSpan,
      rounded as TimeSpan | null
    );
  }

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
  static fromMoment(target: Moment, roundTo: TimeSpan | null = null): DateTimeLucene {
    // Validate that the input is a valid Moment object
    if (!moment.isMoment(target) || !target.isValid()) {
      throw new Error('Invalid Moment object provided.');
    }

    // Get the current datetime ("now")
    const now = roundTo ? moment().startOf(roundTo) : moment();

    // Round the target time to the specified unit if rounding is required
    const roundedTarget = roundTo ? target.clone().startOf(roundTo) : target;

    // Calculate the difference in milliseconds between `roundedTarget` and `now`
    const diffInMs = roundedTarget.diff(now);

    // Determine the sign ("+" for future, "-" for past)
    const sign = diffInMs >= 0 ? '+' : '-';

    // Get the absolute time difference to calculate the duration
    const duration = moment.duration(Math.abs(diffInMs));

    // Determine the largest non-zero unit of the duration
    let amount: number;
    let timeSpan: TimeSpan;

    if (duration.years() > 0) {
      amount = duration.years();
      timeSpan = 'y';
    } else if (duration.months() > 0) {
      amount = duration.months();
      timeSpan = 'M';
    } else if (duration.asWeeks() >= 1) {
      amount = Math.floor(duration.asWeeks());
      timeSpan = 'w';
    } else if (duration.asDays() >= 1) {
      amount = Math.floor(duration.asDays());
      timeSpan = 'd';
    } else if (duration.asHours() >= 1) {
      amount = Math.floor(duration.asHours());
      timeSpan = 'h';
    } else if (duration.asMinutes() >= 1) {
      amount = Math.floor(duration.asMinutes());
      timeSpan = 'm';
    } else {
      amount = Math.floor(duration.asSeconds()); // Fallback to seconds
      timeSpan = 's';
    }

    // Return the DateTimeLucene instance
    return new DateTimeLucene(sign, amount, timeSpan, roundTo);
  }

  /**
   * Converts this `RelativeDateTimeParts` object back into a Lucene timestamp string.
   * @returns The equivalent relative Lucene datetime string (e.g., "now-2d/d").
   */
  toLuceneString(): string {
    // Start with "now"
    let result = 'now';

    // Add offset based on `amount`, `sign`, and `timeSpan`
    if (this.amount > 0) {
      result += `${this.sign}${this.amount}${this.timeSpan}`;
    }

    // Add rounding if applicable
    if (this.rounded) {
      result += `/${this.rounded}`;
    }

    return result;
  }

  toMoment(): Moment {
    // Default values
    const offsetSign = this.sign === '-' ? -1 : 1; // Determine if it's a "+" or "-"
    const offsetAmount = this.amount; // Default to 0 if no amount is specified
    const offsetTimeSpan = this.timeSpan || 'd'; // Default to "d" (days) if no unit is specified
    const roundingTimeSpan = this.rounded ? this.rounded : null; // Optional rounding

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
  }

  /**
   * Converts the `RelativeDateTimeParts` instance into a human-readable format.
   * @returns A string representation of the object.
   */
  toString(): string {
    return `Sign: ${this.sign}, Amount: ${this.amount}, TimeSpan: ${this.timeSpan}, Rounded: ${this.rounded}`;
  }
}
