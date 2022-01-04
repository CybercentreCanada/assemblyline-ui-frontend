import { Button, makeStyles, Slider, TextField } from '@material-ui/core';
import { blue, grey } from '@material-ui/core/colors';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';

const hexEditorStyles = makeStyles(theme => ({
  main: {
    fontFamily:
      '"Source Code Pro", "HexEd.it Symbols", "Courier New", Consolas, Menlo, "PT Mono", "Liberation Mono", monospace;',
    fontSize: '1rem',
    width: '100%'
  },
  searchbar: {},
  content: {
    height: '0px',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    minHeight: '50vh',
    width: '100%',

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  container: {
    flex: 1,
    paddingRight: theme.spacing(1)
  },
  offsetContainer: {
    color: theme.palette.type === 'dark' ? grey[400] : grey[300],
    paddingRight: theme.spacing(1)
  },
  item: {
    minWidth: theme.spacing(1),
    letterSpacing: '1.0',
    lineHeight: '1.0',
    fontSize: '1rem',
    paddingTop: '2.25px',
    paddingBottom: '2.5px'
  },
  itemHex: {
    paddingRight: '1.25px',
    paddingLeft: '1.25px'
  },
  itemHover: {
    backgroundColor: theme.palette.type === 'dark' ? grey[700] : grey[300]
  },
  itemHovering: {
    // '&:hover': {
    //   backgroundColor: theme.palette.type === 'dark' ? grey[700] : grey[300]
    // }
  },
  itemHighlighted: {
    backgroundColor: theme.palette.type === 'dark' ? grey[600] : grey[400]
  },
  itemCursor: {
    backgroundColor: blue[500],
    color: 'white',
    animation: `1s $blink step-end infinite`
    // '-webkit-animation': '1s blink step-end infinite',
    // '-moz-animation': '1s blink step-end infinite',
    // '-ms-animation': '1s blink step-end infinite',
    // '-o-animation': '1s blink step-end infinite',
    // '@-moz-keyframes blink': {
    //   'from, to': {
    //     color: 'transparent'
    //   },
    //   '50%': {
    //     color: 'white'
    //   }
    // },
    // '@-webkit-keyframes blink': {
    //   'from, to': {
    //     color: 'transparent'
    //   },
    //   '50%': {
    //     color: 'white'
    //   }
    // },
    // '@-ms-keyframes blink': {
    //   'from, to': {
    //     color: 'transparent'
    //   },
    //   '50%': {
    //     color: 'white'
    //   }
    // },
    // '@-o-keyframes blink': {
    //   'from, to': {
    //     color: 'transparent'
    //   },
    //   '50%': {
    //     color: 'white'
    //   }
    // }
  },
  itemBorder: {
    borderRight: `1px solid ${grey[500]}`
  },
  itemHexChar: {
    color: grey[100]
  },
  itemNullChar: {
    color: grey[500]
  },
  scrollbar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  scrollbarBox: {
    display: 'grid',
    height: '42px',
    minHeight: '42px'
  },
  scrollbarButton: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    minWidth: '28px',
    minHeight: '28px',
    padding: 0
  },
  scrollbarUp: {
    placeItems: 'start'
  },
  scrollbarDown: {
    placeItems: 'end'
  },
  scrollbarTrack: {
    height: '100%'
  },
  '@keyframes blink': {
    'from, to': {
      boxShadow: `inset 0 -4px 0 -2px ${blue[200]}`
      // borderBottom: `20px solid ${blue[200]}`
    },
    '50%': {
      boxShadow: `none`
    }
  }
}));

type HexEditorProps = {
  data: string;
};

let cursorIndex: number = -1;
let mouseDownIndex: number = -1;
let mouseUpIndex: number = -1;
let isMouseDown: boolean = false;
let isHighlighting: boolean = true;
let selectIndexes: Array<{ start: number; end: number }> = [];

