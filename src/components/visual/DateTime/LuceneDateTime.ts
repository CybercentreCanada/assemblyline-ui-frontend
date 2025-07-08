import type { Locale } from 'date-fns';
import { format, formatDistance } from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';
import type { Moment } from 'moment';
import moment from 'moment';

export const EN_CA: Locale = { ...enCA, options: { ...enCA.options, weekStartsOn: 0 } };
export const FR_CA: Locale = { ...frCA, options: { ...frCA.options, weekStartsOn: 0 } };

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

export type DateTimeRange = `[${string} TO ${string}]`;

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

  private static reduceTimeSpan(input: TimeSpan): TimeSpan {
    switch (input) {
      case 'y':
        return 'M';
      case 'M':
        return 'w';
      case 'w':
        return 'd';
      case 'd':
        return 'h';
      case 'h':
        return 'm';
      case 'm':
        return 's';
      default:
        return null;
    }
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

    const [, sign = '-', amount = '0', timeSpan = null, rounded = null] = match;

    return {
      sign,
      amount: parseInt(amount, 10),
      timeSpan: timeSpan || (rounded as TimeSpan) || 's',
      rounded
    } as RelativeDateTimeParts;
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
  public static fromMoment(
    target: Moment,
    roundTo: TimeSpan | null = null,
    variant: DateTimeVariant = 'start'
  ): RelativeDateTimeParts {
    // Validate that the input is a valid Moment object
    if (!moment.isMoment(target) || !target.isValid()) {
      throw new Error('Invalid Moment object provided.');
    }

    // Get the current datetime ("now")
    // const now = roundTo ? (variant === 'start' ? moment().startOf(roundTo) : moment().endOf(roundTo)) : moment();
    const now = moment();

    // Round the target time to the specified unit if rounding is required
    const roundedTarget = roundTo
      ? variant === 'start'
        ? target.clone().startOf(roundTo)
        : target.clone().endOf(roundTo)
      : target;

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
          locale: language === 'fr' ? FR_CA : EN_CA
        });
      case 'relative':
        if (this.relative === 'now') return language === 'fr' ? 'maintenant' : 'now';

        // Format the relative distance
        const result = formatDistance(this.absolute.toDate(), new Date(), {
          addSuffix: true,
          locale: language === 'fr' ? frCA : enCA
        });

        return result;

      default:
        return null;
    }
  }

  public toStringifiedParts(): string {
    return `now${this.sign}${this.amount}${this.timeSpan}${this.rounded && this.rounded === this.timeSpan ? `/${this.rounded}` : ''}`;
  }

  public toValue(): number {
    switch (this.type) {
      case 'absolute':
        return this.absolute.valueOf();
      case 'relative':
        return this.toMoment().valueOf();
    }
  }

  public static previousTimeWindow(start: LuceneDateTime, end: LuceneDateTime): [string, string] {
    // Compute the duration between start and end
    const duration = moment(end.absolute).diff(moment(start.absolute));

    // Subtract the duration from the start to get the new start and end of the previous window
    const previousEnd = moment(start.absolute);
    const previousStart = moment(start.absolute).subtract(duration);

    return [previousStart.toISOString(), previousEnd.toISOString()];
  }

  public static nextTimeWindow(start: LuceneDateTime, end: LuceneDateTime): [string, string] {
    // Compute the duration between start and end
    const duration = moment(end.absolute).diff(moment(start.absolute));

    // Add the duration to the end to get the new start and end of the next window
    const nextStart = moment(end.absolute);
    const nextEnd = moment(end.absolute).add(duration);

    return [nextStart.toISOString(), nextEnd.toISOString()];
  }

  public static isValidGap(gap: string): gap is `${number}${TimeSpan}` {
    // Define a regex to match patterns like "14s", "30m", "2h", "1d"
    const validGapRegex = /^\d+(s|m|h|d)$/;

    // Test if the gap matches the allowed format
    return validGapRegex.test(gap);
  }

  /**
   * Calculates the number of intervals of a given gap within the datetime range.
   * @param range - The datetime range in Lucene range format (e.g., "[START_TIME TO END_TIME]").
   * @param gap - The gap between intervals (e.g., "2h", "15m", "10s").
   * @returns The number of intervals within the range.
   */
  public static getIntervalCount(range: DateTimeRange, gap: `${number}${TimeSpan}`): number {
    if (!LuceneDateTime.isValidGap(gap)) {
      throw new Error(`Invalid gap format: "${gap}"`);
    }

    // Parse the start and end from the range
    const [startRaw, endRaw] = range.slice(1, -1).split(' TO ');

    // Create LuceneDateTime objects for the start and end of the range
    const startDate = new LuceneDateTime(startRaw, 'start');
    const endDate = new LuceneDateTime(endRaw, 'end');

    // Calculate the total duration in milliseconds
    const totalDurationMs = endDate.absolute.diff(startDate.absolute);

    // Extract the time span and value from the gap (e.g., "2h" -> 2, "h")
    const [, gapValueStr, gapUnit] = gap.match(/^(\d+)([smhdwMy])$/);
    const gapValue = parseInt(gapValueStr, 10);

    // Convert the gap value to milliseconds
    const gapInMs = moment.duration(gapValue, gapUnit as moment.unitOfTime.DurationConstructor).asMilliseconds();

    if (gapInMs === 0) {
      throw new Error(`Gap cannot represent zero milliseconds: "${gap}"`);
    }

    // Calculate the number of intervals
    const intervalCount = Math.floor(totalDurationMs / gapInMs);

    return intervalCount;
  }

  public static getGap(range: DateTimeRange, interval: number = 50): `${number}${TimeSpan}` {
    // Extract the start and end values from the DateTimeRange
    const [startRaw, endRaw] = range.slice(1, -1).split(' TO ');

    // Parse the start and end values into LuceneDateTime objects
    const startDate = new LuceneDateTime(startRaw, 'start');
    const endDate = new LuceneDateTime(endRaw, 'end');

    // Calculate the total duration in milliseconds
    const totalDurationMs = endDate.absolute.diff(startDate.absolute);

    // Determine the largest possible gap unit and its value
    let gapUnit: TimeSpan = 's'; // Default to seconds
    let gapValue = Math.floor(totalDurationMs / interval / 1000); // Convert ms to seconds

    // Adjust the gap unit and value based on the duration
    if (gapValue >= 60) {
      gapUnit = 'm'; // Minutes
      gapValue = Math.floor(gapValue / 60);
    }
    if (gapValue >= 60 && gapUnit === 'm') {
      gapUnit = 'h'; // Hours
      gapValue = Math.floor(gapValue / 60);
    }
    if (gapValue >= 24 && gapUnit === 'h') {
      gapUnit = 'd'; // Days
      gapValue = Math.floor(gapValue / 24);
    }

    // Return the gap string
    return `${gapValue}${gapUnit}`;
  }

  public static parseGap(
    initialGap: string,
    range: DateTimeRange,
    defaultInterval: number = 50,
    defaultGap: `${number}${TimeSpan}` = '4h'
  ): `${number}${TimeSpan}` {
    // Check if the initial gap is valid
    if (LuceneDateTime.isValidGap(initialGap)) {
      // Calculate the number of intervals based on the provided gap
      const numberOfIntervals = LuceneDateTime.getIntervalCount(range, initialGap);

      // If the interval count is within the accepted range, return the initial gap
      if (numberOfIntervals > 0 && numberOfIntervals <= 100) {
        return initialGap;
      }
    }

    // If not valid or interval count is out of range, calculate a new gap
    const newGap = LuceneDateTime.getGap(range, defaultInterval);

    // Fallback to a default gap if needed
    return newGap || defaultGap;
  }
}
