import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WrongLocationOutlinedIcon from '@mui/icons-material/WrongLocationOutlined';
import { Button, Collapse, Paper, styled, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { getNotFoundDetails, getNotFoundPreviewHref } from 'core/router';
import { useAppSearchParams } from 'core/routes';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/pages/PageCenter';

const ExpandMore = styled(SvgIcon, {
  shouldForwardProp: prop => prop !== 'expand'
})<{ expand: boolean }>(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}));

ExpandMore.displayName = 'ExpandMore';

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************

export const NotFoundPage = memo(() => {
  const { t } = useTranslation(['error404']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);

  const search = useAppSearchParams<'/not-found'>();

  const handleDetailsToggle = useCallback(() => {
    setDetailsExpanded(e => !e);
  }, []);

  const diagnostics = useMemo<Record<string, unknown> | null>(() => {
    const values: unknown = search?.values;
    if (!values || typeof values !== 'object') return null;

    return values as Record<string, unknown>;
  }, [search]);

  const previewHref = useMemo(() => getNotFoundPreviewHref(diagnostics), [diagnostics]);

  const details = useMemo(
    () =>
      getNotFoundDetails(
        diagnostics,
        {
          attemptedHref: t('diagnostics.attemptedHref'),
          operation: t('diagnostics.operation'),
          originPageKey: t('diagnostics.originPageKey'),
          pageAge: t('diagnostics.page.age'),
          pageDigest: t('diagnostics.page.digest'),
          pageHref: t('diagnostics.page.href'),
          pageKey: t('diagnostics.pageKey'),
          pageScroll: t('diagnostics.page.scroll'),
          pageState: t('diagnostics.page.state'),
          pageTransient: t('diagnostics.page.transient'),
          panelKey: t('diagnostics.panelKey'),
          targetPanelKey: t('diagnostics.targetPanelKey')
        },
        t('values.unserializable')
      ),
    [diagnostics, t]
  );

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <WrongLocationOutlinedIcon fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography children={t('description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
      </div>

      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: theme.spacing(3),
          padding: theme.spacing(2)
        }}
      >
        {!diagnostics ? (
          <Typography children={t('values.none')} variant="body1" />
        ) : (
          <>
            <div style={{ marginBottom: theme.spacing(1) }}>
              <Typography
                data-testid="not-found-navigation-request"
                children={previewHref || t('values.none')}
                variant="body1"
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              />
            </div>

            <Button onClick={handleDetailsToggle} sx={{ color: theme.palette.primary.main, paddingLeft: 0 }}>
              {detailsExpanded ? t('raw.hide') : t('raw.title')}
              <ExpandMore expand={detailsExpanded} aria-expanded={detailsExpanded} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>
            </Button>

            <Collapse in={detailsExpanded} timeout="auto" unmountOnExit>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing(1)
                }}
              >
                {details.map(({ label, value, pre }) => (
                  <div key={label} style={{ textAlign: 'left' }}>
                    <Typography children={label} variant="body2" color="text.secondary" />
                    <Typography
                      children={value}
                      variant={pre ? 'inherit' : 'body1'}
                      component={pre ? 'pre' : 'p'}
                      marginLeft={theme.spacing(2)}
                      sx={{
                        marginTop: 0,
                        marginBottom: 0,
                        whiteSpace: pre ? 'pre-wrap' : 'normal',
                        wordBreak: 'break-word'
                      }}
                    />
                  </div>
                ))}

                {details.length === 0 ? <Typography children={t('values.none')} variant="body1" /> : null}
              </div>
            </Collapse>
          </>
        )}
      </Paper>
    </PageCenter>
  );
});

NotFoundPage.displayName = 'NotFoundPage';