export const HexEditor = React.memo(({ data }: HexEditorProps) => {
  const classes = hexEditorStyles();

  const [hexes, setHexes] = useState<Array<any>>([]);

  const [xSize, setXSize] = useState<number>(28);
  const [ySize, setYSize] = useState<number>(30);
  const [yIndex, setYIndex] = useState<number>(0);
  const [yMax, setYMax] = useState<number>();
  const [scrollingSpeed, setScrollingSpeed] = useState<number>(1);
  const [base, setBase] = useState<number>(10);

  const hexContainer = document.getElementById('hexes-container');
  const textContainer = document.getElementById('texts-container');

  // `data` contains the bytes to show. It can also be `Uint8Array`!
  const testdata = React.useMemo(() => new Array(100).fill(0), []);
  // If `data` is large, you probably want it to be mutable rather than cloning it over and over.
  // `nonce` can be used to update the editor when `data` is reference that does not change.
  const [nonce, setNonce] = useState(0);
  // The callback facilitates updates to the source data.
  const handleSetValue = React.useCallback(
    (offset, value) => {
      testdata[offset] = value;
      setNonce(v => v + 1);
    },
    [data]
  );

  // All basic functions
  const getHexString = (hex: string) => {
    switch (hex) {
      case '20':
        return '·';
      case '0a':
        return '·';
      default:
        return Buffer.from(hex, 'hex').toString();
    }
  };

  const getColorClass = (hex: string) => {
    switch (hex) {
      case '20':
        return classes.itemNullChar;
      case '0a':
        return classes.itemNullChar;
      default:
        return classes.itemHexChar;
    }
  };

  const getBorderClass = (index: number) => {
    return (index % xSize) % 4 === 4 - 1 && index % xSize !== xSize - 1 ? classes.itemBorder : null;
  };

  const getCursorClass = (index: number) => {
    return cursorIndex === index ? classes.itemCursor : null;
  };

  const addClassItem = (container: HTMLElement, index: number, classname: string) => {
    container.querySelector("[data-index='" + index + "']")?.classList.add('class', classname);
  };

  const removeClassItem = (container: HTMLElement, index: number, classname: string) => {
    container.querySelector("[data-index='" + index + "']")?.classList.remove('class', classname);
  };

  // All State Change CallBacks
  const scrollUp = useCallback(() => {
    if (yIndex > 0) setYIndex(state => state - scrollingSpeed);
  }, [scrollingSpeed, yIndex]);

  const scrollDown = useCallback(() => {
    if (yIndex < Math.floor(hexes.length / xSize) - ySize) setYIndex(state => state + scrollingSpeed);
  }, [hexes.length, scrollingSpeed, xSize, yIndex, ySize]);

  const keyPress = useCallback(
    (event: { key: string }) => {
      if (event.key === 'ArrowDown') scrollDown();
      else if (event.key === 'ArrowUp') scrollUp();
    },
    [scrollDown, scrollUp]
  );

  // All Event Handlers
  const handleXSizeChange = event => {
    parseInt(event.target.value) > 0 && setXSize(parseInt(event.target.value));
  };

  const handleBaseChange = event => {
    parseInt(event.target.value) > 1 && setBase(parseInt(event.target.value));
  };

  const handleWheel = event => {
    event.deltaY && event.deltaY > 0 ? scrollDown() : scrollUp();
  };

  const handleSliderScroll = (event, newValue) => {
    setYIndex(yMax - newValue);
  };

  const handleResize = () => {
    let viewportOffset = document.getElementById('hex-content').getBoundingClientRect();
    let newYSize = Math.floor(Math.abs(window.innerHeight - viewportOffset.top) / 23);
    newYSize > 5 ? setYSize(newYSize - 3) : setYSize(3);
  };

  const handleHoverEnter = (index: number) => {
    if (cursorIndex !== index) {
      addClassItem(textContainer, index, classes.itemHover);
      addClassItem(hexContainer, index, classes.itemHover);
    }

    if (isMouseDown) {
      if (isHighlighting) {
        addClassItem(textContainer, mouseDownIndex, classes.itemHighlighted);
        addClassItem(hexContainer, mouseDownIndex, classes.itemHighlighted);
        if (index > mouseUpIndex && mouseUpIndex < mouseDownIndex && index > mouseDownIndex) {
          for (let i = mouseUpIndex; i < mouseDownIndex; i++) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
          for (let i = index; i > mouseDownIndex; i--) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex > mouseDownIndex && index < mouseDownIndex) {
          for (let i = mouseUpIndex; i > mouseDownIndex; i--) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
          for (let i = index; i < mouseDownIndex; i++) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index > mouseUpIndex && mouseUpIndex >= mouseDownIndex) {
          for (let i = index; i > mouseUpIndex; i--) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex > mouseDownIndex) {
          for (let i = mouseUpIndex; i > index; i--) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex <= mouseDownIndex) {
          for (let i = index; i < mouseUpIndex; i++) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index > mouseUpIndex && mouseUpIndex < mouseDownIndex) {
          for (let i = mouseUpIndex; i < index; i++) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        }
      } else {
        removeClassItem(textContainer, mouseDownIndex, classes.itemHighlighted);
        removeClassItem(hexContainer, mouseDownIndex, classes.itemHighlighted);
        if (index > mouseUpIndex && mouseUpIndex < mouseDownIndex && index > mouseDownIndex) {
          for (let i = mouseUpIndex; i < mouseDownIndex; i++) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
          for (let i = index; i > mouseDownIndex; i--) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex > mouseDownIndex && index < mouseDownIndex) {
          for (let i = mouseUpIndex; i > mouseDownIndex; i--) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
          for (let i = index; i < mouseDownIndex; i++) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index > mouseUpIndex && mouseUpIndex >= mouseDownIndex) {
          for (let i = index; i > mouseUpIndex; i--) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex > mouseDownIndex) {
          for (let i = mouseUpIndex; i > index; i--) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index < mouseUpIndex && mouseUpIndex <= mouseDownIndex) {
          for (let i = index; i < mouseUpIndex; i++) {
            removeClassItem(textContainer, i, classes.itemHighlighted);
            removeClassItem(hexContainer, i, classes.itemHighlighted);
          }
        } else if (index > mouseUpIndex && mouseUpIndex < mouseDownIndex) {
          for (let i = mouseUpIndex; i < index; i++) {
            addClassItem(textContainer, i, classes.itemHighlighted);
            addClassItem(hexContainer, i, classes.itemHighlighted);
          }
        }
      }
      mouseUpIndex = index;
    }
  };

  const handleHoverLeave = (index: number) => {
    removeClassItem(textContainer, index, classes.itemHover);
    removeClassItem(hexContainer, index, classes.itemHover);
  };

  const handleCursorDown = (event: any, container: HTMLElement, index: number) => {
    event.preventDefault();
    mouseDownIndex = index;
    mouseUpIndex = index;
    mouseUpIndex = index;
    isMouseDown = true;
    isHighlighting = !container
      .querySelector("[data-index='" + index + "']")
      ?.classList.contains(classes.itemHighlighted);

    console.log(isHighlighting);
  };

  const handleCursorUp = (event: any, container: HTMLElement, index: number) => {
    event.preventDefault();
    isMouseDown = false;
    if (index === mouseDownIndex) {
      removeClassItem(textContainer, cursorIndex, classes.itemCursor);
      removeClassItem(hexContainer, cursorIndex, classes.itemCursor);
      addClassItem(textContainer, index, classes.itemCursor);
      addClassItem(hexContainer, index, classes.itemCursor);
      cursorIndex = index;
    } else {
      isMouseDown = false;
      let min = Math.min(index, mouseDownIndex);
      let max = Math.max(index, mouseDownIndex);
      selectIndexes.push({ start: min, end: max });
      console.log(selectIndexes);
    }
  };

  // All UseEffects
  useEffect(() => {
    document.addEventListener('keydown', keyPress);
    return () => {
      document.removeEventListener('keydown', keyPress);
    };
  }, [keyPress, ySize]);

  useEffect(() => {
    handleResize();
    setYMax(Math.floor(hexes.length / xSize) - ySize);
    return () => {
      setYMax(0);
    };
  }, [hexes, xSize, ySize]);

  useEffect(() => {
    if (data) {
      setHexes(
        data
          .split('\n')
          .map(el => el.slice(11, 58))
          .join(' ')
          .split(/[ ]+/)
      );
    }
    return () => {
      setHexes([]);
    };
  }, [data]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.addEventListener('resize', handleResize);
    };
  }, []);

  // console.log(hexes);
  // console.log(ySize);
  // console.log(yIndex);
  // console.log(hexes.length);

  return data ? (
    <div className={clsx(classes.main)}>
      <div className={clsx(classes.searchbar)}>
        <TextField
          label="Line Size"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          value={xSize}
          onChange={handleXSizeChange}
          size={'small'}
        />
        <TextField
          label="Base Size"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          value={base}
          onChange={handleBaseChange}
          size={'small'}
        />
      </div>
      <div
        id="hex-content"
        className={clsx(classes.content)}
        onWheel={handleWheel}
        style={{ height: `${ySize * 23}px` }}
      >
        <div id="offsets-container" className={clsx(classes.offsetContainer)}>
          {Array.from(Array(ySize).keys()).map(index => {
            return (
              <span key={'offset-' + index} className={clsx(classes.item)}>
                {((index + yIndex) * xSize).toString(base).toUpperCase().padStart(8, '0') + '\n'}
              </span>
            );
          })}
        </div>
        <div id="hexes-container" className={clsx(classes.container)}>
          {hexes.slice(yIndex * xSize, (yIndex + ySize) * xSize).map((hex, i) => {
            const index = yIndex * xSize + i;
            return (
              <span
                key={'hex-' + index}
                data-index={index}
                className={clsx(
                  classes.item,
                  classes.itemHex,
                  classes.itemHovering,
                  getColorClass(hex),
                  getBorderClass(index),
                  getCursorClass(index)
                )}
                onMouseEnter={() => handleHoverEnter(index)}
                onMouseLeave={() => handleHoverLeave(index)}
                onMouseDown={event => handleCursorDown(event, textContainer, index)}
                onMouseUp={event => handleCursorUp(event, textContainer, index)}

                // onMouseEnter={() => addHoverClass(textContainer, index)}
                // onMouseLeave={() => removeHoverClass(textContainer, index)}
                // onClick={event => addSelectClass(event, textContainer, index)}
                // onMouseUp={event => console.log(event)}
                // onMouseDown={event => addSelectClass(event, textContainer, index)}
                // onDoubleClick={event => console.log(event)}
                // onMouseMove={event => console.log(event)}
                // onMouseOver={event => console.log(event)}
                // onMouseOut={event => console.log(event)}
              >
                {hex.toUpperCase()}
                {(index + 1) % xSize === 0 && '\n'}
              </span>
            );
          })}
        </div>
        <div id="texts-container" className={clsx(classes.container)}>
          {hexes.slice(yIndex * xSize, (yIndex + ySize) * xSize).map((hex, i) => {
            const index = yIndex * xSize + i;
            return (
              <span
                key={'text-' + index}
                data-index={index}
                className={clsx(classes.item, classes.itemHovering, getCursorClass(index))}
                onMouseEnter={() => handleHoverEnter(index)}
                onMouseLeave={() => handleHoverLeave(index)}
                onClick={event => handleCursorDown(event, textContainer, index)}
                onMouseDown={event => handleCursorUp(event, textContainer, index)}
              >
                {getHexString(hex)}
                {(index + 1) % xSize === 0 && '\n'}
              </span>
            );
          })}
        </div>
        <div id="scrollbar-container" className={clsx(classes.scrollbar)}>
          <div className={clsx(classes.scrollbarBox, classes.scrollbarUp)}>
            <Button className={clsx(classes.scrollbarButton)} onClick={scrollUp} size={'small'} disabled={yIndex === 0}>
              <ArrowDropUpIcon />
            </Button>
          </div>
          <Slider
            value={yMax - yIndex}
            onChange={handleSliderScroll}
            orientation={'vertical'}
            track={false}
            min={0}
            step={1}
            max={yMax}
          />
          <div className={clsx(classes.scrollbarBox, classes.scrollbarDown)}>
            <Button
              className={clsx(classes.scrollbarButton)}
              onClick={scrollDown}
              size={'small'}
              disabled={yIndex === yMax}
            >
              <ArrowDropDownIcon />
            </Button>
          </div>
        </div>
      </div>
      {/* <HexEditor2
        columns={0x10}
        data={testdata}
        nonce={nonce}
        onSetValue={handleSetValue}
        theme={{ hexEditor: oneDarkPro }}
      /> */}
    </div>
  ) : null;
});

