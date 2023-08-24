import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Divider, Grid, IconButton, Link, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useExternalLookup from 'components/hooks/useExternalLookup';
import { useTranslation } from 'react-i18next';

import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import { DetailedItem } from 'components/routes/alerts/hooks/useAlerts';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import CustomChip, { CustomChipProps } from 'components/visual/CustomChip';
import { getMaxClassification } from 'helpers/classificationParser';
import { toTitleCase, verdictToColor } from 'helpers/utils';

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

const WrappedAutoHideChipList: React.FC<AutoHideChipListProps> = ({ items }) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState<AutoHideChipListState | null>(null);
  const [shownChips, setShownChips] = React.useState<CustomChipProps[]>([]);

  React.useEffect(() => {
    const fullChipList = items.map(item => ({
      category: 'tag',
      label: item[0].toString(),
      variant: 'outlined' as 'outlined',
      tooltip: item[1].toString()
    }));
    const showExtra = items.length <= TARGET_RESULT_COUNT;

    setState({ showExtra, fullChipList });
  }, [items]);

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
  if (!!externalLookupResults) {
    Object.values(externalLookupResults).forEach(enrichmentResults => {
      enrichmentResults.items.forEach(enrichmentResult => {
        console.log(`old clsf: ${classification}`);
        classification = getMaxClassification(classification, enrichmentResult.classification, c12nDef, 'long', false);
        console.log(`new clsf: ${classification}`);
      });
    });
  }
  console.log(`final clsf: ${classification}`);

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
        // maxWidth="xl"
        // fullWidth
      >
        <DialogTitle id={titleId}>
          {c12nDef.enforce && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
              <div style={{ flex: 1 }}>
                <Classification c12n={classification} type="outlined" />
              </div>
            </div>
          )}
          <Typography variant="h4">External Results</Typography>
        </DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText id={descriptionId} ref={descriptionElementRef} tabIndex={-1}>
            <div className={classes.section}>
              <div style={{ display: 'block' }}>
                {Object.entries(externalLookupResults).map(([source, enrichmentResults]) => (
                  <>
                    <div>
                      <Typography variant="h5" sx={{ display: 'inline' }}>
                        {toTitleCase(source)}
                      </Typography>
                      <Divider />
                    </div>

                    <div>{!!enrichmentResults.error ? enrichmentResults.error : null}</div>

                    {enrichmentResults.items.map((enrichmentResult, i) => {
                      let verdict = 'info';
                      if (enrichmentResult.malicious === false) {
                        verdict = 'safe';
                      } else if (enrichmentResult.malicious === true) {
                        verdict = 'malicious';
                      }

                      // create lookup tables
                      // [{group: str, name: str, name_description: str, value: str, value_description}]
                      //   -> {group: {name: [[value, desc], ...]}}
                      //   -> {group: [name, ...]}
                      let rLookup = {};
                      let nLookup = {};
                      let gOrder = [];
                      enrichmentResult.enrichment.forEach(enrichmentItem => {
                        //  values order
                        if (!(enrichmentItem.group in rLookup)) {
                          rLookup[enrichmentItem.group] = {};
                        }
                        if (!(enrichmentItem.name in rLookup[enrichmentItem.group])) {
                          rLookup[enrichmentItem.group][enrichmentItem.name] = [];
                        }
                        rLookup[enrichmentItem.group][enrichmentItem.name].push([
                          enrichmentItem.value,
                          enrichmentItem.value_description
                        ]);

                        // name order
                        if (!(enrichmentItem.group in nLookup)) {
                          nLookup[enrichmentItem.group] = [];
                        }
                        if (!nLookup[enrichmentItem.group].includes(enrichmentItem.name)) {
                          nLookup[enrichmentItem.group].push(enrichmentItem.name);
                        }

                        // group order
                        if (!gOrder.includes(enrichmentItem.group)) {
                          gOrder.push(enrichmentItem.group);
                        }
                      });

                      return (
                        <>
                          <div>
                            <Link
                              className={clsx(classes.link)}
                              href={enrichmentResult.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Typography className={clsx(classes.content, classes.launch)}>
                                {enrichmentResult.count} results
                                <LaunchOutlinedIcon sx={{ verticalAlign: 'middle', height: '16px' }} />
                              </Typography>
                            </Link>
                            <Typography>{enrichmentResult.description}</Typography>
                            <Typography>
                              Verdict:{' '}
                              <CustomChip
                                type="rounded"
                                size="tiny"
                                variant="filled"
                                color={verdictToColor(verdict)}
                                label={verdict}
                              />
                            </Typography>
                          </div>
                          <div className={classes.sectionContent}></div>

                          {!!gOrder &&
                            gOrder.map((grpName, j) => {
                              return (
                                <>
                                  <Typography variant="h6">{grpName}</Typography>
                                  <div className={classes.sectionContent}></div>

                                  <Grid container spacing={1} key={`${j}`} style={{ marginTop: theme.spacing(1) }}>
                                    {!!nLookup &&
                                      nLookup[grpName].map((keyName, k) => {
                                        return (
                                          <>
                                            <Grid item xs={5} sm={5}>
                                              <div className={classes.sectionContent}>{keyName}</div>
                                            </Grid>
                                            <Grid item xs={7} sm={7}>
                                              <div className={classes.sectionContent}>
                                                <AutoHideChipList items={rLookup[grpName][keyName]} />
                                              </div>
                                            </Grid>
                                          </>
                                        );
                                      })}
                                  </Grid>
                                </>
                              );
                            })}
                        </>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
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
