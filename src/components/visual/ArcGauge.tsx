import { makeStyles, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';
import React from 'react';

const useStyles = makeStyles(theme => ({
  caption: {
    color: theme.palette.text.secondary,
    fontSize: 'x-small',
    fontWeight: 500,
    textAlign: 'center',
    width: '100%'
  },
  graph: {
    gridColumn: '1 / 1',
    gridRow: '1 / 1'
  },
  outer: {
    display: 'grid',
    gridTemplate: '1fr / 1fr',
    placeItems: 'end'
  },
  text: {
    color: theme.palette.text.secondary,
    fontWeight: 900,
    gridColumn: '1 / 1',
    gridRow: '1 / 1',
    textAlign: 'center',
    width: '100%'
  },
  title: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textAlign: 'center',
    width: '100%'
  }
}));

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
  const classes = useStyles();
  const theme = useTheme();
  const colorFilled = theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark;

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
      {title && <div className={classes.title}>{title}</div>}
      <div className={classes.outer} style={{ fontSize, lineHeight: fontSize, width }}>
        {initialized ? (
          <span className={classes.text}>{`${Number(pctValue).toFixed(0)}%`}</span>
        ) : (
          <span className={classes.text}>
            <Skeleton variant="rect" width="2rem" style={{ borderRadius: '4px', display: 'inline-block' }} />
          </span>
        )}
        <svg className={classes.graph} viewBox={[-1, -1, 2, 1].join(' ')}>
          <g>
            <path d={backgroundArc} fill={colorBack} />
            <path d={filledArc} fill={colorFilled} />
          </g>
        </svg>
      </div>
      {caption && <div className={classes.caption}>{caption}</div>}
    </div>
  );
};

export default ArcGauge;
