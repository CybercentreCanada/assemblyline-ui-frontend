import { format, formatDistance } from 'date-fns';
import { enCA as localeEN, frCA as localeFR } from 'date-fns/locale';
import type { Moment } from 'moment';
import moment from 'moment';

// Define the TimeSpan type (e.g., "d" for days, "h" for hours, etc.)
export type TimeSpan = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';

// Define the Relative Date Time using the Lucene format
export type RelativeDateTime =
  | 'now'
  | `now${'+' | '-'}${number}${TimeSpan}${TimeSpan extends null ? `` : `/${TimeSpan}`}`;

export type DateTimeType = 'absolute' | 'relative';

export type DateTimeVariant = 'start' | 'end';

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

export class LuceneDateTime {
  public value: string; // Original value
  public type: 'absolute' | 'relative'; // Type of the original value
  public absolute: Moment; // Absolute date time formatted to Moment
  public relative: RelativeDateTime; // Relative date time formatted

  public sign: RelativeDateTimeParts['sign']; // Whether the offset is in the future ("+") or the past ("-")
  public amount: RelativeDateTimeParts['amount']; // The numeric value representing the offset
  public timeSpan: RelativeDateTimeParts['timeSpan']; // The unit of time for the offset (e.g., "d" for days)
  public rounded: RelativeDateTimeParts['rounded']; // The unit of time for rounding (optional, or null if not rounded)
  public variant: DateTimeVariant;

  constructor(value: string, variant: DateTimeVariant = 'start') {
    this.value = value;
    this.variant = variant;

    let relativeParts: RelativeDateTimeParts = LuceneDateTime.fromLuceneString('now');

    if (moment(value, moment.ISO_8601, true).isValid()) {
      this.absolute = moment(value);
      relativeParts = LuceneDateTime.fromMoment(this.absolute);
      this.relative = LuceneDateTime.convertPartsToRelative(relativeParts);
      this.type = 'absolute';
    } else if (LuceneDateTime.isValidRelative(value)) {
      relativeParts = LuceneDateTime.fromLuceneString(value);
      this.absolute = LuceneDateTime.convertPartsToMoment(relativeParts, variant);
      this.relative = LuceneDateTime.convertPartsToRelative(relativeParts);
      this.type = 'relative';
    } else {
      this.absolute = LuceneDateTime.convertPartsToMoment(relativeParts, variant);
      this.relative = LuceneDateTime.convertPartsToRelative(relativeParts);
      this.type = 'relative';
    }

    this.sign = relativeParts.sign;
    this.amount = relativeParts.amount;
    this.timeSpan = relativeParts.timeSpan;
    this.rounded = relativeParts.rounded;
  }

  private static isValidRelative(input: string): input is RelativeDateTime {
    if (typeof input !== 'string') return false;
    const relativeDatetimeRegex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;
    return relativeDatetimeRegex.test(input);
  }

  /**
   * Converts a Lucene timestamp string (e.g., "now-2d/d") into a RelativeDateTimeParts object.
   * @param input - A relative Lucene datetime string.
   * @returns An instance of `RelativeDateTimeParts`.
   */
  private static fromLuceneString(input: string): RelativeDateTimeParts {
    const regex = /^now([+-])?(\d+)?([smhdwMy])?(?:\/([smhdwMy]))?$/;
    const match = input.match(regex);

    if (!match) {
      throw new Error(`Invalid Lucene datetime format: "${input}"`);
    }

    const [, sign = '-', amount = '0', timeSpan = 's', rounded = null] = match;

    return { sign, amount: parseInt(amount, 10), timeSpan, rounded } as RelativeDateTimeParts;
  }

  private static convertPartsToMoment = (
    { sign, amount, timeSpan, rounded }: RelativeDateTimeParts,
    variant: DateTimeVariant
  ): Moment => {
    // Default values
    const offsetSign = sign === '-' ? -1 : 1; // Determine if it's a "+" or "-"
    const offsetAmount = amount || 0; // Default to 0 if no amount is specified
    const offsetTimeSpan = timeSpan || 'd'; // Default to "d" (days) if no unit is specified
    const roundingTimeSpan = rounded; // Optional rounding

    // Start with the "now" timestamp
    let result = moment();

    // Apply the offset (if any, based on sign, amount, and timeSpan)
    if (offsetAmount > 0) {
      result = result.add(offsetSign * offsetAmount, offsetTimeSpan);
    }

    // Apply rounding (if specified)
    if (roundingTimeSpan) {
      if (variant === 'start') {
        result = result.startOf(roundingTimeSpan);
      } else {
        result = result.endOf(roundingTimeSpan);
      }
    }

    return result;
  };

  private static convertPartsToRelative = ({
    sign,
    amount,
    timeSpan,
    rounded
  }: RelativeDateTimeParts): RelativeDateTime => {
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

    return result as RelativeDateTime;
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
  private static fromMoment(target: Moment, roundTo: TimeSpan | null = null): RelativeDateTimeParts {
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

    // Return the LuceneDateTime instance
    return { sign, amount, timeSpan, rounded: roundTo };
  }

  /**
   * Converts this `RelativeDateTimeParts` object back into a Lucene timestamp string.
   * @returns The equivalent relative Lucene datetime string (e.g., "now-2d/d").
   */
  public toLuceneString(): string {
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

  public toMoment(): Moment {
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
      if (this.variant === 'start') {
        result = result.startOf(roundingTimeSpan);
      } else {
        result = result.endOf(roundingTimeSpan);
      }
    }

    return result;
  }

  public toLucene(type: DateTimeType = null): string {
    switch (type || this.type) {
      case 'absolute':
        return this.absolute.toISOString();
      case 'relative':
        return this.relative;
      default:
        return null;
    }
  }

  public toString(params: { type?: DateTimeType; language?: string } = null): string {
    const { type = null, language = 'en' } = params || {};

    switch (type || this.type) {
      case 'absolute':
        return format(this.absolute.toDate(), language === 'fr' ? "do MMMM yyyy, H'h'mm" : 'MMMM d yyyy, h:mm a', {
          locale: language === 'fr' ? localeFR : localeEN
        });
      case 'relative':
        if (this.relative === 'now') return language === 'fr' ? 'maintenant' : 'now';

        let result = formatDistance(this.absolute.toDate(), new Date(), {
          addSuffix: true,
          locale: language === 'fr' ? localeFR : localeEN
        });

        // if (this.rounded) {
        //   result += ` ${t(`/${this.rounded}`)}`;
        // }

        return result;

      default:
        return null;
    }
  }

  public toStringifiedParts() {
    return `now${this.sign}${this.amount}${this.timeSpan}${this.rounded && this.rounded === this.timeSpan ? `/${this.rounded}` : ''}`;
  }

  public toValue() {
    switch (this.type) {
      case 'absolute':
        return this.absolute.valueOf();
      case 'relative':
        return this.toMoment().valueOf();
    }
  }
}
