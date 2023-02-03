import { useEffect, useMemo, useState } from 'react';
import FilterComparator from '../filters/FilterComparator';
import { FilterField } from '../filters/FilterSelector';

const DEFAULT_FIELDS = [];

export default function useFilters(fields?: FilterField[]) {
  // Hold a FilterComparator in state.
  const [comparator, setComparator] = useState<FilterComparator>(
    new FilterComparator(fields && fields.length > 0 ? fields : DEFAULT_FIELDS)
  );

  // Recreate comparator when 'fields' change.
  useEffect(() => setComparator(new FilterComparator(fields)), [fields]);

  // return memoized callbacks.
  return useMemo(
    () => ({
      applyFilters: (
        filters: FilterField[],
        items: any[],
        config: {
          action: 'apply' | 'reset' | 'remove' | 'remove-all';
          filter?: FilterField;
          intersection?: boolean;
        } = { action: 'apply' }
      ) => {
        // create a new reference to filters array.
        let _filters = [...filters];

        // add filter to filters if it isn't present already.
        if (config.filter && !_filters.some(f => f.id === config.filter.id)) {
          _filters.push(config.filter);
        }

        // we have an action perform?
        if (config.action === 'reset' && config.filter) {
          // reset value of filter to empty string.
          config.filter.value = '';
        } else if (config.action === 'remove' && config.filter) {
          // clear the value
          config.filter.value = '';
          // remove filters.
          _filters = _filters.filter(f => f.id !== config.filter.id);
        } else if (config.action === 'remove-all') {
          // reset all filter values.
          _filters.forEach(f => {
            f.value = '';
          });
          // remove all filters.
          _filters = [];
        }
        // Do it! [evil face]
        const result = items.filter(o => comparator.compareAll(o, _filters, config.intersection));

        // Back to you...
        return { result, filter: config.filter, filters: _filters };
      }
    }),
    [comparator]
  );
}
