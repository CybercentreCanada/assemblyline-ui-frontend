import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  useMediaQuery
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid/Grid';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import { CustomUser } from 'components/hooks/useMyUser';
import CustomChip, { ColorMap, PossibleColors } from 'components/visual/CustomChip';
import {
  defaultParts,
  FormatProp,
  getLevelText,
  getParts,
  normalizedClassification
} from 'helpers/classificationParser';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ClassificationProps {
  c12n: string;
  setClassification?: (classification: string) => void;
  size?: 'medium' | 'small' | 'tiny';
  type?: 'picker' | 'pill' | 'text';
  format?: FormatProp;
}

const useStyles = makeStyles(theme => ({
  classification: {
    fontWeight: 500,
    width: '100%'
  }
}));

export default function Classification({ c12n, format, setClassification, size, type }: ClassificationProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: currentUser } = useUser<CustomUser>();
  const { classification: c12nDef } = useALContext();
  const isPhone = useMediaQuery(theme.breakpoints.down('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPicker, setShowPicker] = React.useState(false);
  const [parts, setParts] = React.useState(defaultParts);

  useEffect(() => {
    if (c12nDef && currentUser.c12n_enforcing && c12n) {
      setParts(getParts(c12n, c12nDef, format, isMobile));
    }
    // eslint-disable-next-line
  }, [c12nDef, c12n, currentUser, isMobile]);

  function toggleGroups(grp) {
    // TODO: Selection dependencies
    const newGrp = parts.groups;
    if (newGrp.indexOf(grp.name) === -1 && newGrp.indexOf(grp.short_name) === -1) {
      newGrp.push(format === 'long' && !isMobile ? grp.name : grp.short_name);
    } else if (newGrp.indexOf(grp.name) !== -1) {
      newGrp.splice(newGrp.indexOf(grp.name), 1);
    } else {
      newGrp.splice(newGrp.indexOf(grp.short_name), 1);
    }
    setParts({ ...parts, groups: newGrp });
  }

  function toggleSubGroups(sgrp) {
    // TODO: Selection dependencies
    const newSGrp = parts.subgroups;
    if (newSGrp.indexOf(sgrp.name) === -1 && newSGrp.indexOf(sgrp.short_name) === -1) {
      newSGrp.push(format === 'long' && !isMobile ? sgrp.name : sgrp.short_name);
    } else if (newSGrp.indexOf(sgrp.name) !== -1) {
      newSGrp.splice(newSGrp.indexOf(sgrp.name), 1);
    } else {
      newSGrp.splice(newSGrp.indexOf(sgrp.short_name), 1);
    }
    setParts({ ...parts, subgroups: newSGrp });
  }

  function toggleRequired(req) {
    // TODO: Selection dependencies
    const newReq = parts.req;
    if (newReq.indexOf(req.name) === -1 && newReq.indexOf(req.short_name) === -1) {
      newReq.push(format === 'long' && !isMobile ? req.name : req.short_name);
    } else if (newReq.indexOf(req.name) !== -1) {
      newReq.splice(newReq.indexOf(req.name), 1);
    } else {
      newReq.splice(newReq.indexOf(req.short_name), 1);
    }
    setParts({ ...parts, req: newReq });
  }

  function selectLevel(lvl) {
    // TODO: Selection dependencies
    const lvlIdx = lvl.toString();
    setParts({ ...parts, lvlIdx, lvl: getLevelText(lvlIdx, c12nDef, format, isMobile) });
  }

  const computeColor = (): PossibleColors => {
    const levelStyles = c12nDef.levels_styles_map[parts.lvl];
    if (!levelStyles) {
      return 'default' as 'default';
    }
    return ColorMap[levelStyles.color || levelStyles.label.replace('label-', '')] || ('default' as 'default');
  };

  const skelheight = {
    medium: '3rem',
    small: '2rem',
    tiny: '1.5rem'
  };

  const useClassification = () => {
    const newC12n = normalizedClassification(parts, c12nDef, format, isMobile);
    if (setClassification && newC12n !== c12n) {
      setClassification(newC12n);
    }
    setShowPicker(false);
  };
  // Build chip based on computed values
  return currentUser.c12n_enforcing ? (
    c12nDef && c12n ? (
      <>
        <CustomChip
          type="classification"
          variant={type === 'text' ? 'outlined' : 'default'}
          size={size}
          color={computeColor()}
          className={classes.classification}
          label={normalizedClassification(parts, c12nDef, format, isMobile)}
          onClick={type === 'picker' ? () => setShowPicker(true) : null}
        />

        <Dialog fullScreen={isPhone} fullWidth maxWidth="md" open={showPicker} onClose={useClassification}>
          <DialogTitle>
            <CustomChip
              type="classification"
              variant={type === 'text' ? 'outlined' : 'default'}
              size={size}
              color={computeColor()}
              className={classes.classification}
              label={normalizedClassification(parts, c12nDef, format, isMobile)}
            />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <List disablePadding style={{ borderRadius: '6px' }}>
                    {c12nDef.original_definition.levels.map((lvl, idx) => {
                      return (
                        <ListItem
                          key={idx}
                          button
                          selected={parts.lvl === lvl.name || parts.lvl === lvl.short_name}
                          onClick={() => selectLevel(lvl.lvl)}
                        >
                          <ListItemText style={{ textAlign: 'center' }} primary={lvl.name} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <List disablePadding>
                    {c12nDef.original_definition.required.map((req, idx) => {
                      return (
                        <ListItem
                          key={idx}
                          button
                          selected={parts.req.includes(req.name) || parts.req.includes(req.short_name)}
                          onClick={() => toggleRequired(req)}
                        >
                          <ListItemText style={{ textAlign: 'center' }} primary={req.name} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box pb={1}>
                  <Card variant="outlined">
                    <List disablePadding>
                      {c12nDef.original_definition.groups.map((grp, idx) => {
                        return (
                          <ListItem
                            key={idx}
                            button
                            selected={parts.groups.includes(grp.name) || parts.groups.includes(grp.short_name)}
                            onClick={() => toggleGroups(grp)}
                          >
                            <ListItemText style={{ textAlign: 'center' }} primary={grp.name} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Card>
                </Box>
                <Card variant="outlined">
                  <List disablePadding>
                    {c12nDef.original_definition.subgroups.map((sgrp, idx) => {
                      return (
                        <ListItem
                          key={idx}
                          button
                          selected={parts.subgroups.includes(sgrp.name) || parts.subgroups.includes(sgrp.short_name)}
                          onClick={() => toggleSubGroups(sgrp)}
                        >
                          <ListItemText style={{ textAlign: 'center' }} primary={sgrp.name} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={useClassification} color="primary" autoFocus>
              {t('classification.done')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    ) : (
      <Skeleton style={{ height: skelheight[size] }} />
    )
  ) : null;
}

Classification.defaultProps = {
  setClassification: null,
  size: 'medium' as 'medium',
  type: 'pill' as 'pill',
  format: 'short' as 'short'
};
