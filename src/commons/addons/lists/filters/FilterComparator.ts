/* eslint-disable class-methods-use-this */
import lodash from 'lodash';
import { FilterField, GLOBAL_FILTER } from './FilterSelector';

export function isNumber(value: any): boolean {
  return !lodash.isNull(value) && !lodash.isNaN(value);
}

export function extractValue(object: any, path: string): any {
  const _value = lodash.get(object, path, '');
  return _value || '';
}

export function isString(value: any): boolean {
  return lodash.isString(value);
}

export function isArray(value: any): boolean {
  return lodash.isArray(value);
}

export function normalizeString(input: string): string {
  const _input = input.trim();
  return _input.toLowerCase();
}

export function normalizeNumber(input: number): string {
  return input.toString();
}

// default string comparator.
export function stringComparator(objectValue: string, compareValue: string) {
  return normalizeString(objectValue).indexOf(normalizeString(compareValue)) > -1;
}

// default string comparator.
export function numberComparator(objectValue: number, compareValue: string) {
  return normalizeNumber(objectValue).indexOf(normalizeString(compareValue)) > -1;
}

// default string array comparator.
export function arrayComparator(objectValue: any[], compareValue: string) {
  return objectValue.some(v => defaultComparator(v, compareValue));
}

// default wrapper comparator .
export function defaultComparator(objectValue: any, compareValue: string) {
  if (isArray(objectValue)) {
    return arrayComparator(objectValue, compareValue);
  }
  if (isString(objectValue)) {
    return stringComparator(objectValue, compareValue);
  }
  if (isNumber(objectValue)) {
    return numberComparator(objectValue, compareValue);
  }
  return stringComparator(objectValue ? objectValue.toString() : '', compareValue);
}

export default class FilterComparator {
  private globalFilters: FilterField[];

  constructor(private fields: FilterField[]) {
    this.globalFilters = fields ? fields.filter(f => f.id !== GLOBAL_FILTER.id) : null;
    this.compare = this.compare.bind(this);
    this.compareAll = this.compareAll.bind(this);
  }

  // Main filter comparator logic for a single object and single filter.
  // If the specified filter has an id matching GLOBAL_FILTER.id, then we apply
  //  all configured filters (except the global one) for that filter's value.
  public compare(object: any, filter: FilterField, compareValue?: string): boolean {
    // Check to see if we're dealing with the GLOBAL_FILTER.
    if (filter.id === GLOBAL_FILTER.id) {
      return this.compareAll(object, this.globalFilters, false, filter.value);
    }

    // Figure out what is the value we're using to filter.
    const _compareValue = compareValue || filter.value;

    // if value is empty, then keep the object.
    if (_compareValue.length === 0) {
      return true;
    }

    // Use filter provided comparator if there is one.
    const comparator = filter.comparator || defaultComparator;

    // Extract the value at 'path' in 'object'
    const _objectValue = extractValue(object, filter.path);

    // Single filter path.
    return comparator(_objectValue, _compareValue);
  }

  // Group comparator of object for a list of filters.
  // 'intersection' defines whether an 'and' or 'or' is applied between each filter.
  public compareAll(object: any, filters: FilterField[], intersection: boolean = true, compareValue?: string): boolean {
    if (intersection) {
      return filters.every(f => this.compare(object, f, compareValue || f.value));
    }
    return filters.some(f => this.compare(object, f, compareValue || f.value));
  }
}
