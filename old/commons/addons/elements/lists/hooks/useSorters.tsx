import { ArrowDownward, ArrowUpward, Remove } from '@mui/icons-material';
import { SorterField } from 'commons/addons/elements/lists/sorters/sorter-selector';
import lodash from 'lodash';
import React from 'react';

// Hook API.
interface UsingSorters {
  sort: (list: any[], sorter: SorterField) => any[];
  sortAll: (list: any[], sorters: SorterField[]) => any[];
  onSort: (list: any[], sorter: SorterField, sorters: SorterField[]) => any[];
  icon: (sorter: SorterField) => React.ReactElement;
}

export default function useSorters(): UsingSorters {
  // extract the value in the specified object at the given path.
  const extractValue = (object: any, path: string) => {
    return lodash.get(object, path);
  };

  // Default string compare.
  const compareString = (v1: string, v2: string) => {
    return v1.localeCompare(v2);
  };

  // Default number compare.
  const compareNumber = (v1: number, v2: number) => {
    return v1 - v2;
  };

  // Main compare logic.
  // We differentiate between string and numbers, for any other
  //  types, we use the value's [toString] method.
  const compare = (v1: any, v2: any, sorter: SorterField) => {
    if (sorter.state === 'unset') {
      return 0;
    }
    let result = 0;
    if (lodash.isNumber(v1)) {
      const _v1 = extractValue(v1, sorter.path) as number;
      const _v2 = extractValue(v2, sorter.path) as number;
      result = compareNumber(_v1, _v2);
    } else if (lodash.isString(v1)) {
      const _v1 = extractValue(v1, sorter.path) as string;
      const _v2 = extractValue(v2, sorter.path) as string;
      result = compareString(_v1, _v2);
    } else {
      const _v1 = extractValue(v1, sorter.path).toString();
      const _v2 = extractValue(v2, sorter.path).toString();
      result = compareString(_v1, _v2);
    }
    return sorter.state === 'asc' ? result : -result;
  };

  // Sort the specified list for the specified sort field.
  const sort = (list: any[], sorter: SorterField): any[] => {
    if (sorter.state === 'unset') {
      return list;
    }
    return list.concat().sort((o1, o2) => compare(o1, o2, sorter));
  };

  // Sort a list for the specified list of sorters.
  // If the previous sorter resolved to 0, then the next sorter is applied.
  const sortAll = (list: any[], sorters: SorterField[]): any[] => {
    return list.concat().sort((o1, o2) => {
      let result = 0;
      for (const s of sorters) {
        result = compare(o1, o2, s);
        if (result !== 0) {
          break;
        }
      }
      return result;
    });
  };

  // Handler to bind to an onClick event in order set sorter to its next state and then initiate the sort.
  const onSort = (list: any[], sorter: SorterField, sorters: SorterField[]): any[] => {
    if (sorter.state === 'unset') {
      sorter.state = 'asc';
    } else if (sorter.state === 'asc') {
      sorter.state = 'desc';
    } else {
      sorter.state = 'unset';
    }
    const sorted = sortAll(list, sorters);
    return sorted;
  };

  // Get the correct icon based on the current sorter state.
  const icon = (sorter: SorterField): React.ReactElement => {
    const { state } = sorter;
    return state === 'asc' ? (
      <ArrowDownward fontSize="small" />
    ) : state === 'desc' ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <Remove fontSize="small" />
    );
  };

  // API functions.
  return { sort, sortAll, onSort, icon };
}
