import { ArrowDownward, ArrowUpward, Remove } from '@mui/icons-material';
import { SorterField } from 'commons/addons/elements/lists/sorters/SorterSelector';
import lodash from 'lodash';
import * as React from 'react';

//
const isNumber = (value: any): boolean => lodash.isNumber(value) || (!lodash.isEmpty(value) && !isNaN(value));

// extract the value in the specified object at the given path.
const extractValue = (object: any, path: string) => {
  const _value = lodash.get(object, path, '');
  return _value || '';
};

// Default string compare.
const compareString = (v1: string, v2: string) => v1.localeCompare(v2);

// Default number compare.
const compareNumber = (v1: number, v2: number) => v1 - v2;

// Main compare logic.
// We differentiate between string and numbers, for any other
//  types, we use the value's [toString] method.
const compare = (v1: any, v2: any, sorter: SorterField) => {
  //
  if (!sorter.state) {
    sorter.state = sorter.defaultState || 'asc';
  }

  // don't compare anything if state is unset.
  if (sorter.state === 'unset') {
    return 0;
  }

  // extract values to compare.
  const _v1 = sorter.getValue ? sorter.getValue(v1) : extractValue(v1, sorter.path);
  const _v2 = sorter.getValue ? sorter.getValue(v2) : extractValue(v2, sorter.path);

  // compare based on type.
  let result = 0;
  if (isNumber(_v1)) {
    result = compareNumber(_v1, _v2);
  } else if (lodash.isString(v1)) {
    result = compareString(_v1, _v2);
  } else {
    result = compareString(_v1, _v2);
  }

  // result based on sort order.
  return sorter.state === 'asc' ? result : -result;
};

// Sort a list for the specified list of sorters.
// If the previous sorter resolved to 0, then the next sorter is applied.
const applySorters = (list: any[], sorters: SorterField[]): any[] =>
  list.concat().sort((o1, o2) => {
    let result = 0;
    for (const s of sorters) {
      result = compare(o1, o2, s);
      if (result !== 0) {
        break;
      }
    }
    return result;
  });

// Sort the specified list, given the specified filters.
// If a 'sorter' is provided, then it will performed the specified 'action'
//  on it and update 'sorters' accordingly.
const applySort = (
  sorters: SorterField[],
  items: any[],
  config: {
    action: 'apply' | 'next' | 'remove' | 'remove-all';
    sorter?: SorterField;
  }
): { result: any[]; sorter: SorterField; sorters: SorterField[] } => {
  // create a new sorters array reference.
  let _sorters = [...sorters];

  // add the sorter to the array if its not there.
  if (config.sorter && !_sorters.some(s => s.id === config.sorter.id)) {
    _sorters.push(config.sorter);
  }

  // what action to perform?
  if (config.action === 'next') {
    // 'tick' -> tick to next sort order state.
    config.sorter.state = nextState(config.sorter);
  } else if (config.action === 'remove') {
    // reset state of sorter.
    config.sorter.state = null;
    // 'remove' -> remove the filter from the array.
    _sorters = _sorters.filter(s => s.id !== config.sorter.id);
  } else if (config.action === 'remove-all') {
    // reset all states.
    _sorters.forEach(s => {
      s.state = null;
    });
    // remove all sortes.
    _sorters = [];
  }

  // apply the sorters with update state.
  const result = applySorters(items, _sorters);

  // Give it back.
  return { result, sorter: config.sorter, sorters: _sorters };
};

// Get the correct icon based on the current sorter state.
const icon = (sortOrder: 'asc' | 'desc' | 'unset'): React.ReactElement =>
  sortOrder === 'asc' ? (
    <ArrowDownward fontSize="small" />
  ) : sortOrder === 'desc' ? (
    <ArrowUpward fontSize="small" />
  ) : (
    <Remove fontSize="small" />
  );

const nextState = (sorter: SorterField): 'asc' | 'desc' | 'unset' => {
  if (sorter.state === 'unset') {
    return 'asc';
  }
  if (sorter.state === 'asc') {
    return 'desc';
  }
  if (sorter.state === 'desc') {
    return 'unset';
  }
  return sorter.defaultState || 'asc';
};

export interface ApplySortResult {
  result: any[];
  sorter: SorterField;
  sorters: SorterField[];
}

export default function useSorters() {
  return { applySort, nextState, icon };
}
