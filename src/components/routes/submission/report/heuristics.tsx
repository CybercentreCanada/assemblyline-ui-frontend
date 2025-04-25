import { Divider, Skeleton, Typography, useTheme } from '@mui/material';
import type { Verdict } from 'components/models/base/alert';
import type { SubmissionReport } from 'components/models/ui/submission_report';
import ResultSection from 'components/visual/ResultCard/result_section';
import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type HeuristicsListProps = {
  verdict: Verdict;
  items: SubmissionReport['heuristics'][Verdict];
  sections: SubmissionReport['heuristic_sections'];
  name_map: SubmissionReport['heuristic_name_map'];
  force?: boolean;
};

function HeuristicsList({ verdict, items, sections, name_map, force = false }: HeuristicsListProps) {
  const theme = useTheme();

  const classMap = useMemo<Partial<Record<Verdict, CSSProperties>>>(
    () => ({
      malicious: {
        fontWeight: 700,
        padding: theme.spacing(0.625),
        WebkitPrintColorAdjust: 'exact',
        backgroundColor: '#f2000015 !important',
        borderBottom: '1px solid #d9534f !important'
      },
      suspicious: {
        fontWeight: 700,
        padding: theme.spacing(0.625),
        WebkitPrintColorAdjust: 'exact',
        backgroundColor: '#ff970015 !important',
        borderBottom: '1px solid #f0ad4e !important'
      },
      info: {
        fontWeight: 700,
        padding: theme.spacing(0.625),
        WebkitPrintColorAdjust: 'exact',
        backgroundColor: '#6e6e6e15 !important',
        borderBottom: '1px solid #aaa !important'
      },
      safe: {
        fontWeight: 700,
        padding: theme.spacing(0.625),
        WebkitPrintColorAdjust: 'exact',
        backgroundColor: '#00f20015 !important',
        borderBottom: '1px solid #81c784 !important'
      }
    }),
    [theme]
  );

  return (
    <>
      {Object.keys(items).map((heur, idx) => (
        <div
          key={idx}
          style={{
            marginTop: theme.spacing(2),
            pageBreakInside: 'avoid'
          }}
        >
          <div
            style={{
              marginBottom: theme.spacing(2),
              fontSize: '120%',
              ...classMap[verdict]
            }}
          >
            {heur}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap'
            }}
          >
            {name_map[heur] &&
              name_map[heur].map(heur_id => {
                return (
                  sections[heur_id] &&
                  sections[heur_id]
                    .sort((a, b) => (a.title_text >= b.title_text ? 1 : -1))
                    .map((sec, secidx) => {
                      return (
                        <div
                          key={secidx}
                          style={{
                            minWidth: '50%',
                            flexGrow: 1
                          }}
                        >
                          <div style={{ marginRight: theme.spacing(1) }}>
                            <ResultSection section={sec} printable force={force} />
                          </div>
                        </div>
                      );
                    })
                );
              })}
          </div>
        </div>
      ))}
    </>
  );
}

function HeuristicsListSkel() {
  return (
    <div
      style={{
        flexGrow: 1,
        margin: 5
      }}
    >
      <Skeleton style={{ height: '3.5rem' }} />

      <Skeleton style={{ height: '2rem' }} />
      <Skeleton style={{ height: '2rem' }} />
      <Skeleton style={{ height: '2rem' }} />
    </div>
  );
}

type Props = {
  report: SubmissionReport;
};

function WrappedHeuristics({ report }: Props) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();

  return (
    (!report ||
      Object.keys(report.heuristics.malicious).length !== 0 ||
      Object.keys(report.heuristics.suspicious).length !== 0 ||
      Object.keys(report.heuristics.info).length !== 0 ||
      (report.max_score < 0 && report.heuristics.safe && Object.keys(report.heuristics.safe).length !== 0)) && (
      <>
        <div style={{ marginTop: theme.spacing(4), pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}>
          <Typography variant="h6">{t('heuristics')}</Typography>
          <Divider
            sx={{
              '@media print': {
                backgroundColor: '#0000001f !important'
              }
            }}
          />
        </div>
        {report ? (
          <>
            {report.max_score < 0 && report.heuristics.safe && Object.keys(report.heuristics.safe).length !== 0 && (
              <HeuristicsList
                verdict="safe"
                items={report.heuristics.safe}
                sections={report.heuristic_sections}
                name_map={report.heuristic_name_map}
                force
              />
            )}
            {Object.keys(report.heuristics.malicious).length !== 0 && (
              <HeuristicsList
                verdict="malicious"
                items={report.heuristics.malicious}
                sections={report.heuristic_sections}
                name_map={report.heuristic_name_map}
              />
            )}
            {Object.keys(report.heuristics.suspicious).length !== 0 && (
              <HeuristicsList
                verdict="suspicious"
                items={report.heuristics.suspicious}
                sections={report.heuristic_sections}
                name_map={report.heuristic_name_map}
              />
            )}
            {Object.keys(report.heuristics.info).length !== 0 && (
              <HeuristicsList
                verdict="info"
                items={report.heuristics.info}
                sections={report.heuristic_sections}
                name_map={report.heuristic_name_map}
              />
            )}
          </>
        ) : (
          [...Array(3)].map((_, i) => <HeuristicsListSkel key={i} />)
        )}
      </>
    )
  );
}

const Heuristics = React.memo(WrappedHeuristics);
export default Heuristics;
