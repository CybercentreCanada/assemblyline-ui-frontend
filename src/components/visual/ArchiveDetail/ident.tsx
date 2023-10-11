import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionableText from '../ActionableText';
import ArchiveLabels from './labels';

const useStyles = makeStyles(theme => ({
  sp2: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  labels: {
    display: 'flex',
    alignItems: 'center'
  }
}));

type Props = {
  fileinfo: any;
  isArchive?: boolean;
};

type RowProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  monospace?: boolean;
};

const WrappedIdentificationSection: React.FC<Props> = ({ fileinfo, isArchive = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(true);

  const Row = useCallback(
    ({ title, children, monospace = false }: RowProps) => (
      <>
        <Grid item xs={4} sm={3} lg={2}>
          <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{title}</span>
        </Grid>
        <Grid
          item
          xs={8}
          sm={9}
          lg={10}
          style={{ wordBreak: 'break-word', fontFamily: monospace ? 'monospace' : 'inherit' }}
        >
          {children}
        </Grid>
      </>
    ),
    [theme]
  );

  return (
    <div className={classes.sp2}>
      <Typography className={classes.title} variant="h6" onClick={() => setOpen(!open)}>
        <span>{t('identification')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div className={classes.sp2}>
          <Grid container>
            <Row title={'MD5'} monospace>
              <ActionableText
                category="hash"
                type="md5"
                value={fileinfo?.md5}
                classification={fileinfo?.classification}
              />
            </Row>

            <Row title={'SHA1'} monospace>
              <ActionableText
                category="hash"
                type="sha1"
                value={fileinfo?.sha1}
                classification={fileinfo?.classification}
              />
            </Row>

            <Row title={'SHA256'} monospace>
              <ActionableText
                category="hash"
                type="sha256"
                value={fileinfo?.sha256}
                classification={fileinfo?.classification}
              />
            </Row>

            <Row title={'SHA256'} monospace>
              <ActionableText
                category="hash"
                type="sha256"
                value={fileinfo?.sha256}
                classification={fileinfo?.classification}
              />
            </Row>

            <Row title={'SSDEEP'} monospace>
              <ActionableText
                category="hash"
                type="ssdeep"
                value={fileinfo?.ssdeep}
                classification={fileinfo?.classification}
              />
            </Row>

            <Row title={'TLSH'} monospace>
              {fileinfo ? (
                (
                  <ActionableText
                    category="hash"
                    type="tlsh"
                    value={fileinfo?.tlsh}
                    classification={fileinfo?.classification}
                  />
                ) || <span style={{ color: theme.palette.text.disabled }}>{t('not_available')}</span>
              ) : (
                <Skeleton />
              )}
            </Row>

            <Row title={t('size')}>
              {fileinfo ? (
                <span>
                  {fileinfo.size}
                  <span style={{ fontWeight: 300 }}> ({bytesToSize(fileinfo.size)})</span>
                </span>
              ) : (
                <Skeleton />
              )}
            </Row>

            <Row title={t('type')}>{fileinfo ? fileinfo.type : <Skeleton />}</Row>
            <Row title={t('mime')}>{fileinfo ? fileinfo.mime : <Skeleton />}</Row>
            <Row title={t('magic')}>{fileinfo ? fileinfo.magic : <Skeleton />}</Row>
            <Row title={t('entropy')}>{fileinfo ? fileinfo.entropy : <Skeleton />}</Row>

            <ArchiveLabels sha256={fileinfo?.sha256} labels={fileinfo?.label_categories} xs={4} sm={3} lg={2} />
          </Grid>
        </div>
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
