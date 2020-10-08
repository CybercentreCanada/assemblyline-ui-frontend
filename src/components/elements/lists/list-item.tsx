/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Button, ButtonProps, Divider, IconButton, IconButtonProps, useTheme } from '@material-ui/core';
import React, { useCallback } from 'react';
import useListStyles from './hooks/useListStyles';

export interface LineItem {
  id: number | string;
}

export interface LineItemAction {
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
}

interface ListRowProps {
  index: number;
  loaded: boolean;
  item: LineItem;
  selected: boolean;
  rowHeight?: number;
  actions?: LineItemAction[];
  onClick: (item: LineItem, index: number) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
}

const ListRow: React.FC<ListRowProps> = React.memo(
  ({ loaded, selected, item, index, rowHeight, actions, onClick, onRenderRow }) => {
    const theme = useTheme();
    const { listItemClasses: classes } = useListStyles();

    const _onClick = useCallback(() => {
      if (onClick) {
        onClick(item, index);
      }
    }, [onClick, item, index]);

    // console.log(`rendering: ${index}`);

    return (
      <div
        className={classes.itemCt}
        data-listitem-position={index}
        data-listitem-selected={selected}
        data-listitem-focus="false"
        onClick={_onClick}
      >
        <div className={classes.itemOuter} style={{ height: !loaded ? rowHeight : null }}>
          <div className={classes.itemInner}>{loaded ? onRenderRow(item) : '...loading'}</div>
        </div>
        <div className={classes.itemDivider}>
          <Divider />
        </div>
        <div className={classes.itemActions}>
          {actions &&
            actions.map((a, i) => {
              if (a.title) {
                return (
                  <Button
                    key={`ph-action-${i}`}
                    startIcon={a.icon}
                    color={a.color}
                    onClick={a.action}
                    {...(a.btnProp as ButtonProps)}
                    style={{ marginRight: theme.spacing(1) }}
                  >
                    {a.title}
                  </Button>
                );
              }
              return (
                <IconButton
                  key={`ph-action-${i}`}
                  color={a.color}
                  onClick={a.action}
                  {...(a.btnProp as IconButtonProps)}
                  style={{ marginRight: theme.spacing(1) }}
                >
                  {a.icon}
                </IconButton>
              );
            })}
        </div>
      </div>
    );
  }
);

export default ListRow;
