import { Skeleton, useTheme } from '@mui/material';
import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';
import React from 'react';

type ArcGaugeProps = {
  pctValue: number;
  caption?: string;
  colorBack?: string;
  fontSize?: string;
  initialized?: boolean;
  title?: string;
  width?: string;
};

const ArcGauge: React.FC<ArcGaugeProps> = ({
  pctValue,
  caption = '',
  colorBack = '#68686815',
  fontSize = '22px',
  initialized = false,
  title = '',
  width = '100px'
}) => {
  const theme = useTheme();
  const colorFilled = theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark;

  const backgroundArc = arc()
    .innerRadius(0.7)
    .outerRadius(0.95)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2)
    .cornerRadius(0)();
  const percentScale = scaleLinear().domain([0, 100]).range([0, 1]);

  const angleScale = scaleLinear()
    .domain([0, 1])
    .range([-Math.PI / 2, Math.PI / 2])
    .clamp(true);
  const filledArc = arc()
    .innerRadius(0.7)
    .outerRadius(0.95)
    .startAngle(-Math.PI / 2)
    .endAngle(angleScale(percentScale(pctValue)))
    .cornerRadius(0)();

  return (
    <div>
      {title && (
        <div
          style={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            textAlign: 'center',
            width: '100%'
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplate: '1fr / 1fr',
          placeItems: 'end',
          fontSize,
          lineHeight: fontSize,
          width
        }}
      >
        {initialized ? (
          <span
            style={{
              color: theme.palette.text.secondary,
              fontWeight: 900,
              gridColumn: '1 / 1',
              gridRow: '1 / 1',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {`${Number(pctValue).toFixed(0)}%`}
          </span>
        ) : (
          <span
            style={{
              color: theme.palette.text.secondary,
              fontWeight: 900,
              gridColumn: '1 / 1',
              gridRow: '1 / 1',
              textAlign: 'center',
              width: '100%'
            }}
          >
            <Skeleton variant="rectangular" width="2rem" style={{ borderRadius: '4px', display: 'inline-block' }} />
          </span>
        )}
        <svg
          viewBox={[-1, -1, 2, 1].join(' ')}
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1'
          }}
        >
          <g>
            <path d={backgroundArc} fill={colorBack} />
            <path d={filledArc} fill={colorFilled} />
          </g>
        </svg>
      </div>
      {caption && (
        <div
          style={{
            color: theme.palette.text.secondary,
            fontSize: 'x-small',
            fontWeight: 500,
            textAlign: 'center',
            width: '100%'
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

export default ArcGauge;
