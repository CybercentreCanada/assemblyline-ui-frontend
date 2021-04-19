import lodash from 'lodash';
import { FilterField, GLOBAL_FILTER } from '../filters/filter-selector';

interface UsingFilters {
  stringComparator: (objectValue: string, compareValue: string) => boolean;
  numberComparator: (objectValue: number, compareValue: string) => boolean;
  arrayComparator: (objectValue: any[], compareValue: string) => boolean;
  applyFilter?: (list: any[], filter: FilterField) => any[];
  applyFilters?: (list: any[], filter: FilterField[], intersection?: boolean) => any[];
}

export default function useFilters(fields?: FilterField[]): UsingFilters {
  const GLOBAL_FILTERS = fields ? fields.filter(f => f.id !== GLOBAL_FILTER.id) : null;

  const isNumber = (value: any): boolean => {
    return !lodash.isNull(value) && !lodash.isNaN(value);
  };

  const extractValue = (object: any, path: string): any => lodash.get(object, path, '');

  const isString = (value: any): boolean => lodash.isString(value);

  const isArray = (value: any): boolean => lodash.isArray(value);

  const normalizeString = (input: string): string => {
    const _input = input.trim();
    return _input.toLowerCase();
  };

  const normalizeNumber = (input: number): string => input.toString();

  // default string comparator.
  const stringComparator = (objectValue: string, compareValue: string) =>
    normalizeString(objectValue).indexOf(normalizeString(compareValue)) > -1;

  // default string comparator.
  const numberComparator = (objectValue: number, compareValue: string) =>
    normalizeNumber(objectValue).indexOf(normalizeString(compareValue)) > -1;

  // default string array comparator.
  const arrayComparator = (objectValue: any[], compareValue: string) =>
    objectValue.some(v => defaultComparator(v, compareValue));

  const defaultComparator = (objectValue: any, compareValue: string) => {
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
  };

  // Main filter comparator logic for a single object and single filter.
  // If the specified filter has an id matching GLOBAL_FILTER.id, then we apply
  //  all configured filters (except the global one) for that filter's value.
  const compare = (object: any, filter: FilterField, compareValue?: string): boolean => {
    // Check to see if we're dealing with the GLOBAL_FILTER.
    if (filter.id === GLOBAL_FILTER.id) {
      return compareAll(object, GLOBAL_FILTERS, false, filter.value);
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
  };

  // Group comparator of object for a list of filters.
  // 'intersection' defines whether an 'and' or 'or' is applied between each filter.
  const compareAll = (
    object: any,
    filters: FilterField[],
    intersection: boolean = true,
    compareValue?: string
  ): boolean => {
    if (intersection) {
      return filters.every(f => compare(object, f, compareValue || f.value));
    }
    return filters.some(f => compare(object, f, compareValue || f.value));
  };

  // Apply comparator for a single FilterField.
  const applyFilter = (list: any[], filter: FilterField): any[] => list.filter(o => compare(o, filter));

  // Apply comparator for all specified FilterField.
  const applyFilters = (list: any[], filters: FilterField[], intersection: boolean = true): any[] =>
    list.filter(o => compareAll(o, filters, intersection));

  return {
    stringComparator,
    numberComparator,
    arrayComparator,
    applyFilter: fields ? applyFilter : null,
    applyFilters: fields ? applyFilters : null
  };
}
