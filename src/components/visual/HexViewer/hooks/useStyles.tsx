import { makeStyles } from '@material-ui/core';
import { yellow } from '@material-ui/core/colors';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useCallback, useContext, useMemo } from 'react';
import { HexProps, useLayout } from '..';

const useNewHexStyles = makeStyles(theme => ({
  root: {
    fontFamily:
      '"Source Code Pro", "HexEd.it Symbols", "Courier New", Consolas, Menlo, "PT Mono", "Liberation Mono", monospace;',
    fontSize: '1rem',
    width: '100%'
  },
  app: {
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    userSelection: 'none'
  },
  spacers: {
    flex: 1
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75)
  },
  rows: {
    '& > div': {
      display: 'flex',
      flexDirection: 'row'
    }
  },
  item: {
    '& > div > div': {
      display: 'block',
      paddingLeft: theme.spacing(0.2),
      paddingRight: theme.spacing(0.2),
      fontWeight: theme.palette.type === 'dark' ? 400 : 600,
      userSelect: 'none'
    }
  },
  offsets: {
    '& > div': {
      display: 'block',
      color: theme.palette.text.secondary,
      fontWeight: theme.palette.type === 'dark' ? 400 : 600,
      userSelect: 'none'
    }
  }
}));

const useItemStyles = makeStyles(theme => ({
  hexBorder: {
    '& > div > div:nth-child(4n + 1):nth-child(n+2) ': {
      borderLeft: `1px solid ${theme.palette.text.hint}`
    }
  },
  characterColor: {
    color: theme.palette.text.primary
  },
  nullColor: {
    color: theme.palette.text.disabled
  },
  hover: {
    backgroundColor: theme.palette.action.selected
  },
  select: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.main,
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  selectedSearch: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.warning.main,
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  search: {
    color: theme.palette.common.black,
    backgroundColor: yellow[500],
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  cursor: {
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    backgroundColor: theme.palette.primary.light,
    color: 'white !important',
    animation: `1s $blink step-end infinite`
  },
  '@keyframes blink': {
    'from, to': {
      boxShadow: `inset 0 -4px 0 -2px ${theme.palette.primary.dark}`
    },
    '50%': {
      boxShadow: `none`
    }
  }
}));

export const useToolBarStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  },
  toolbar: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  autocompleteInputRoot: {
    '& > fieldset': {
      border: 'none !important',
      borderWidth: '0px'
    }
  },
  autocompletePopper: {
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    },
    width: '50vw'
  },
  autocompletePaper: {
    margin: `${theme.spacing(1)}px 0px`,
    borderRadius: `0 0 ${theme.spacing(0.5)}px ${theme.spacing(0.5)}px`,
    width: '50vw'
  },
  autocompleteList: {
    margin: 0,
    padding: 0,
    maxHeight: `180px`
  },
  autocompleteOption: {
    fontSize: theme.typography.fontSize,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    '&[data-focus="true"]': {
      cursor: 'pointer',
      backgroundColor: theme.palette.action.hover
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.action.selected
    }
  },
  resultIndexes: {
    textAlign: 'center',
    cursor: 'pointer',
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      padding: 2
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0
    }
  },
  resultNoneIndexes: {
    textAlign: 'center',
    cursor: 'default',
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      padding: 2
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0
    }
  },
  cursorIndex: {
    minWidth: '125px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  searchPaper: {
    marginTop: '16px',
    padding: theme.spacing(1),
    minWidth: '200px',
    backgroundColor: theme.palette.background.paper
  },
  iconButton: {
    padding: 10,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
    [theme.breakpoints.down('xs')]: {
      padding: 2
    }
  },
  divider: {
    height: 28,
    margin: 4
  },
  menuPopper: {
    marginTop: '-10px',
    minWidth: '250px',
    backgroundColor: theme.palette.background.paper
  }
}));

export const useScrollBarStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  buttonBox: {
    display: 'grid',
    height: '42px',
    minHeight: '42px'
  },
  buttonUpBox: {
    placeSelf: 'center',
    placeItems: 'start'
  },
  buttonDownBox: {
    placeSelf: 'center',
    placeItems: 'end'
  },
  button: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    minWidth: '28px',
    minHeight: '28px',
    fontSize: '0.8125rem',
    padding: 0
  }
}));

export type StyleContextProps = {
  hexClasses?: ClassNameMap<any>;
  itemClasses?: ClassNameMap<any>;
  toolbarClasses?: ClassNameMap<any>;
  containerClasses?: ClassNameMap<any>;
  scrollbarClasses?: ClassNameMap<any>;

  addClassItem?: (refs: any, index: number, classname: string) => void;
  removeClassItem?: (refs: any, index: number, classname: string) => void;
  addClassToItemRange?: (refs: any, start: number, end: number, classname: string) => void;
  removeClassToItemRange?: (refs: any, start: number, end: number, classname: string) => void;

  addContainerClass?: (index: number, classname: string) => void;
  removeContainerClass?: (index: number, classname: string) => void;
  addContainerClassToRange?: (start: number, end: number, classname: string) => void;
  removeContainerClassToRange?: (start: number, end: number, classname: string) => void;
  addContainerClassToIndexArray: (indexes: Array<number>, length: number, classname: string) => void;
  removeContainerClassToIndexArray: (indexes: Array<number>, length: number, classname: string) => void;

  getHexColorClass?: (hexes: Map<number, string>, index: number) => string;
  getCursorClass?: (cursorIndex: number, index: number) => string;
  getSelectClass?: (
    selectIndexes: {
      start: number;
      end: number;
    },
    index: number
  ) => string;
  getSearchClass?: (
    searchQuery: {
      key?: string;
      value?: string;
      length?: number;
    },
    searchIndexes: number[],
    searchIndex: number,
    index: number
  ) => string;
  getSelectedSearchClass?: (
    searchQuery: {
      key?: string;
      value?: string;
      length?: number;
    },
    searchIndexes: number[],
    searchIndex: number,
    index: number
  ) => string;
};

