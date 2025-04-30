import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import type { GridProps } from '@mui/material';
import { Collapse, Divider, Grid, Skeleton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import useSafeResults from 'components/hooks/useSafeResults';
import type { Signature } from 'components/models/base/tagging';
import type { Tags } from 'components/models/ui/file';
import AutoHideTagList from 'components/visual/AutoHideTagList';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TooltipGridProps extends Omit<GridProps, 'title'> {
  title?: React.ReactNode;
}

export const TooltipGrid: React.FC<TooltipGridProps> = ({ title = '', ...props }) => {
  const theme = useTheme();

  const [disabled, setDisabled] = useState<boolean>(true);

  const ref = useRef<any>(null);

  const isXS = useMediaQuery(theme.breakpoints.only('xs'));

  const resize = useCallback(() => {
    ref.current && setDisabled(() => ref.current.scrollWidth <= ref.current.clientWidth);
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
      placement={isXS ? 'bottom-start' : 'right-start'}
      disableFocusListener={disabled}
      disableHoverListener={disabled}
      disableInteractive={disabled}
      disableTouchListener={disabled}
      slotProps={{
        tooltip: {
          sx: {
            margin: 'auto !important'
          }
        }
      }}
    >
      <Grid
        ref={ref}
        size={{ xs: 12, sm: 3, lg: 2 }}
        paddingTop={0.375}
        {...props}
        sx={{
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          ...props?.sx
        }}
      />
    </Tooltip>
  );
};

type TagSectionProps = {
  signatures: Signature[];
  tags: Tags;
  force?: boolean;
};

const WrappedTagSection: React.FC<TagSectionProps> = ({ signatures, tags, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const { showSafeResults } = useSafeResults();
  const [tagUnsafeMap, setTagUnsafeMap] = useState({});

  const someSigNotSafe = signatures && signatures.some(i => i[1] !== 'safe' && !i[2]);
  const forceShowSig = signatures && signatures.length !== 0 && (showSafeResults || force);
  const someTagNotSafe = Object.values(tagUnsafeMap).some(Boolean);
  const forceShowTag = Object.keys(tagUnsafeMap).length !== 0 && (showSafeResults || force);

  useEffect(() => {
    if (tags) {
      const newTagUnsafeMap = {};
      for (const tType of Object.keys(tags)) {
        newTagUnsafeMap[tType] = tags[tType].some(i => i[1] !== 'safe' && !i[2]);
      }
      setTagUnsafeMap(newTagUnsafeMap);
    }
  }, [tags]);

  return (!signatures && !tags) || someTagNotSafe || forceShowTag || someSigNotSafe || forceShowSig ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover, &:focus': {
            color: theme.palette.text.secondary
          }
        }}
      >
        <span>{t('generated_tags')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {signatures && (someSigNotSafe || forceShowSig) && (
            <Grid container size="grow">
              <TooltipGrid title="heuristic.signature">
                <span style={{ fontWeight: 500 }}>heuristic.signature</span>
              </TooltipGrid>
              <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
                <AutoHideTagList
                  tag_type="heuristic.signature"
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
                    <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
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
                  <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
                    <Skeleton style={{ height: '2rem' }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
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
