import {
  ClickAwayListener,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Popper,
  useTheme
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSorters from '../hooks/useSorters';
import { LineItem } from '../item/ListItemBase';
import { SorterField } from '../sorters/SorterSelector';
import SorterTrigger from '../sorters/SorterTrigger';
import { TableListLayout } from './TableListLayout';
import { TableColumnField } from './types';
import { useItemStyles, useTableStyles } from './useStyles';

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
    const classes = useTableStyles();
    const itemClasses = useItemStyles();
    const [menuOpenIndex, onMenuBtnClick] = useState<number>(-1);
    const cellRenderer = useCallback(
      (column: TableColumnField, sorter, cellIndex, cellWidth, menuOpen) => {
        const label = column.i18nKey ? t(column.i18nKey) : column.label;
        return (
          <div
            key={`tablelist.header[${cellIndex}]`}
            className={`${classes.headerCell} ${!menuOpen && sorter ? itemClasses.itemHover : ''} ${
              !noDivider ? itemClasses.itemDivider : ''
            }`}
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
          </div>
        );
      },
      [classes, itemClasses, sorters, noDivider, t, onSort]
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
    const classes = useTableStyles();
    const actionMenuRef = useRef();

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
        <div className={classes.headerCellMenuBtn}>
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
                  <MenuList className={classes.headerCellMenuPopper}>
                    <MenuItem onClick={onUnsort} disabled={sorter.state === 'unset'}>
                      <ListItemIcon>{icon('unset' as 'unset')}</ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.unsort')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onSortAsc} disabled={sorter.state === 'asc'}>
                      <ListItemIcon>
                        <ListItemIcon>{icon('asc' as 'asc')}</ListItemIcon>
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.asc')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onSortDesc} disabled={sorter.state === 'desc'}>
                      <ListItemIcon>
                        <ListItemIcon>{icon('desc' as 'desc')}</ListItemIcon>
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.desc')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={onDeleteSorter}>
                      <ListItemIcon>
                        <Delete />
                      </ListItemIcon>
                      <ListItemText>{t('list.selector.sorters.remove')}</ListItemText>
                    </MenuItem>
                  </MenuList>
                </Fade>
              </ClickAwayListener>
            )}
          </Popper>
        </div>
      </div>
    );
  }
);
