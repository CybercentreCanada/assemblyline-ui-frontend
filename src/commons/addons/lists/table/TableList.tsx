/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import FlexVertical from 'commons/addons/layout/flexers/FlexVertical';
import lodash from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import FilterList from '../filters/FilterList';
import FilterSelector, { FilterField } from '../filters/FilterSelector';
import useListKeyboard from '../hooks/useListKeyboard';
import { LineItem } from '../item/ListItemBase';
import BasicScroller from '../scrollers/BasicScroller';
import ListScroller from '../scrollers/ListScroller';
import { SorterField } from '../sorters/SorterSelector';
import TableListHeader from './TableListHeader';
import TableListItem from './TableListItem';
import TableListLayoutComputer, { TableListLayout } from './TableListLayout';
import { TableColumnField } from './types';
import { useTableStyles } from './useStyles';

const DEFAULT_EMPTY_LIST = [];

const DEFAULT_CELL_RENDERER = (
  cellIndex: number,
  rowIndex: number,
  cellValue: any,
  item?: any,
  column?: TableColumnField
) => cellValue;

interface TableListProps<T extends LineItem> {
  id: string;
  height?: 'flex' | number | null;
  loading: boolean;
  items: T[];
  displayItems: T[];
  filteredItems: T[];
  columns: TableColumnField[];
  emptyValue?: React.ReactNode;
  noHeader?: boolean;
  noHover?: boolean;
  noDivider?: boolean;
  autofocus?: boolean;
  filters?: FilterField[];
  filterFields?: FilterField[];
  sorters?: SorterField[];
  sorterFields?: SorterField[];
  onFilter?: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
  onSort?: (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter?: SorterField) => void;
  onRenderActions?: (item: T, rowIndex?: number) => React.ReactElement;
  onRowSelection?: (item: T, position?: number) => void;
  children?: (
    cellIndex: number,
    rowIndex: number,
    cellValue: any,
    item?: T,
    column?: TableColumnField
  ) => React.ReactNode;
}

export default function TableList<T extends LineItem>(props: TableListProps<T>) {
  const {
    id,
    height,
    emptyValue,
    columns,
    items,
    displayItems,
    filteredItems,
    filters = DEFAULT_EMPTY_LIST,
    filterFields = DEFAULT_EMPTY_LIST,
    sorters = DEFAULT_EMPTY_LIST,
    sorterFields = DEFAULT_EMPTY_LIST,
    noHeader,
    noHover,
    noDivider,
    autofocus,
    onFilter,
    onSort,
    onRowSelection,
    onRenderActions,
    children = DEFAULT_CELL_RENDERER
  } = props;

  // styles
  const classes = useTableStyles();

  // refs
  const containerRef = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();
  const bodyOuterRef = useRef<HTMLDivElement>();
  const bodyInnerRef = useRef<HTMLDivElement>();
  const bodyContentRef = useRef<HTMLDivElement>();

  // Scroll hook to monitor position of scrollbar.
  // TODO: implement infinite scroll support.
  // useScroll(bodyInnerRef.current, { onEnd: () => console.log('reached end.') });

  // states.
  const [scroller, setScroller] = useState<ListScroller>();
  const [layout, setLayout] = useState<TableListLayout>();
  const [sortedColumns] = useState<TableColumnField[]>(columns.sort((c1, c2) => c1.position - c2.position));

  // keyboard events.
  const { cursor, onKeyDown } = useListKeyboard({
    id,
    autofocus,
    scroller,
    count: displayItems.length,
    onEscape: onRowSelection ? (_cursor: number) => onRowSelection(null, _cursor) : null,
    onEnter: onRowSelection ? (_cursor: number) => onRowSelection(items[_cursor]) : null
  });

  // row renderer..
  const rowRenderer = useCallback(
    (item: T, rowIndex: number) => (
      <div className={classes.row} key={`tablelist.row[${rowIndex}]`}>
        <div className={classes.rowInner}>
          {columns.map((column, cellIndex) => {
            const cellValue = column.getValue ? column.getValue(item) : lodash.get(item, column.path, '');
            const cellWidth = layout.columnWidths[cellIndex];
            return (
              <div
                key={`tablelist.cell[${rowIndex}][${cellIndex}]`}
                className={classes.cell}
                style={{ minWidth: cellWidth, maxWidth: cellWidth }}
                data-column={cellIndex}
              >
                {children(cellIndex, rowIndex, cellValue, item, column)}
              </div>
            );
          })}
        </div>
      </div>
    ),
    [children, classes.cell, classes.row, classes.rowInner, layout, columns]
  );

  // Layout computer.
  const onBodyResize = (width: number) => {
    const _layout = new TableListLayoutComputer(
      containerRef.current, //
      headerRef.current,
      bodyContentRef.current,
      columns
    );
    setLayout(_layout.compute());
  };

  // Scroller computer.
  useEffect(() => {
    setScroller(new BasicScroller(bodyInnerRef.current));
  }, []);

  return (
    <FlexVertical>
      <div id={id} tabIndex={0} ref={containerRef} className={classes.container} onKeyDown={onKeyDown}>
        <div className={classes.top}>
          {filterFields && filterFields.length > 0 && (
            <div className={classes.filterSelector}>
              <FilterSelector fields={filterFields} selections={filters} onFilter={onFilter} />
            </div>
          )}
        </div>
        {filters && filters.length > 0 && (
          <div className={classes.filterList}>
            <FilterList filters={filters} onFilter={onFilter} />
          </div>
        )}
        {!noHeader && (
          <div ref={headerRef} className={classes.header}>
            {layout && (
              <TableListHeader
                items={filteredItems}
                columns={sortedColumns}
                layout={layout}
                sorters={sorters}
                sorterFields={sorterFields}
                noDivider={noDivider}
                onSort={onSort}
              />
            )}
          </div>
        )}
        <div ref={bodyOuterRef} className={classes.bodyOuter}>
          <div ref={bodyInnerRef} className={height === 'flex' ? classes.bodyInnerFlex : null}>
            <ReactResizeDetector handleWidth handleHeight={false} targetRef={bodyContentRef} onResize={onBodyResize}>
              <div ref={bodyContentRef}>
                {layout && (!items || items.length === 0) && emptyValue}
                {layout &&
                  items &&
                  displayItems.map((item, index) => (
                    <TableListItem
                      key={`row[${item.id}]`}
                      item={item}
                      selected={index === cursor}
                      index={index}
                      itemCount={displayItems.length}
                      noHover={noHover}
                      noDivider={noDivider}
                      onSelection={onRowSelection}
                      onRenderActions={onRenderActions}
                    >
                      {rowRenderer}
                    </TableListItem>
                  ))}
              </div>
            </ReactResizeDetector>
          </div>
        </div>
      </div>
    </FlexVertical>
  );
}
