import FlexVertical from 'commons/addons/layout/flexers/FlexVertical';
import FilterList from 'commons/addons/lists/filters/FilterList';
import type { FilterField } from 'commons/addons/lists/filters/FilterSelector';
import FilterSelector from 'commons/addons/lists/filters/FilterSelector';
import useListKeyboard from 'commons/addons/lists/hooks/useListKeyboard';
import type { LineItem } from 'commons/addons/lists/item/ListItemBase';
import BasicScroller from 'commons/addons/lists/scrollers/BasicScroller';
import type ListScroller from 'commons/addons/lists/scrollers/ListScroller';
import type { SorterField } from 'commons/addons/lists/sorters/SorterSelector';
import TableListHeader from 'commons/addons/lists/table/TableListHeader';
import TableListItem from 'commons/addons/lists/table/TableListItem';
import type { TableListLayout } from 'commons/addons/lists/table/TableListLayout';
import TableListLayoutComputer from 'commons/addons/lists/table/TableListLayout';
import type { TableColumnField } from 'commons/addons/lists/table/types';
import {
  BodyInnerFlex,
  BodyOuter,
  Cell,
  Container,
  FilterListWrap,
  FilterSelectorWrap,
  Header,
  Row,
  RowInner,
  Top
} from 'commons/addons/lists/table/useStyles';
import lodash from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';

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

  // refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyOuterRef = useRef<HTMLDivElement>(null);
  const bodyInnerRef = useRef<HTMLDivElement>(null);
  const bodyContentRef = useRef<HTMLDivElement>(null);

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
      <Row key={`tablelist.row[${rowIndex}]`}>
        <RowInner>
          {columns.map((column, cellIndex) => {
            const cellValue = column.getValue ? column.getValue(item) : lodash.get(item, column.path, '');
            const cellWidth = layout.columnWidths[cellIndex];
            return (
              <Cell
                key={`tablelist.cell[${rowIndex}][${cellIndex}]`}
                style={{ minWidth: cellWidth, maxWidth: cellWidth }}
                data-column={cellIndex}
              >
                {children(cellIndex, rowIndex, cellValue, item, column)}
              </Cell>
            );
          })}
        </RowInner>
      </Row>
    ),
    [children, columns, layout.columnWidths]
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
      <Container id={id} tabIndex={0} ref={containerRef} onKeyDown={onKeyDown}>
        <Top>
          {filterFields && filterFields.length > 0 && (
            <FilterSelectorWrap>
              <FilterSelector fields={filterFields} selections={filters} onFilter={onFilter} />
            </FilterSelectorWrap>
          )}
        </Top>
        {filters && filters.length > 0 && (
          <FilterListWrap>
            <FilterList filters={filters} onFilter={onFilter} />
          </FilterListWrap>
        )}
        {!noHeader && (
          <Header ref={headerRef}>
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
          </Header>
        )}
        <BodyOuter ref={bodyOuterRef}>
          <BodyInnerFlex ref={bodyInnerRef} flex={height === 'flex'}>
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
          </BodyInnerFlex>
        </BodyOuter>
      </Container>
    </FlexVertical>
  );
}
