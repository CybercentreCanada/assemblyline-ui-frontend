import { Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { File as FileInfo } from 'components/models/base/file';
import type { Section } from 'components/models/base/result';
import ActionableText from 'components/visual/ActionableText';
import Classification from 'components/visual/Classification';
import Moment from 'components/visual/Moment';
import { GraphBody } from 'components/visual/ResultCard/graph_body';
import SectionContainer from 'components/visual/SectionContainer';
import { ImageInlineBody } from 'components/visual/image_inline';
import { bytesToSize } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

type IdentificationSectionProps = {
  fileinfo: FileInfo;
  promotedSections?: Section[];
  nocollapse?: boolean;
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({
  fileinfo,
  promotedSections = [],
  nocollapse = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const sp2 = theme.spacing(2);
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <SectionContainer
      title={t('identification')}
      nocollapse={nocollapse}
      slotProps={{
        wrapper: {
          style: {
            display: 'flex',
            alignItems: upSM ? 'start' : 'center',
            flexDirection: upSM ? 'row' : 'column',
            rowGap: sp2
          }
        }
      }}
    >
      <Grid container>
        {c12nDef.enforce && (
          <>
            <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
              <span
                style={{
                  fontWeight: 500,
                  marginRight: theme.spacing(0.5),
                  display: 'flex'
                }}
              >
                {t('file_classification')}
              </span>
            </Grid>
            <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <Classification type="text" format="long" c12n={fileinfo ? fileinfo.classification : null} />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>MD5</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          <ActionableText category="hash" type="md5" value={fileinfo?.md5} classification={fileinfo?.classification} />
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SHA1</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          <ActionableText
            category="hash"
            type="sha1"
            value={fileinfo?.sha1}
            classification={fileinfo?.classification}
          />
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SHA256</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          <ActionableText
            category="hash"
            type="sha256"
            value={fileinfo?.sha256}
            classification={fileinfo?.classification}
          />
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SSDEEP</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          <ActionableText
            category="hash"
            type="ssdeep"
            value={fileinfo?.ssdeep}
            classification={fileinfo?.classification}
          />
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>TLSH</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          {fileinfo ? (
            fileinfo?.tlsh ? (
              <ActionableText
                category="hash"
                type="tlsh"
                value={fileinfo?.tlsh}
                classification={fileinfo?.classification}
              />
            ) : (
              <span style={{ color: theme.palette.text.disabled }}>{t('not_computable')}</span>
            )
          ) : (
            <Skeleton />
          )}
        </Grid>

        {!fileinfo?.expiry_ts ? null : (
          <>
            <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
              <span style={{ fontWeight: 500 }}>{t('expiry.ts')}</span>
            </Grid>
            <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
              <Typography component="span" variant="body2">
                <Moment variant="fromNow">{fileinfo.expiry_ts}</Moment>
              </Typography>
              <Typography color="textSecondary" component="span" variant="body2">
                {` (`}
                <Moment format="YYYY-MM-DD HH:mm:ss">{fileinfo.expiry_ts}</Moment>)
              </Typography>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('size')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
          {fileinfo ? (
            <span>
              {fileinfo.size}
              <span style={{ fontWeight: 300 }}> ({bytesToSize(fileinfo.size)})</span>
            </span>
          ) : (
            <Skeleton />
          )}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('type')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
          {fileinfo ? fileinfo.type : <Skeleton />}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('mime')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
          {fileinfo ? fileinfo.mime : <Skeleton />}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('magic')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
          {fileinfo ? fileinfo.magic : <Skeleton />}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('entropy')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }}>{fileinfo ? fileinfo.entropy : <Skeleton />}</Grid>
        <Grid size={{ xs: 0, sm: 3, lg: 2 }} />
        <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
          {promotedSections
            ? promotedSections
                .filter(section => section.promote_to === 'ENTROPY')
                .map((section, idx) =>
                  section.body_format === 'GRAPH_DATA' ? <GraphBody key={idx} body={section.body} /> : null
                )
            : null}
        </Grid>
      </Grid>

      <div>
        {promotedSections
          ? promotedSections
              .filter(section => section.promote_to === 'SCREENSHOT')
              .map((section, idx) =>
                section.body_format === 'IMAGE' ? <ImageInlineBody key={idx} body={section.body} /> : null
              )
          : null}
      </div>
    </SectionContainer>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