const TOTAL = 1000;

const useStyles = makeStyles(theme => ({
  main: {
    fontFamily:
      '"Source Code Pro", "HexEd.it Symbols", "Courier New", Consolas, Menlo, "PT Mono", "Liberation Mono", monospace;',
    fontSize: '1rem',
    cursor: 'default',
    height: '80vh',
    overflowY: 'scroll',
    width: '100%',
    minHeight: '75vh',

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'

    // letterSpacing: '1.0',
    // lineHeight: '1.0'
  },
  infiniteScrolling: {
    height: '80vh',
    overflowY: 'hidden'
  },
  container: {
    // flexGrow: 1,
    padding: theme.spacing(1),
    userSelect: 'none'
  },
  line: {
    // paddingTop: theme.spacing(verticalSpacing),
    // paddingBottom: theme.spacing(verticalSpacing)
    // paddingBottom: theme.spacing(1)
    // padding: '0px 0px 0px 0px',
    // margin: '0px 0px 0px 0px'
  },
  item: {
    // display: 'inline-block',
    // whiteSpace: 'nowrap',
    // fontSize: theme.spacing(2.5),
    minWidth: theme.spacing(1),

    letterSpacing: '1.0',
    lineHeight: '1.0',
    fontSize: '1rem',
    paddingTop: '2.25px',
    paddingBottom: '2.5px'
    // lineHeight: 'normal'
    // paddingLeft: theme.spacing(horizontalSpacing),
    // paddingRight: theme.spacing(horizontalSpacing)
    // paddingTop: theme.spacing(verticalSpacing),
    // paddingBottom: theme.spacing(verticalSpacing),
    // lineHeight: theme.spacing(0.25)
    // padding: '1px 5px 1px 4px'
  },
  hexItem: {
    // paddingLeft: theme.spacing(horizontalSpacing),
    // paddingRight: theme.spacing(horizontalSpacing)
    // padding: '5px 5px 5px 4px'
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? grey[700] : grey[300]
    }
  },

  offset: {
    flexGrow: 1
    // padding: '1px 5px 1px 4px'
  },
  offsetItem: {
    fontSize: theme.spacing(2.5)
    // padding: '1px 5px 1px 4px'
  },
  hexContainer: {
    // whiteSpace: 'nowrap',
    flexGrow: 1
    // display: 'flex',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // columnGap: '5px'
    // '&>*': {
    //   padding: '1px 5px 1px 4px',
    //   lineHeight: '20px',
    //   contain: 'strict',
    //   display: 'inline'
    // },
    // '&>:nth-child(8n)': {
    //   paddingInlineEnd: '4px',
    //   borderRight: `1px solid ${grey[500]}`
    // },
    // '&>:nth-child(16n)': {
    //   paddingInlineEnd: '5px',
    //   borderRight: '0'
    // },
    // '&>:nth-child(16n)::after': {
    //   display: 'block',
    //   whiteSpace: 'pre',
    //   margin: '0 -5.3px 0 5px;',
    //   backgroundColor: red[500]
    // }
  },

  border64: { borderRight: `5px solid ${grey[500]}` },
  border32: { borderRight: `4px solid ${grey[500]}` },
  border16: { borderRight: `3px solid ${grey[500]}` },
  border8: { borderRight: `2px solid ${grey[500]}` },
  border4: { borderRight: `1px solid ${grey[500]}` },
  borderNone: { borderRight: `0px` },
  borderItem: {
    borderRight: `1px solid ${grey[500]}`
  },
  endLineItem: {
    '&:after': {
      // display: 'block'
    }
    // display: 'block'
  },
  text: { flexGrow: 1 },
  hoverItem: {
    backgroundColor: theme.palette.type === 'dark' ? grey[700] : grey[300]
  },
  selectItem: {
    backgroundColor: theme.palette.type === 'dark' ? grey[600] : grey[400]
  },
  yellow: {
    color: grey[100]
  },
  grey: {
    color: grey[500]
  }
}));

