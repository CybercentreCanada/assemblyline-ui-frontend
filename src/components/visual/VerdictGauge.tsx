import { Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  circle: {
    position: 'relative',
    zIndex: 1,
    top: '-90px',
    left: '15px',
    borderRadius: '50%',
    width: '70px',
    height: '70px',
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
    textAlign: 'center',
    '@media print': {
      backgroundColor: '#FFFFFF'
    }
  },
  text: {
    fontSize: '30px',
    lineHeight: '30px',
    paddingTop: '15px',
    fontWeight: 900,
    color: theme.palette.text.secondary,
    '@media print': {
      color: '#00000066'
    }
  },
  under_text: {
    fontSize: '13px',
    lineHeight: '13px',
    fontWeight: 300,
    color: theme.palette.text.secondary,
    '@media print': {
      color: '#00000066'
    }
  }
}));

type VerdictGaugeProps = {
  verdicts: {
    malicious: any[];
    non_malicious: any[];
  };
  max?: number;
  colorBack?: string;
};

const VerdictGauge: React.FC<VerdictGaugeProps> = ({ verdicts, max = 20, colorBack = '#68686815' }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const colorMalicious = theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark;
  const colorNonMalicious = theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark;

  const backgroundArc = arc()
    .innerRadius(0.7)
    .outerRadius(0.95)
    .startAngle(-Math.PI)
    .endAngle(Math.PI)
    .cornerRadius(0)();
  const percentScale = scaleLinear().domain([0, max]).range([0, 1]);

  const angleScaleRight = scaleLinear().domain([0, 1]).range([0, Math.PI]).clamp(true);
  const filledArcRight = arc()
    .innerRadius(0.7)
    .outerRadius(0.95)
    .startAngle(0)
    .endAngle(angleScaleRight(percentScale(verdicts.malicious.length)))
    .cornerRadius(0)();

  const angleScaleLeft = scaleLinear().domain([0, 1]).range([0, -Math.PI]).clamp(true);
  const filledArcLeft = arc()
    .innerRadius(0.7)
    .outerRadius(0.95)
    .startAngle(angleScaleLeft(percentScale(verdicts.non_malicious.length)))
    .endAngle(0)
    .cornerRadius(0)();

  return (
    <div>
      <Tooltip
        title={`${t('verdict.non_malicious')}: ${verdicts.non_malicious.length} / ${t('verdict.malicious')}: ${
          verdicts.malicious.length
        }`}
      >
        <div style={{ width: '100px', height: '100px', display: 'block' }}>
          <svg style={{ position: 'relative', width: '100px', height: '100px' }} viewBox={[-1, -1, 2, 1].join(' ')}>
            <g style={{ transform: 'translateY(-50%)' }}>
              <path d={backgroundArc} fill={colorBack} />
              <path d={filledArcLeft} fill={colorNonMalicious} />
              <path d={filledArcRight} fill={colorMalicious} />
            </g>
          </svg>
          <div className={classes.circle}>
            <div
              className={classes.text}
              style={{
                color:
                  verdicts.non_malicious.length > verdicts.malicious.length
                    ? colorNonMalicious
                    : verdicts.malicious.length > verdicts.non_malicious.length
                    ? colorMalicious
                    : null
              }}
            >
              {verdicts.non_malicious.length > verdicts.malicious.length
                ? verdicts.non_malicious.length
                : verdicts.malicious.length}
            </div>
            <div className={classes.under_text}>{`/ ${verdicts.non_malicious.length + verdicts.malicious.length}`}</div>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default VerdictGauge;
