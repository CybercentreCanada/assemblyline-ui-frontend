import { Grid, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { File as FileInfo } from 'components/models/base/file';
import { Section } from 'components/models/base/result';
import type { KeyValueBody, OrderedKeyValueBody } from 'components/models/base/result_body';
import { ImageInlineBody } from 'components/visual/image_inline';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

const KVItem = ({ name, value }: { name: string; value: any }) => (
  <>
    <Grid item xs={4} sm={3} lg={2}>
      <span style={{ fontWeight: 500, marginRight: '4px', display: 'flex', textTransform: 'capitalize' }}>{name}</span>
    </Grid>
    <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
      {(() => {
        if (value instanceof Array) {
          return value.join(' | ');
        } else if (value === true) {
          return 'true';
        } else if (value === false) {
          return 'false';
        } else if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      })()}
    </Grid>
  </>
);

const WrappedOrderedKVExtra = ({ body }: { body: OrderedKeyValueBody }) => (
  <>
    {Object.keys(body).map(id => (
      <KVItem key={id} name={body[id][0]} value={body[id][1]} />
    ))}
  </>
);

const OrderedKVExtra = React.memo(WrappedOrderedKVExtra);

const WrappedKVExtra = ({ body }: { body: KeyValueBody }) => (
  <>
    {Object.keys(body).map((key, id) => (
      <KVItem key={id} name={key} value={body[key]} />
    ))}
  </>
);

const KVExtra = React.memo(WrappedKVExtra);

type URIIdentificationSectionProps = {
  fileinfo: FileInfo;
  promotedSections?: Section[];
  nocollapse?: boolean;
};

const WrappedURIIdentificationSection: React.FC<URIIdentificationSectionProps> = ({
  fileinfo,
  promotedSections = [],
  nocollapse = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <SectionContainer
      title={t('uri_identification')}
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
        <Grid item xs={4} sm={3} lg={2}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('scheme')}</span>
        </Grid>
        <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          {fileinfo?.uri_info ? fileinfo.uri_info.scheme : <Skeleton />}
        </Grid>

        {fileinfo?.uri_info?.username && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('username')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.username}
            </Grid>
          </>
        )}

        {fileinfo?.uri_info?.password && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('password')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.password}
            </Grid>
          </>
        )}

        <Grid item xs={4} sm={3} lg={2}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('hostname')}</span>
        </Grid>
        <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
          {fileinfo.uri_info.hostname}
        </Grid>

        {fileinfo?.uri_info?.port && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('port')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.port}
            </Grid>
          </>
        )}

        {fileinfo?.uri_info?.path && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('path')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.path}
            </Grid>
          </>
        )}

        {fileinfo?.uri_info?.params && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('params')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.params}
            </Grid>
          </>
        )}

        {fileinfo?.uri_info?.query && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('query')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.query}
            </Grid>
          </>
        )}

        {fileinfo?.uri_info?.fragment && (
          <>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('fragment')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.fragment}
            </Grid>
          </>
        )}

        {promotedSections
          ? promotedSections
              .filter(section => section.promote_to === 'URI_PARAMS')
              .map((section, idx) =>
                section.body_format === 'KEY_VALUE' ? (
                  <KVExtra key={idx} body={section.body} />
                ) : section.body_format === 'ORDERED_KEY_VALUE' ? (
                  <OrderedKVExtra key={idx} body={section.body} />
                ) : null
              )
          : null}
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

const URIIdentificationSection = React.memo(WrappedURIIdentificationSection);
export default URIIdentificationSection;