const WrappedHexEditor = ({ data }: HexEditorProps) => {
  const classes = useStyles();

  const [hexes, setHexes] = useState<Array<any>>([]);
  const [offsetSize, setOffsetSize] = useState<number>(16);
  const [borderSize, setBorderSize] = useState<number>(4);
  const [hoverIndex, setHoverIndex] = useState<number>(null);
  const [selectIndex, setSelectIndex] = useState<number>(null);

  const hexContainer = document.getElementById('hexeditor-hexes');
  const textContainer = document.getElementById('hexeditor-texts');

  const convertHexToString = (hex: string) => {
    switch (hex) {
      case '20':
        return '·';
      case '0a':
        return '·';
      default:
        return Buffer.from(hex, 'hex').toString();
    }
  };

  const getColorClassName = (hex: string) => {
    switch (hex) {
      case '20':
        return classes.grey;
      case '0a':
        return classes.grey;
      default:
        return classes.yellow;
    }
  };

  const getBorderClassName = (value: number) => {
    if ((value % offsetSize) % borderSize === borderSize - 1 && value % offsetSize !== offsetSize - 1)
      return classes.border4;
    else return;

    // if (value == lineSize) return classes.borderNone;
    // else if (value % 64 === 0) return classes.border64;
    // else if (value % 32 === 0) return classes.border32;
    // else if (value % 16 === 0) return classes.border16;
    // else if (value % 8 === 0) return classes.border8;
    // else if (value % 4 === 0) return classes.border4;
    // else return;
  };

  const chunkArray = useCallback((array: Array<any>, size: number): Array<any> => {
    // if (array.length <= size) return [array.concat(Array(size - array.length).fill(''))];
    if (array.length <= size) return [array];
    else return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
  }, []);

  const handleMouseEnter = useCallback((index: number) => {
    // console.log(index);
    setHoverIndex(index);
  }, []);

  const handleMouseLeave = () => {
    setHoverIndex(-1);
  };

  const handleLineSizeChange = event => {
    setOffsetSize(parseInt(event.target.value));
  };

  const handleClick = event => {
    event.preventDefault();
    setSelectIndex(parseInt(event.target.dataset.index));
    return false;
  };

  function debounce(a, b, c) {
    var d, e;
    return function () {
      function h() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (d = null), c || (e = a.apply(f, g));
      }
      var f = this,
        g = arguments;
      return clearTimeout(d), (d = setTimeout(h, b)), c && !d && (e = a.apply(f, g)), e;
    };
  }

  useEffect(() => {
    if (data) {
      setHexes(
        data
          .split('\n')
          .map(el => el.slice(11, 58))
          .join(' ')
          .split(/[ ]+/)
      );
    }
    // data &&
    //   setHexes(() => {
    //     let array = data
    //       .split('\n')
    //       .map(el => el.slice(11, 58))
    //       .join(' ')
    //       .split(/[ ]+/);

    //     // array = chunkArray(array, lineSize);
    //     return array;
    //   });
    return () => {
      setHexes([]);
    };
  }, [chunkArray, data]);

  const [items, setItems] = useState(Array.from({ length: 100 }));

  const fetchMoreData = () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    setTimeout(() => {
      setItems(i => i.concat(Array.from({ length: 20 })));
    }, 1500);
  };

  console.log(hexes.length);
  var lastScrollTop = 0;

  return data ? (
    <>
      <div>
        <TextField
          label="Line Size"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          value={offsetSize}
          onChange={handleLineSizeChange}
        />
      </div>
      <div
        id="scrollableDiv"
        style={{ height: 300, overflow: 'scroll' }}
        onKeyPress={e => {
          console.log(e);
        }}
        onTouchEnd={e => {
          console.log('touchend');
          console.log(e);
        }}
        onWheel={e => {
          console.log('wheel');
          console.log(e);
        }}
        onWheelCapture={e => {
          console.log('wheel capture');
          console.log(e);
        }}
        onScroll={e => {
          // console.log(e);
          var st = window.pageYOffset || document.getElementById('scrollableDiv').scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
          if (st > lastScrollTop) {
            // downscroll code
            console.log('down scroll');
          } else {
            // upscroll code
            console.log('up scroll');
          }
          lastScrollTop = st <= 0 ? 0 : st;
        }}
      >
        {/* <ColumnScroller>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </ColumnScroller>
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMoreData}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {items.map((i, index) => (
            <div key={index} data-index={index}>
              div - #{index}
            </div>
          ))}
        </InfiniteScroll> */}
      </div>

      <div
        className={classes.main}
        onScroll={() => {
          console.log('scrolling');
        }}
      >
        <div className={classes.container}>
          {Array.from(Array(Math.floor(TOTAL / offsetSize)).keys()).map(index => {
            return (
              <span key={'offset-' + index} className={clsx(classes.item)}>
                {(index * offsetSize).toString(16).toUpperCase().padStart(8, '0') + '\n'}
                {/* {console.log('test')} */}
              </span>
            );
          })}
        </div>
        <div
          id="hexeditor-hexes"
          className={classes.container}
          onMouseLeave={() => {
            setHoverIndex(-1);
          }}
        >
          {hexes.slice(0, TOTAL).map((hex, index) => {
            return (
              <HexBody
                key={index}
                index={index}
                hex={hex}
                isHovering={index === hoverIndex}
                onMouseEnter={() => {
                  // console.log(document.querySelectorAll("[data-index='" + index + "']"));
                  // document.querySelectorAll("[data-index='" + index + "']").forEach(node => {
                  //   // node.setAttribute('class', 'makeStyles-hoverItem-93');
                  //   node.setAttribute('class', classes.hoverItem);
                  // });

                  textContainer.querySelector("[data-index='" + index + "']").classList.add('class', classes.hoverItem);
                  // console.log(document.querySelectorAll(`"[data-index='${index}']"`));
                  // setHoverIndex(index);
                }}
                onMouseLeave={() => {
                  textContainer
                    .querySelector("[data-index='" + index + "']")
                    .classList.remove('class', classes.hoverItem);
                }}
              >
                <>
                  {hex.toUpperCase()}
                  {(index + 1) % offsetSize === 0 ? '\n' : ' '}
                </>
              </HexBody>
            );
          })}
        </div>
        {/* <div
          className={classes.container}
          onMouseLeave={() => {
            setHoverIndex(-1);
          }}
        >
          {hexes.slice(0, TOTAL).map((hex, index) => {
            return (
              <span
                key={'hex-' + index}
                className={clsx(
                  classes.item,
                  classes.hexItem,
                  getBorderClassName(index),
                  getColorClassName(hex),
                  // (j % lineSize) + 1 === lineSize && classes.endLineItem,
                  index === hoverIndex && classes.hoverItem,
                  index === selectIndex && classes.selectItem
                )}
                onMouseEnter={() => {
                  handleMouseEnter(index);
                }}
                onClick={handleClick}
              >
                {hex.toUpperCase()}
                {(index + 1) % offsetSize === 0 ? '\n' : ' '}
              </span>
            );
          })}
        </div> */}
        {/* <div className={classes.container}>
          {hexes.slice(0, TOTAL).map((hex, index) => {
            return (
              <>
                <span
                  key={'hex-' + hex}
                  className={clsx(
                    classes.item,
                    classes.hexItem,
                    getBorderClassName(index),
                    getColorClassName(hex),
                    // (j % lineSize) + 1 === lineSize && classes.endLineItem,
                    index === hoverIndex && classes.hoverItem,
                    index === selectIndex && classes.selectItem
                  )}
                  onMouseEnter={() => {
                    setHoverIndex(index);
                  }}
                  onClick={handleClick}
                >
                  {hex.toUpperCase()}
                </span>
                <span key={'space-' + hex} className={clsx(classes.item)}>
                  {(index + 1) % offsetSize === 0 ? '\n' : ' '}
                </span>
              </>
            );
          })}
        </div> */}
        {/* <div className={classes.container}>
          {hexes.map((chunk, i) => {
            return (
              <div key={'hex-chunk-' + i} className={clsx(classes.line)}>
                {chunk.map((hex, j) => {
                  return (
                    <span
                      key={'hex-' + i + '-' + j}
                      className={clsx(
                        classes.item,
                        getBorderClass(j + 1),
                        // (j % lineSize) + 1 === lineSize && classes.endLineItem,
                        i === hoverCoordinate.i && j === hoverCoordinate.j && classes.hoverItem,
                        getColorClass(hex)
                      )}
                      onMouseEnter={() => {
                        handleMouseEnter(i, j);
                      }}
                      onMouseLeave={() => {
                        handleMouseLeave();
                      }}
                    >
                      {hex.toUpperCase() + '\n'}

                    </span>
                  );
                })}
              </div>
            );
          })}
        </div> */}
        <div id="hexeditor-texts" className={classes.container}>
          {hexes.slice(0, TOTAL).map((hex, index) => {
            return (
              <span
                data-index={index}
                key={'text-' + index}
                className={clsx(
                  classes.item,
                  classes.hexItem,
                  index === hoverIndex && classes.hoverItem,
                  index === selectIndex && classes.selectItem
                )}
                // onMouseEnter={() => {
                //   setHoverIndex(index);
                // }}
              >
                {convertHexToString(hex)}
                {(index + 1) % offsetSize === 0 && '\n'}
              </span>
            );
          })}
        </div>
      </div>
    </>
  ) : null;
};

