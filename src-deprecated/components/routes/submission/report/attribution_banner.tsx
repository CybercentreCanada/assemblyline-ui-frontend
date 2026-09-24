import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { SvgIconProps } from '@mui/material';
import { Box, Grid, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SubmissionReport } from 'components/models/ui/submission_report';
import Verdict from 'components/visual/Verdict';
import VerdictGauge from 'components/visual/VerdictGauge';
import type { FC } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

type IconProps = SvgIconProps & {
  component: FC<SvgIconProps>;
};

const Icon = memo(({ component: Component, ...props }: IconProps) => {
  const theme = useTheme();

  return (
    <Component
      {...props}
      sx={{
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(4.5),
        fontSize: '400%',
        [theme.breakpoints.only('xs')]: {
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2.5),
          fontSize: '350%'
        }
      }}
    />
  );
});

type Props = {
  report: SubmissionReport;
};

export function WrappedAttributionBanner({ report }: Props) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const score = report ? report.max_score : 0;
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const { scoreToVerdict } = useALContext();

  const BANNER_COLOR_MAP = {
    info: {
      icon: <Icon component={HelpOutlineIcon} />,
      bgColor: '#6e6e6e15',
      textColor: theme.palette.mode === 'dark' ? '#AAA' : '#888'
    },
    safe: {
      icon: <Icon component={VerifiedUserOutlinedIcon} />,
      bgColor: '#00f20015',
      textColor: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
    },
    suspicious: {
      icon: <Icon component={MoodBadIcon} />,
      bgColor: '#ff970015',
      textColor: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    highly_suspicious: {
      icon: <Icon component={MoodBadIcon} />,
      bgColor: '#ff970015',
      textColor: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    malicious: {
      icon: <Icon component={BugReportOutlinedIcon} />,
      bgColor: '#f2000015',
      textColor: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
    }
  };

  const { bgColor, icon, textColor } = BANNER_COLOR_MAP[scoreToVerdict(score)];
  const implant =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.implant']
      ? Object.keys(report.tags.attributions['attribution.implant']).join(' | ')
      : null;
  const family =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.family']
      ? Object.keys(report.tags.attributions['attribution.family']).join(' | ')
      : null;
  const actor =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.actor']
      ? Object.keys(report.tags.attributions['attribution.actor']).join(' | ')
      : null;

  return (
    <div
      style={{
        marginBottom: theme.spacing(4),
        marginTop: theme.spacing(4),
        padding: theme.spacing(1),
        backgroundColor: bgColor,
        border: `solid 1px ${textColor}`,
        borderRadius: theme.spacing(1)
      }}
    >
      <Grid container alignItems="center" justifyContent="center">
        <Grid className="no-print" style={{ color: textColor, display: isXS ? 'none' : 'inherit' }}>
          {icon}
        </Grid>
        <Grid className="print-only" style={{ color: textColor }}>
          {icon}
        </Grid>
        <Grid style={{ flexGrow: 10 }}>
          <Box
            sx={{
              fontWeight: 500,
              fontSize: '200%',
              [theme.breakpoints.only('xs')]: {
                fontSize: '180%'
              }
            }}
          >
            {report ? <Verdict type="text" size="medium" score={report.max_score} /> : <Skeleton />}
          </Box>
          <table width={report ? null : '100%'} style={{ borderSpacing: 0 }}>
            <tbody>
              <tr>
                {report ? (
                  implant && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('implant')}: `}
                      </td>
                      <td style={{ fontWeight: 500, marginLeft: theme.spacing(1) }}>
                        {Object.keys(report.tags.attributions['attribution.implant']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
              <tr>
                {report ? (
                  family && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('family')}: `}
                      </td>
                      <td style={{ fontWeight: 500, marginLeft: theme.spacing(1) }}>
                        {Object.keys(report.tags.attributions['attribution.family']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
              <tr>
                {report ? (
                  actor && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('actor')}: `}
                      </td>
                      <td style={{ fontWeight: 500, marginLeft: theme.spacing(1) }}>
                        {Object.keys(report.tags.attributions['attribution.actor']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </Grid>
        <Grid
          style={{ color: textColor, marginLeft: theme.spacing(1), marginRight: theme.spacing(1), minHeight: '100px' }}
        >
          {report ? (
            <VerdictGauge verdicts={report.verdict} autoHide />
          ) : (
            <Skeleton variant="circular" height="100px" width="100px" />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

const AttributionBanner = React.memo(WrappedAttributionBanner);
export default AttributionBanner;
