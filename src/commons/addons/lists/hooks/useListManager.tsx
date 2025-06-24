import type { FilterField } from 'commons/addons/lists/filters/FilterSelector';
import useFilters from 'commons/addons/lists/hooks/useFilters';
import useSorters from 'commons/addons/lists/hooks/useSorters';
import type { LineItem } from 'commons/addons/lists/item/ListItemBase';
import type { SorterField } from 'commons/addons/lists/sorters/SorterSelector';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_ITEMS = [];

export default function useListManager<T extends LineItem>(filterFields?: FilterField[]) {
  // hooks.
  const { applySort } = useSorters();
  const { applyFilters } = useFilters(filterFields);

  // state.
  const [state, setState] = useState<{
    items: T[];
    filteredItems: T[];
    displayItems: T[];
    sorters: SorterField[];
    filters: FilterField[];
  }>({
    items: DEFAULT_ITEMS,
    filteredItems: DEFAULT_ITEMS,
    displayItems: DEFAULT_ITEMS,
    sorters: DEFAULT_ITEMS,
    filters: DEFAULT_ITEMS
  });

  // Load items callbacks.
  const load = useCallback(
    (items: T[]) => {
      setState(_state => {
        const filterResult = applyFilters(_state.filters, items, { action: 'apply' });
        const sorterResult = applySort(_state.sorters, items, { action: 'apply' });
        // const result = applySort(items, _state.sorters);
        return {
          items,
          filteredItems: filterResult.result,
          displayItems: sorterResult.result,
          filters: filterResult.filters,
          sorters: sorterResult.sorters
        };
      });
    },
    [applyFilters, applySort]
  );

  // Filter items callback.
  // This function will also apply the sorters present in the state at moment of invocation.
  const onFilter = useCallback(
    (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => {
      setState(_state => {
        const filterResult = applyFilters(_state.filters, _state.items, { action, filter });
        const sorterResult = applySort(_state.sorters, filterResult.result, { action: 'apply' });
        // const sortResult = applySort(filterResult.result, _state.sorters);
        return {
          items: _state.items,
          filteredItems: filterResult.result,
          displayItems: sorterResult.result,
          sorters: _state.sorters,
          filters: filterResult.filters
        };
      });
    },
    [applyFilters, applySort]
  );

  // Sort items callbacks.
  const onSort = useCallback(
    (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter?: SorterField) => {
      setState(_state => {
        const result = applySort(_state.sorters, _state.filteredItems, { sorter, action });
        return {
          items: _state.items,
          filteredItems: _state.filteredItems,
          displayItems: result.result,
          sorters: result.sorters,
          filters: _state.filters
        };
      });
    },
    [applySort]
  );

  // Memoize returned object to optimize renders.
  return useMemo(() => ({ ...state, load, onSort, onFilter }), [state, load, onSort, onFilter]);
}
