import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Box, Link, Typography, Divider, Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useExternalLookup from 'components/hooks/useExternalLookup';
import { toTitleCase } from 'helpers/utils';
import { useTranslation } from 'react-i18next';

import { ChipList } from 'components/visual/ChipList';
import { CustomChipProps } from 'components/visual/CustomChip';
import { DetailedItem, detailedItemCompare } from 'components/routes/alerts/hooks/useAlerts';
import { verdictToColor } from 'helpers/utils';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Classification from 'components/visual/Classification';
import useALContext from 'components/hooks/useALContext';

const TARGET_RESULT_COUNT = 10;

const useStyles = makeStyles(theme => ({
  link: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    textDecoration: 'none'
  },
  title: {
    flex: 1,
    fontWeight: 500,
    color: theme.palette.text.primary
  },
  content: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.primary.main
  },
  error: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.text.primary,
    fontSize: 'small'
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  section: {
    marginBottom: theme.spacing(2),
    '& > hr': {
      marginBottom: theme.spacing(1)
    }
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  sectionContent: {},
  sourceTitle: {
    fontWeight: 'bold'
  }
}));

type AutoHideChipListProps = {
  items: DetailedItem[];
  type?: string;
};

type AutoHideChipListState = {
  showExtra: boolean;
  fullChipList: CustomChipProps[];
};

type ExternalLookupProps = {
  category: string;
  type: string;
  value: string;
  iconStyle?: null | Object;
};

const WrappedAutoHideChipList: React.FC<AutoHideChipListProps> = ({ items, type = null }) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState<AutoHideChipListState | null>(null);
  const [shownChips, setShownChips] = React.useState<CustomChipProps[]>([]);

  React.useEffect(() => {
    const fullChipList = items.sort(detailedItemCompare).map(item => ({
      category: 'tag',
      data_type: type,
      label: item.subtype ? `${item.value} - ${item.subtype}` : item.value,
      variant: 'outlined' as 'outlined',
      color: verdictToColor(item.verdict)
    }));
    const showExtra = items.length <= TARGET_RESULT_COUNT;

    setState({ showExtra, fullChipList });
  }, [items, type]);

  React.useEffect(() => {
    if (state !== null) {
      if (state.showExtra) {
        setShownChips(state.fullChipList);
      } else {
        setShownChips(state.fullChipList.slice(0, TARGET_RESULT_COUNT));
      }
    }
  }, [state]);

  return (
    <>
      <ChipList items={shownChips} />
      {state && !state.showExtra && (
        <Tooltip title={t('more')}>
          <IconButton size="small" onClick={() => setState({ ...state, showExtra: true })} style={{ padding: 0 }}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

const AutoHideChipList = React.memo(WrappedAutoHideChipList);

const WrappedExternalLinks: React.FC<ExternalLookupProps> = ({ category, type, value, iconStyle }) => {
  const theme = useTheme();
  const classes = useStyles();
  const [openedDialog, setOpenedDialog] = React.useState(false);
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const { c12nDef } = useALContext();

  const { enrichmentState, isActionable, getKey } = useExternalLookup();
  const actionable = isActionable(category, type, value);
  const externalLookupResults = enrichmentState[getKey(type, value)];
  const titleId = openedDialog ? 'external-result-dialog-title' : undefined;
  const descriptionId = openedDialog ? 'external-result-dialog-description' : undefined;

  // const handleClickOpen = event => () => {
  const handleClickOpen = () => {
    setOpenedDialog(true);
    setScroll('paper');
    // event.stopPropagation();
  };

  const handleClose = () => {
    setOpenedDialog(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (openedDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [openedDialog]);

  // determine max classification of all return results
  let classification = 'TLP:C';

  return actionable && externalLookupResults ? (
    <div>
      {externalLookupResults !== null ? (
        <Button onClick={handleClickOpen} style={iconStyle}>
          <LinkOutlinedIcon />
        </Button>
      ) : null}
      <Dialog
        open={openedDialog}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <DialogTitle id={titleId}>
          {c12nDef.enforce && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
              <div style={{ flex: 1 }}>
                <Classification c12n={classification} type="outlined" />
              </div>
            </div>
          )}
          External Results
        </DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText id={descriptionId} ref={descriptionElementRef} tabIndex={-1}>

            <div className={classes.section}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}
              >
                {Object.entries(externalLookupResults).map(([source, enrichmentResults]) => (
                  <>
                    <Typography variant="h2">{source}</Typography>

                      {enrichmentResults.items.map((item, i) => (
                        item.enrichment?.map((enrichmentResult, j) => (
                <>
                  {(() => {
                    let prevGroup = null;
                    item.enrichment?.map((enrichmentResult, j) => (
                      <>
                        {enrichmentResult.group !== prevGroup
                          ? (prevGroup = enrichmentResult.group && (
                              <>
                                <Typography className={classes.sectionTitle}>{enrichmentResult.group}</Typography>
                                <Divider />
                              </>
                            ))
                          : null}

                        <Grid container spacing={1} key={`${j}`} style={{ marginTop: theme.spacing(1) }}>
                          <Grid
                            item
                            xs={3}
                            sm={2}
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {enrichmentResult.name}
                          </Grid>
                          <Grid item xs={9} sm={10}>
                            <div className={classes.sectionContent}>
                              {/* <AutoHideChipList items={enrichmentResult.value} /> */}
                            </div>
                          </Grid>
                        </Grid>
                      </>
                    ));
                  })()}
                </>
              ))}


            </div>



            <Box sx={{ p: 1 }}>
              {externalLookupResults &&
                [...Object.keys(externalLookupResults)]?.sort().map((sourceName, i) => {
                  return (
                    <div key={`success_${i}`}>
                      <Typography className={clsx(classes.title)} sx={{ display: 'inline' }}>
                        {toTitleCase(sourceName)}
                      </Typography>

                      {externalLookupResults[sourceName].items.map((item, j) => {
                        return (
                          <div>
                            <Link
                              className={clsx(classes.link)}
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Typography
                                className={clsx(classes.content, classes.launch)}
                                sx={{ display: 'inline', marginLeft: '8px' }}
                              >
                                {item.count} results{' '}
                                <LaunchOutlinedIcon sx={{ verticalAlign: 'middle', height: '16px' }} />
                              </Typography>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  ) : null;
};

const ExternalLinks = React.memo(WrappedExternalLinks);
export default ExternalLinks;
