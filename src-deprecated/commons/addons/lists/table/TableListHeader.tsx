import { Delete } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  ClickAwayListener,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popper,
  useTheme
} from '@mui/material';
import useSorters from 'commons/addons/lists/hooks/useSorters';
import type { LineItem } from 'commons/addons/lists/item/ListItemBase';
import type { SorterField } from 'commons/addons/lists/sorters/SorterSelector';
import SorterTrigger from 'commons/addons/lists/sorters/SorterTrigger';
import type { TableListLayout } from 'commons/addons/lists/table/TableListLayout';
import type { TableColumnField } from 'commons/addons/lists/table/types';
import { HeaderCell, HeaderCellMenuBtn, HeaderCellMenuPopper } from 'commons/addons/lists/table/useStyles';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TableListHeaderProps<T extends LineItem> {
  items: T[];
  columns: TableColumnField[];
  layout: TableListLayout;
  sorters: SorterField[];
  sorterFields: SorterField[];
  noDivider: boolean;
  onSort: (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter?: SorterField) => void;
}

const TableListHeader = memo(
  <T extends LineItem>({
    items,
    columns,
    layout,
    sorters,
    sorterFields,
    noDivider,
    onSort
  }: TableListHeaderProps<T>) => {
    const { t } = useTranslation();
    const [menuOpenIndex, onMenuBtnClick] = useState<number>(-1);
    const cellRenderer = useCallback(
      (column: TableColumnField, sorter, cellIndex, cellWidth, menuOpen) => {
        const label = column.i18nKey ? t(column.i18nKey) : column.label;
        return (
          <HeaderCell
            key={`tablelist.header[${cellIndex}]`}
            hover={!menuOpen && sorter}
            divider={!noDivider}
            style={{ minWidth: cellWidth, maxWidth: cellWidth }}
            data-column={cellIndex}
            data-menuopen={menuOpen}
          >
            {sorter ? <SorterTrigger label={label} sorter={sorter} sorters={sorters} onSort={onSort} /> : label}
            {sorter && (
              <TableListHeaderCellMenu
                columnIndex={cellIndex}
                menuOpen={menuOpen}
                sorter={sorter}
                sorters={sorters}
                onSort={onSort}
                onMenuBtnClick={onMenuBtnClick}
              />
            )}
          </HeaderCell>
        );
      },
      [noDivider, onSort, sorters, t]
    );

    return (
      <>
        {columns.map((column, cellIndex) => {
          const sorter = sorterFields.find(s => s.id === column.id);
          const cellWidth = layout.columnWidths[cellIndex];
          return cellRenderer(column, sorter, cellIndex, cellWidth, cellIndex === menuOpenIndex);
        })}
      </>
    );
  }
);

export default TableListHeader;

const TableListHeaderCellMenu = memo(
  ({
    columnIndex,
    menuOpen,
    sorter,
    sorters,
    onSort,
    onMenuBtnClick
  }: {
    columnIndex: number;
    menuOpen: boolean;
    sorter: SorterField;
    sorters: SorterField[];
    onSort: (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter?: SorterField) => void;
    onMenuBtnClick: (cellIndex: number) => void;
  }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { icon } = useSorters();
    const actionMenuRef = useRef(null);

    const onDeleteSorter = () => {
      onSort('remove', sorter);
    };

    const onSortAsc = () => {
      sorter.state = 'asc';
      onSort('apply', sorter);
    };

    const onSortDesc = () => {
      sorter.state = 'desc';
      onSort('apply', sorter);
    };

    const onUnsort = () => {
      sorter.state = 'unset';
      onSort('apply', sorter);
    };

    return (
      <div ref={actionMenuRef}>
        <HeaderCellMenuBtn>
          <IconButton size="small" onClick={() => onMenuBtnClick(columnIndex)}>
            <MoreVertIcon />
          </IconButton>
          <Popper
            anchorEl={actionMenuRef.current}
            open={menuOpen}
            placement="bottom-end"
            transition
            style={{ zIndex: theme.zIndex.modal - 1 }}
          >
            {({ TransitionProps }) => (
              <ClickAwayListener onClickAway={() => onMenuBtnClick(-1)}>
                <Fade {...TransitionProps}>
                  <HeaderCellMenuPopper>
                    <MenuItem onClick={onUnsort} disabled={sorter.state === 'unset'}>
                      <ListItemIcon>{icon('unset' as const)}</ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.unsort')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onSortAsc} disabled={sorter.state === 'asc'}>
                      <ListItemIcon>
                        <ListItemIcon>{icon('asc' as const)}</ListItemIcon>
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.asc')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onSortDesc} disabled={sorter.state === 'desc'}>
                      <ListItemIcon>
                        <ListItemIcon>{icon('desc' as const)}</ListItemIcon>
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.desc')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onDeleteSorter}>
                      <ListItemIcon>
                        <Delete />
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.remove')}</ListItemText>
                    </MenuItem>
                  </HeaderCellMenuPopper>
                </Fade>
              </ClickAwayListener>
            )}
          </Popper>
        </HeaderCellMenuBtn>
      </div>
    );
  }
);
