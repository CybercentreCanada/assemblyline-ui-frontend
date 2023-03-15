import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from '../CustomChip';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type MetadataSectionProps = {
  metadata: any;
};

const WrappedMetadataSection: React.FC<MetadataSectionProps> = ({ metadata }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return !metadata || Object.keys(metadata).length !== 0 ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('metadata')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {metadata
            ? Object.keys(metadata).map((meta, i) => (
                <Grid container key={i}>
                  <Grid item xs={12} sm={3} lg={2}>
                    <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{meta}</span>
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    {Object.keys(metadata[meta]).map((item, key) => (
                      <CustomChip size="tiny" key={key} label={`${metadata[meta][item]}x ${item}`} />
                    ))}
                  </Grid>
                </Grid>
              ))
            : [...Array(3)].map((_, i) => (
                <Grid container key={i} spacing={1}>
                  <Grid item xs={12} sm={3} lg={2}>
                    <Skeleton style={{ height: '2rem' }} />
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    <Skeleton style={{ height: '2rem' }} />
                  </Grid>
                </Grid>
              ))}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const MetadataSection = React.memo(WrappedMetadataSection);
export default MetadataSection;