export const StyleContext = React.createContext<StyleContextProps>(null);

export const WrappedStyleProvider = ({ children }: HexProps) => {
  const { containerRefs } = useLayout();
  const hexClasses = useNewHexStyles();
  const itemClasses = useItemStyles();
  const toolbarClasses = useToolBarStyles();
  const scrollbarClasses = useScrollBarStyles();

  const addClassItem = useCallback((refs: any, index: number, classname: string) => {
    for (let i = 0; i < refs.length; i++)
      refs[i].current?.querySelector("[data-index='" + index + "']")?.classList.add('class', classname);
  }, []);

  const removeClassItem = useCallback((refs: any, index: number, classname: string) => {
    for (let i = 0; i < refs.length; i++)
      refs[i].current?.querySelector("[data-index='" + index + "']")?.classList.remove('class', classname);
  }, []);

  const addClassToItemRange = useCallback(
    (refs: any, start: number, end: number, classname: string) => {
      for (let i = start; i <= end; i++) addClassItem(refs, i, classname);
    },
    [addClassItem]
  );

  const removeClassToItemRange = useCallback(
    (refs: any, start: number, end: number, classname: string) => {
      for (let i = start; i <= end; i++) removeClassItem(refs, i, classname);
    },
    [removeClassItem]
  );

  const addContainerClass = useCallback(
    (index: number, classname: string) => addClassItem(containerRefs, index, classname),
    [addClassItem, containerRefs]
  );

  const removeContainerClass = useCallback(
    (index: number, classname: string) => removeClassItem(containerRefs, index, classname),
    [containerRefs, removeClassItem]
  );

  const addContainerClassToRange = useCallback(
    (start: number, end: number, classname: string) => {
      for (let i = start; i <= end; i++) addContainerClass(i, classname);
    },
    [addContainerClass]
  );

  const removeContainerClassToRange = useCallback(
    (start: number, end: number, classname: string) => {
      for (let i = start; i <= end; i++) removeContainerClass(i, classname);
    },
    [removeContainerClass]
  );

  const addContainerClassToIndexArray = useCallback(
    (indexes: Array<number>, length: number, classname: string) =>
      indexes.forEach(index => addContainerClassToRange(index, index + length - 1, classname)),
    [addContainerClassToRange]
  );

  const removeContainerClassToIndexArray = useCallback(
    (indexes: Array<number>, length: number, classname: string) =>
      indexes.forEach(index => removeContainerClassToRange(index, index + length - 1, classname)),
    [removeContainerClassToRange]
  );

  const getHexColorClass = useCallback(
    (hexes: Map<number, string>, index: number) =>
      ['00', '20', '0a'].includes(hexes.get(index)) ? itemClasses.nullColor : null,
    [itemClasses]
  );

  const getCursorClass = useCallback(
    (cursorIndex: number, index: number) => (cursorIndex === index ? itemClasses.cursor : null),
    [itemClasses]
  );

  const getSelectClass = useCallback(
    (
      selectIndexes: {
        start: number;
        end: number;
      },
      index: number
    ) => (index >= selectIndexes.start && index <= selectIndexes.end ? itemClasses.select : null),
    [itemClasses]
  );

  const getSearchClass = useCallback(
    (
      searchQuery: {
        key?: string;
        value?: string;
        length?: number;
      },
      searchIndexes: number[],
      searchIndex: number,
      index: number
    ) => {
      let i = 0;
      while (i < searchIndexes.length) {
        if (searchIndexes[i] <= index && index < searchIndexes[i] + searchQuery.length && i !== searchIndex)
          return itemClasses.search;
        i++;
      }
      return null;
    },
    [itemClasses]
  );

  const getSelectedSearchClass = useCallback(
    (
      searchQuery: {
        key?: string;
        value?: string;
        length?: number;
      },
      searchIndexes: number[],
      searchIndex: number,
      index: number
    ) =>
      index >= searchIndexes[searchIndex] && index < searchIndexes[searchIndex] + searchQuery.length
        ? itemClasses.selectedSearch
        : null,
    [itemClasses]
  );

  return (
    <StyleContext.Provider
      value={{
        hexClasses,
        itemClasses,
        toolbarClasses,
        scrollbarClasses,

        addClassItem,
        removeClassItem,
        addClassToItemRange,
        removeClassToItemRange,

        addContainerClass,
        removeContainerClass,
        addContainerClassToRange,
        removeContainerClassToRange,
        addContainerClassToIndexArray,
        removeContainerClassToIndexArray,

        getHexColorClass,
        getCursorClass,
        getSelectClass,
        getSearchClass,
        getSelectedSearchClass
      }}
    >
      {useMemo(() => children, [children])}
    </StyleContext.Provider>
  );
};

export const StyleProvider = React.memo(WrappedStyleProvider);
export const useStyles = (): StyleContextProps => useContext(StyleContext) as StyleContextProps;
