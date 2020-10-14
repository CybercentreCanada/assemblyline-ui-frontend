import { Tooltip, useTheme } from '@material-ui/core';
import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const theme = useTheme();
  const colorMalicious = theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark;
  const colorNonMalicious = theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark;
  const colorNeutral = theme.palette.text.secondary;

  const backgroundArc = arc()
    .innerRadius(0.7)
    .outerRadius(1)
    .startAngle((-Math.PI / 4) * 3)
    .endAngle((Math.PI / 4) * 3)
    .cornerRadius(0)();
  const percentScale = scaleLinear().domain([0, max]).range([0, 1]);

  const angleScaleRight = scaleLinear()
    .domain([0, 1])
    .range([0, (Math.PI / 4) * 3])
    .clamp(true);
  const filledArcRight = arc()
    .innerRadius(0.7)
    .outerRadius(1)
    .startAngle(0)
    .endAngle(angleScaleRight(percentScale(verdicts.malicious.length)))
    .cornerRadius(0)();

  const angleScaleLeft = scaleLinear()
    .domain([0, 1])
    .range([0, (-Math.PI / 4) * 3])
    .clamp(true);
  const filledArcLeft = arc()
    .innerRadius(0.7)
    .outerRadius(1)
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
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              top: '-90px',
              left: '15px',
              borderRadius: '50%',
              width: '70px',
              height: '70px',
              boxShadow: theme.shadows[2],
              backgroundColor: theme.palette.background.paper,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '30px',
                lineHeight: '30px',
                paddingTop: '20px',
                fontWeight: 900,
                color:
                  verdicts.non_malicious.length > verdicts.malicious.length
                    ? colorNonMalicious
                    : verdicts.malicious.length > verdicts.non_malicious.length
                    ? colorMalicious
                    : colorNeutral
              }}
            >
              {verdicts.non_malicious.length > verdicts.malicious.length
                ? verdicts.non_malicious.length - verdicts.malicious.length
                : verdicts.malicious.length - verdicts.non_malicious.length}
            </div>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default VerdictGauge;
