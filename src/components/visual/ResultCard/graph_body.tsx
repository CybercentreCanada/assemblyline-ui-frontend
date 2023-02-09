import { useTheme } from '@mui/material';
import { scaleLinear } from 'd3-scale';
import { default as React } from 'react';

const WrappedGraphBody = ({ body }) => {
  const theme = useTheme();
  if (body.type === 'colormap') {
    const colorRange = ['#87c6fb', '#111920'];
    const itemWidthPct = 100 / body.data.values.length;
    const colorScale = scaleLinear().domain(body.data.domain).range(colorRange);
    return (
      <svg width="100%" height="70">
        <rect y={10} x={0} width={15} height={15} fill={colorRange[0]} />
        <text y={22} x={20} fill={theme.palette.text.primary}>{`: ${body.data.domain[0]}`}</text>
        <rect y={10} x={80} width={15} height={15} fill={colorRange[1]} />
        <text y={22} x={100} fill={theme.palette.text.primary}>{`: ${body.data.domain[1]}`}</text>
        {body.data.values.map((value, i) => (
          <rect
            key={i}
            y={30}
            x={`${i * itemWidthPct}%`}
            width={`${itemWidthPct}%`}
            height={40}
            stroke={colorScale(value)}
            fill={colorScale(value)}
          />
        ))}
      </svg>
    );
  }
  return <div style={{ margin: '2rem' }}>Unsupported graph...</div>;
};

export const GraphBody = React.memo(WrappedGraphBody);
