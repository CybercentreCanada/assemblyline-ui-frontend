import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Collapse,
  Divider,
  Grid,
  GridProps,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useSafeResults from 'components/hooks/useSafeResults';
import AutoHideTagList from 'components/visual/AutoHideTagList';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  tooltip: {
    margin: 'auto !important'
  }
}));

type TagSectionProps = {
  signatures: any;
  tags: any;
  force?: boolean;
};

const WrappedTagSection: React.FC<TagSectionProps> = ({ signatures, tags, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const sp2 = theme.spacing(2);
  const { showSafeResults } = useSafeResults();
  const [tagUnsafeMap, setTagUnsafeMap] = React.useState({});

  useEffect(() => {
    if (tags) {
      const newTagUnsafeMap = {};
      for (const tType of Object.keys(tags)) {
        newTagUnsafeMap[tType] = tags[tType].some(i => i[1] !== 'safe' && !i[2]);
      }
      setTagUnsafeMap(newTagUnsafeMap);
    }
  }, [tags]);

  const someSigNotSafe = signatures && signatures.some(i => i[1] !== 'safe' && !i[2]);
  const forceShowSig = signatures && signatures.length !== 0 && (showSafeResults || force);
  const someTagNotSafe = Object.values(tagUnsafeMap).some(Boolean);
  const forceShowTag = Object.keys(tagUnsafeMap).length !== 0 && (showSafeResults || force);

  const TooltipGrid: React.FC<GridProps & { title?: React.ReactNode }> = ({ title = '', ...props }) => {
    const [disabled, setDisabled] = useState<boolean>(true);
    const ref = useRef<any>(null);

    const resize = useCallback(() => {
      ref.current && setDisabled(ref.current.scrollWidth <= ref.current.clientWidth);
    }, []);

    useEffect(() => {
      resize();
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }, [resize]);

    return (
      <Tooltip
        title={title}
        classes={{
          tooltip: classes.tooltip
        }}
        placement={isXS ? 'bottom-start' : 'right-start'}
        disableFocusListener={disabled}
        disableHoverListener={disabled}
        disableInteractive={disabled}
        disableTouchListener={disabled}
      >
        <Grid ref={ref} className={classes.meta_key} item xs={12} sm={3} lg={2} {...props} />
      </Tooltip>
    );
  };

  return (!signatures && !tags) || someTagNotSafe || forceShowTag || someSigNotSafe || forceShowSig ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        <span>{t('generated_tags')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {signatures && (someSigNotSafe || forceShowSig) && (
            <Grid container>
              <TooltipGrid title={'ref.current.test.placeholder.heuristic.signature'}>
                <span style={{ fontWeight: 500 }}>ref.current.test.placeholder.heuristic.signature</span>
              </TooltipGrid>
              <Grid item xs={12} sm={9} lg={10}>
                <AutoHideTagList
                  tag_type={'heuristic.signature'}
                  items={signatures.map(item => ({ value: item[0], lvl: item[1], safelisted: item[2] }))}
                  force={force}
                />
              </Grid>
            </Grid>
          )}
          {tags
            ? Object.keys(tags).map((tag_type, i) =>
                tagUnsafeMap[tag_type] || showSafeResults || force ? (
                  <Grid container key={i}>
                    <TooltipGrid title={tag_type}>
                      <span style={{ fontWeight: 500 }}>{tag_type}</span>
                    </TooltipGrid>
                    <Grid item xs={12} sm={9} lg={10}>
                      <AutoHideTagList
                        tag_type={tag_type}
                        items={tags[tag_type].map(item => ({
                          value: item[0],
                          lvl: item[1],
                          safelisted: item[2],
                          classification: item[3]
                        }))}
                        force={force}
                      />
                    </Grid>
                  </Grid>
                ) : null
              )
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

const TagSection = React.memo(WrappedTagSection);
export default TagSection;
