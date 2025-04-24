import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Button, Slider, useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { useDispatch } from 'components/visual/HexViewer';
import { default as React } from 'react';

export const WrappedHexScrollBar = ({ store }: StoreProps) => {
  const theme = useTheme();

  const { onScrollButtonClick, onScrollSliderChange } = useDispatch();

  const {
    scroll: { rowIndex, speed, maxRowIndex }
  } = store;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'grid',
          height: '42px',
          minHeight: '42px',
          placeSelf: 'center',
          placeItems: 'start'
        }}
      >
        <Button
          onClick={() => onScrollButtonClick({ value: -1 })}
          size="small"
          disabled={rowIndex === 0}
          sx={{
            color: theme.palette.primary.main,
            cursor: 'pointer',
            minWidth: '28px',
            minHeight: '28px',
            fontSize: '0.8125rem',
            padding: 0
          }}
        >
          <ArrowDropUpIcon />
        </Button>
      </div>
      <Slider
        value={maxRowIndex - rowIndex}
        orientation="vertical"
        track={false}
        min={0}
        step={speed}
        max={maxRowIndex}
        onChange={(event, newValue) => onScrollSliderChange({ event, newValue })}
      />
      <div
        style={{
          display: 'grid',
          height: '42px',
          minHeight: '42px',
          placeSelf: 'center',
          placeItems: 'end'
        }}
      >
        <Button
          onClick={() => onScrollButtonClick({ value: 1 })}
          size="small"
          disabled={rowIndex === maxRowIndex}
          sx={{
            color: theme.palette.primary.main,
            cursor: 'pointer',
            minWidth: '28px',
            minHeight: '28px',
            fontSize: '0.8125rem',
            padding: 0
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </div>
    </div>
  );
};
export const HexScrollBar = React.memo(
  WrappedHexScrollBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.loading.status === nextProps.store.loading.status &&
    prevProps.store.scroll.rowIndex === nextProps.store.scroll.rowIndex &&
    prevProps.store.scroll.speed === nextProps.store.scroll.speed &&
    prevProps.store.scroll.maxRowIndex === nextProps.store.scroll.maxRowIndex &&
    prevProps.store.layout.row.size === nextProps.store.layout.row.size &&
    prevProps.store.mode.body === nextProps.store.mode.body &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width
);
export default HexScrollBar;
