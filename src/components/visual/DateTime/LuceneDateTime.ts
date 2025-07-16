import type { Locale } from 'date-fns';
import { format, formatDistance } from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';
import type { Moment } from 'moment';
import moment from 'moment';

// Week starts on Sunday (0 = Sunday, 1 = Monday, etc.)
moment.updateLocale('en', { week: { dow: 0 } });

export const EN_CA: Locale = { ...enCA, options: { ...enCA.options, weekStartsOn: 0 } };
export const FR_CA: Locale = { ...frCA, options: { ...frCA.options, weekStartsOn: 0 } };

// Define the TimeSpan type (e.g., "d" for days, "h" for hours, etc.)
export const TIME_SPAN = {
  s: 1,
  m: 2,
  h: 3,
  d: 4,
  w: 5,
  M: 6,
  y: 7
} as const;

export type TimeSpan = keyof typeof TIME_SPAN;

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

  /** If not null, the unit of time to which the result is rounding (e.g., "d" means rounding to the day) */
  rounding: null | TimeSpan;
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
  public rounding: RelativeDateTimeParts['rounding']; // The unit of time for rounding (optional, or null if not rounding)
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
    this.rounding = relativeParts.rounding;
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

    const [, sign = '-', amount = '0', timeSpan = null, rounding = null] = match;

    return {
      sign,
      amount: parseInt(amount, 10),
      timeSpan: timeSpan || (rounding as TimeSpan) || 's',
      rounding
    } as RelativeDateTimeParts;
  }

  private static convertPartsToMoment = (
    { sign, amount, timeSpan, rounding }: RelativeDateTimeParts,
    variant: DateTimeVariant
  ): Moment => {
    // Default values
    const offsetSign = sign === '-' ? -1 : 1; // Determine if it's a "+" or "-"
    const offsetAmount = amount || 0; // Default to 0 if no amount is specified
    const offsetTimeSpan = timeSpan || 'd'; // Default to "d" (days) if no unit is specified
    const roundingTimeSpan = rounding; // Optional rounding

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
    rounding
  }: RelativeDateTimeParts): RelativeDateTime => {
    // Begin with "now"
    let result = 'now';

    // Add the relative offset (e.g., "-2d" or "+3h")
    if (amount > 0) {
      result += `${sign}${amount}${timeSpan}`;
    }

    // Add rounding (e.g., "/d")
    if (rounding) {
      result += `/${rounding}`;
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
    const roundingTarget = roundTo
      ? variant === 'start'
        ? target.clone().startOf(roundTo)
        : target.clone().endOf(roundTo)
      : target;

    // Calculate the difference in milliseconds between `roundingTarget` and `now`
    const diffInMs = roundingTarget.diff(now);

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
    return { sign, amount, timeSpan, rounding: roundTo };
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
    if (this.rounding) {
      result += `/${this.rounding}`;
    }

    return result;
  }

  public toMoment(): Moment {
    // Default values
    const offsetSign = this.sign === '-' ? -1 : 1; // Determine if it's a "+" or "-"
    const offsetAmount = this.amount; // Default to 0 if no amount is specified
    const offsetTimeSpan = this.timeSpan || 'd'; // Default to "d" (days) if no unit is specified
    const roundingTimeSpan = this.rounding ? this.rounding : null; // Optional rounding

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
    return `now${this.sign}${this.amount}${this.timeSpan}${this.rounding ? `/${this.rounding}` : ''}`;
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
}

export class LuceneDateTimeGap {
  /** Numeric value of the gap duration (e.g., 6, 15). */
  public amount: number;

  /** Time span unit of the gap (e.g., "h" for hours, "m" for minutes). */
  public timeSpan: TimeSpan;

  /** Desired number of intervals in the range (default: 50). */
  public interval: number;

  /** Start of the datetime range as a `LuceneDateTime` object. */
  private start: LuceneDateTime;

  /** End of the datetime range as a `LuceneDateTime` object. */
  private end: LuceneDateTime;

  /**
   * Creates a `LuceneDateTimeGap` instance.
   * @param gap - Gap string (e.g., "4h", "10m"). Defaults to `defaultGap` if invalid.
   * @param start - Start of the datetime range.
   * @param end - End of the datetime range.
   * @param defaultInterval - Number of intervals (default: 50).
   * @param defaultGap - Default gap string (default: "4h").
   */
  constructor(
    gap: string,
    start: string,
    end: string,
    defaultInterval: number = 50,
    defaultGap: `${number}${TimeSpan}` = '4h'
  ) {
    this.start = new LuceneDateTime(start, 'start');
    this.end = new LuceneDateTime(end, 'end');
    this.interval = defaultInterval;

    const [gapAmount, gapTimeSpan] = LuceneDateTimeGap.parseGap(gap);
    const [defaultGapAmount, defaultGapTimeSpan] = LuceneDateTimeGap.parseGap(defaultGap);

    this.amount = gapAmount ? gapAmount : defaultGapAmount;
    this.timeSpan = gapAmount ? gapTimeSpan : defaultGapTimeSpan;
  }

  /**
   * Checks if a gap string is valid (e.g., "10m", "5h").
   * @param value - Gap string to validate.
   * @returns True if valid, false otherwise.
   */
  public static isValidGap(value: string): value is `${number}${TimeSpan}` {
    return /^\d+(s|m|h|d)$/.test(value);
  }

  /**
   * Parses a valid gap string into its numeric value and time span unit.
   * @param gap - Gap string (e.g., "10m", "5h").
   * @returns Tuple of numeric value and time span unit.
   */
  public static parseGap(gap: string): [number, TimeSpan] {
    const match = gap.match(/^(\d+)([smhd])$/);
    if (!match) return [0, 'h'];
    return [parseInt(match[1], 10), match[2] as TimeSpan];
  }

  /**
   * Calculates the number of intervals the gap creates within the range.
   * @returns Number of intervals.
   */
  private calculateInterval(): number {
    const totalDurationMs = this.end.absolute.diff(this.start.absolute);
    const gapInMs = moment
      .duration(this.amount, this.timeSpan as moment.unitOfTime.DurationConstructor)
      .asMilliseconds();

    if (gapInMs === 0) throw new Error(`Gap cannot represent zero milliseconds.`);
    return Math.floor(totalDurationMs / gapInMs);
  }

  /**
   * Dynamically calculates a default gap for the range and interval count.
   * @returns Gap string (e.g., "4h", "1d").
   */
  private calculateGap(): `${number}${TimeSpan}` {
    const totalDurationMs = this.end.absolute.diff(this.start.absolute);

    if (totalDurationMs <= 1000) return `${this.amount}${this.timeSpan}`;

    let gapUnit: TimeSpan = 's';
    let gapValue = Math.floor(totalDurationMs / this.interval / 1000);

    if (gapValue >= 60) {
      gapUnit = 'm';
      gapValue = Math.floor(gapValue / 60);
    }
    if (gapValue >= 60 && gapUnit === 'm') {
      gapUnit = 'h';
      gapValue = Math.floor(gapValue / 60);
    }
    if (gapValue >= 24 && gapUnit === 'h') {
      gapUnit = 'd';
      gapValue = Math.floor(gapValue / 24);
    }

    return `${gapValue}${gapUnit}` as `${number}${TimeSpan}`;
  }

  /**
   * Updates the range and recalculates the gap.
   * @param newStart - New start of the range.
   * @param newEnd - New end of the range.
   * @returns Updated instance.
   */
  public updateRange(newStart: string, newEnd: string): this {
    this.start = new LuceneDateTime(newStart, 'start');
    this.end = new LuceneDateTime(newEnd, 'end');
    return this;
  }

  /**
   * Converts the gap to a string representation.
   * @returns Gap string (e.g., "6h", "15m").
   */
  public toString(): string {
    const interval = this.calculateInterval();
    return 0 < interval && interval < 100 ? `${this.amount}${this.timeSpan}` : this.calculateGap();
  }

  /**
   * Retrieves the gap as a string.
   * @returns Gap string (e.g., "6h", "15m").
   */
  public getGap(): string {
    return `${this.amount}${this.timeSpan}`;
  }
}
