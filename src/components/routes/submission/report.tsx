import AssistantIcon from '@mui/icons-material/Assistant';
import AssistantOutlinedIcon from '@mui/icons-material/AssistantOutlined';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import { filterObject } from 'helpers/utils';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';
import AISummarySection from './detail/ai_summary';
import Attack from './report/attack';
import AttributionBanner from './report/attribution_banner';
import FileTreeSection from './report/file_tree';
import GeneralInformation from './report/general_info';
import Heuristics from './report/heuristics';
import Metadata from './report/metadata';
import Tags from './report/tags';

type ParamProps = {
  id: string;
};

const NoPrintTooltip = withStyles(() => ({
  tooltip: {
    '@media print': {
      display: 'none !important'
    }
  }
}))(Tooltip);

const useStyles = makeStyles(theme => ({
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  page: {
    '@media print': {
      fontSize: '90%'
    },
    textAlign: 'left'
  }
}));

export default function SubmissionReport() {
  const { t } = useTranslation(['submissionReport']);
  const { id } = useParams<ParamProps>();
  const { c12nDef, configuration } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showErrorMessage, showWarningMessage } = useMySnackbar();
  const classes = useStyles();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const [originalReport, setOriginalReport] = useState(null);
  const [showInfoContent, setShowInfoContent] = useState(false);
  const [useAIReport, setUseAIReport] = useState(false);
  const { addInsight, removeInsight } = useAssistant();

  const cleanupReport = useCallback(() => {
    const recursiveFileTreeCleanup = (tree, impFiles) => {
      for (const key of Object.keys(tree)) {
        const data = tree[key];
        // Cleanup children
        recursiveFileTreeCleanup(data.children, impFiles);

        // Check if current key needs cleaning
        if (
          data.score < configuration.submission.verdicts.suspicious &&
          data.score >= configuration.submission.verdicts.info &&
          Object.keys(data.children).length === 0
        ) {
          const idx = impFiles.indexOf(key);
          if (idx !== -1) {
            impFiles.splice(idx, 1);
          }
        }
      }

      return impFiles;
    };

    if (originalReport && !showInfoContent) {
      // Cleanup attack matrix
      const tempMatrix = { ...originalReport.attack_matrix };
      for (const cat in tempMatrix) {
        tempMatrix[cat] = filterObject(tempMatrix[cat], value => value.h_type !== 'info');
        if (Object.keys(tempMatrix[cat]).length === 0) {
          delete tempMatrix[cat];
        }
      }

      // Cleanup heuristics
      const tempHeur = { ...originalReport.heuristics, info: {} };
      const tempHeurSec = { ...originalReport.heuristic_sections };
      for (const key in tempHeurSec) {
        tempHeurSec[key] = [
          ...tempHeurSec[key].filter(
            heur =>
              heur.heuristic.score >= configuration.submission.verdicts.suspicious ||
              heur.heuristic.score < configuration.submission.verdicts.info
          )
        ];
      }

      // Cleanup important files
      const tempImpFiles = recursiveFileTreeCleanup(originalReport.file_tree, [...originalReport.important_files]);

      // Cleanup tags
      const tempTags = { ...originalReport.tags };
      for (const cat in tempTags) {
        for (const type in tempTags[cat]) {
          tempTags[cat][type] = filterObject(tempTags[cat][type], value => value.h_type !== 'info');
          if (Object.keys(tempTags[cat][type]).length === 0) {
            delete tempTags[cat][type];
          }
        }
        if (Object.keys(tempTags[cat]).length === 0) {
          delete tempTags[cat];
        }
      }

      setReport({
        ...originalReport,
        attack_matrix: tempMatrix,
        heuristics: tempHeur,
        heuristic_sections: tempHeurSec,
        important_files: tempImpFiles,
        tags: tempTags
      });
    } else {
      setReport(originalReport);
    }
  }, [originalReport, showInfoContent, configuration]);

  useEffectOnce(() => {
    if (currentUser.roles.includes('submission_view')) {
      apiCall({
        url: `/api/v4/submission/report/${id}/`,
        onSuccess: api_data => {
          setOriginalReport(api_data.api_response);
        },
        onFailure: api_data => {
          if (api_data.api_status_code === 425) {
            showWarningMessage(t('error.too_early'));
            navigate(`/submission/detail/${id}`);
          } else if (api_data.api_status_code === 404) {
            showErrorMessage(t('error.notfound'));
            navigate('/notfound');
          } else {
            showErrorMessage(api_data.api_error_message);
          }
        }
      });
    }
  });

  useEffect(() => {
    if (originalReport) {
      cleanupReport();
    }
  }, [cleanupReport, originalReport, showInfoContent]);

  useEffect(() => {
    if (useAIReport) {
      setShowInfoContent(false);
    }
  }, [useAIReport]);

  useEffect(() => {
    addInsight({ type: 'report', value: id });

    return () => {
      removeInsight({ type: 'report', value: id });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return currentUser.roles.includes('submission_view') ? (
    <PageCenter margin={4} width="100%">
      <div className={classes.page}>
        {c12nDef.enforce && (
          <div style={{ marginBottom: theme.spacing(4) }}>
            <Classification size="tiny" c12n={report ? report.classification : null} />
          </div>
        )}
        <div style={{ marginBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <div>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {report ? report.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </div>
            </Grid>
            <Grid item xs className="print-only" style={{ textAlign: 'right' }}>
              <img
                src={`${process.env.PUBLIC_URL}/images/banner.svg`}
                alt="Assemblyline Banner"
                style={{ height: theme.spacing(8) }}
              />
            </Grid>
            <Grid item xs={12} sm={3} className="no-print">
              <div style={{ textAlign: 'right' }}>
                {report ? (
                  <>
                    {!useAIReport && (
                      <NoPrintTooltip
                        title={t(showInfoContent ? 'hide_info' : 'show_info')}
                        PopperProps={{ disablePortal: true }}
                      >
                        <IconButton onClick={() => setShowInfoContent(!showInfoContent)} size="large">
                          {showInfoContent ? <InfoIcon /> : <InfoOutlinedIcon />}
                        </IconButton>
                      </NoPrintTooltip>
                    )}
                    {configuration.ui.ai.enabled && (
                      <NoPrintTooltip
                        title={t(useAIReport ? 'use_not_ai' : 'use_ai')}
                        PopperProps={{ disablePortal: true }}
                      >
                        <IconButton onClick={() => setUseAIReport(!useAIReport)} size="large">
                          {useAIReport ? <AssistantIcon /> : <AssistantOutlinedIcon />}
                        </IconButton>
                      </NoPrintTooltip>
                    )}
                    <NoPrintTooltip title={t('print')} PopperProps={{ disablePortal: true }}>
                      <IconButton onClick={() => window.print()} size="large">
                        <PrintOutlinedIcon />
                      </IconButton>
                    </NoPrintTooltip>
                    <Tooltip title={t('detail_view')}>
                      <IconButton component={Link} to={`/submission/detail/${report.sid}`} size="large">
                        <ListAltOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <div style={{ display: 'inline-flex' }}>
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                    {configuration.ui.ai.enabled && (
                      <Skeleton
                        variant="circular"
                        height="2.5rem"
                        width="2.5rem"
                        style={{ margin: theme.spacing(0.5) }}
                      />
                    )}
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
        </div>

        <AttributionBanner report={report} />
        <GeneralInformation report={report} />
        {report && report.report_filtered && (
          <div className={classes.section_title}>
            <Typography variant="subtitle1">
              <b>**{t('warning')}</b>: {t('warning.text')}
            </Typography>
          </div>
        )}
        {report && report.report_partial && (
          <div className={classes.section_title}>
            <Typography variant="subtitle1">
              <b>**{t('warning')}</b>: {t('warning.partial')}
            </Typography>
          </div>
        )}
        <Metadata report={report} />
        {useAIReport && (
          <AISummarySection type={'submission' as 'submission'} id={report ? report.sid : null} noTitle detailed />
        )}
        {!useAIReport && <Heuristics report={report} />}
        {!useAIReport && <Attack report={report} />}
        <Tags report={report} />
        <FileTreeSection report={report} />
      </div>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}