export const HexEditorOld = React.memo(WrappedHexEditor);

type HexProps = {
  children: React.ReactElement;
  hex: string;
  index: number;
  isHovering: boolean;

  // hoverIndex: number;
  // selectIndex: number;

  onMouseEnter: () => void;
  onMouseLeave: () => void;
  // setHoverIndex: (index: number) => void;
  // setSelectIndex: (index: number) => void;
};

const HexBody = React.memo(({ children, index, hex, isHovering, onMouseEnter, onMouseLeave }: HexProps) => {
  const classes = useStyles();
  // const [hovering, setHovering] = useState<boolean>(false);

  const getColorClassName = (h: string) => {
    switch (h) {
      case '20':
        return classes.grey;
      case '0a':
        return classes.grey;
      default:
        return classes.yellow;
    }
  };

  console.log('inside');

  // const handleMouseEnter = () => {
  //   setHovering(true);
  //   setHoverIndex(index);
  // };

  // const handleMouseLeave = () => {
  //   setHovering(false);
  // };

  return (
    <span
      data-index={index}
      className={clsx(
        classes.item,
        classes.hexItem,
        // getBorderClassName(index),
        getColorClassName(hex),
        // (j % lineSize) + 1 === lineSize && classes.endLineItem,
        isHovering && classes.hoverItem
        // index === selectIndex && classes.selectItem
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // onClick={handleClick}
    >
      {children}
    </span>
  );

  // return (
  //   <>
  //     <span
  //       key={'hex-' + index}
  //       className={clsx(
  //         classes.item,
  //         classes.hexItem,
  //         // getBorderClassName(index),
  //         getColorClassName(hex),
  //         // (j % lineSize) + 1 === lineSize && classes.endLineItem,
  //         hovering && classes.hoverItem,
  //         index === selectIndex && classes.selectItem
  //       )}
  //       onMouseEnter={handleMouseEnter}
  //       onMouseLeave={handleMouseLeave}
  //       // onClick={handleClick}
  //     >
  //       {children}
  //       {/* {hex.toUpperCase()}
  //       {(index + 1) % 16 === 0 ? '\n' : ' '} */}
  //     </span>
  //     {/* <span key={'space-' + index} className={clsx(classes.item)}>
  //     {(index + 1) % offsetSize === 0 ? '\n' : ' '}
  //   </span> */}
  //   </>
  // );
});
