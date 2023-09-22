import { Theme, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { scaleLinear } from 'd3-scale';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  svgItem: {
    borderRadius: theme.spacing(0.625),
    boxShadow: theme.shadows[2],
    marginRight: theme.spacing(1.5)
  }
}));

const WrappedGraphBody = ({ body }) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState(null);

  const classes = useStyles();
  if (body.type === 'colormap') {
    const colorRange = ['#87c6fb', '#111920'];
    const itemWidthPct = 100 / body.data.values.length;
    const colorScale = scaleLinear().domain(body.data.domain).range(colorRange);
    return (
      <>
        <svg width="100%" height="40" className={classes.svgItem}>
          {body.data.values.map((value, i) => (
            <rect
              key={i}
              x={`${i * itemWidthPct}%`}
              width={`${itemWidthPct}%`}
              height={40}
              stroke={colorScale(value)}
              fill={colorScale(value)}
              onMouseOver={() => setCurrentValue(value)}
              onMouseOut={() => setCurrentValue(null)}
            />
          ))}
        </svg>
        <div style={{ display: 'flex' }}>
          <svg width="30" height="15" className={classes.svgItem}>
            <rect x={0} width="100%" height="100%" fill={colorRange[0]} />
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill={theme.palette.getContrastText(colorRange[0])}
              fontWeight={500}
            >
              {body.data.domain[0]}
            </text>
          </svg>
          <svg width="30" height="15" className={classes.svgItem}>
            <rect x={0} width="100%" height="100%" fill={colorRange[1]} />
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill={theme.palette.getContrastText(colorRange[1])}
            >
              {body.data.domain[1]}
            </text>
          </svg>
          <span style={{ flex: 1, height: '15px', textAlign: 'right' }}>
            {currentValue !== null ? currentValue.toFixed(2) : null}
          </span>
        </div>
      </>
    );
  }
  return <div style={{ margin: '2rem' }}>Unsupported graph...</div>;
};

export const GraphBody = React.memo(WrappedGraphBody);
