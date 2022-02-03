import { makeStyles } from '@material-ui/core';
import { HexStore } from 'components/visual/HexViewer';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { HexRow } from '.';

const useStyles = makeStyles(theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'stretch',
    userSelection: 'none',

    lineHeight: 1.15
  },
  table: {
    padding: 0,
    margin: 0,
    borderSpacing: 0
  },
  tableBody: {
    padding: 0,
    margin: 0
  },
  spacer: {
    flex: 1
  },

  root: {
    height: '1000px',
    overflowX: 'hidden'
  },

  list: {
    border: '1px solid #d9dddd'
  },

  listItemEven: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
    // backgroundColor: '#f8f8f0'
  },
  listItemOdd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

export type HexListProps = {
  store?: HexStore;
};

export const WrappedHexList = ({ store }: HexListProps) => {
  const classes = useStyles();

  return (
    <>
      <AutoSizer className={classes.root} style={{ height: '800px' }}>
        {({ height, width }) => (
          <List className={classes.list} height={height} itemCount={1000} itemSize={20} width={width}>
            {({ index, style }) => <HexRow store={store} rowIndex={index} style={style} />}
          </List>
        )}
      </AutoSizer>
    </>
  );
};

export const HexList = React.memo(WrappedHexList);
