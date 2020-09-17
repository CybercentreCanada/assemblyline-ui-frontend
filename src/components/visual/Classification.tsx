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
  applyClassificationRules,
  defaultClassificationValidator,
  defaultDisabled,
  defaultParts,
  FormatProp,
  getLevelText,
  getParts,
  normalizedClassification
} from 'helpers/classificationParser';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ClassificationProps {
  c12n: string;
  setClassification?: (classification: string) => void;
  size?: 'medium' | 'small' | 'tiny';
  type?: 'picker' | 'pill' | 'text';
  format?: FormatProp;
  isUser: boolean;
}

const useStyles = makeStyles(theme => ({
  classification: {
    fontWeight: 500,
    width: '100%'
  }
}));

export default function Classification({ c12n, format, setClassification, size, type, isUser }: ClassificationProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: currentUser } = useUser<CustomUser>();
  const { classification: c12nDef } = useALContext();
  const isPhone = useMediaQuery(theme.breakpoints.down('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPicker, setShowPicker] = useState(false);
  const [uParts, setUserParts] = useState(defaultParts);
  const [validated, setValidated] = useState(defaultClassificationValidator);

  useEffect(() => {
    if (c12nDef && currentUser.c12n_enforcing && c12n) {
      const parts = getParts(c12n, c12nDef, format, isMobile);
      if (type === 'picker') {
        setUserParts(getParts(currentUser.classification, c12nDef, format, isMobile));
        setValidated(applyClassificationRules(parts, c12nDef, format, isMobile, isUser));
      } else {
        setValidated({
          disabled: defaultDisabled,
          parts
        });
      }
    }
    // eslint-disable-next-line
  }, [c12nDef, c12n, currentUser, isMobile]);

  function toggleGroups(grp) {
    const newGrp = validated.parts.groups;

    if (newGrp.indexOf(grp.name) === -1 && newGrp.indexOf(grp.short_name) === -1) {
      newGrp.push(format === 'long' && !isMobile ? grp.name : grp.short_name);
    } else if (newGrp.indexOf(grp.name) !== -1) {
      newGrp.splice(newGrp.indexOf(grp.name), 1);
    } else {
      newGrp.splice(newGrp.indexOf(grp.short_name), 1);
    }

    setValidated(applyClassificationRules({ ...validated.parts, groups: newGrp }, c12nDef, format, isMobile, isUser));
  }

  function toggleSubGroups(sgrp) {
    const newSGrp = validated.parts.subgroups;

    if (newSGrp.indexOf(sgrp.name) === -1 && newSGrp.indexOf(sgrp.short_name) === -1) {
      newSGrp.push(format === 'long' && !isMobile ? sgrp.name : sgrp.short_name);
    } else if (newSGrp.indexOf(sgrp.name) !== -1) {
      newSGrp.splice(newSGrp.indexOf(sgrp.name), 1);
    } else {
      newSGrp.splice(newSGrp.indexOf(sgrp.short_name), 1);
    }

    setValidated(
      applyClassificationRules({ ...validated.parts, subgroups: newSGrp }, c12nDef, format, isMobile, isUser)
    );
  }

  function toggleRequired(req) {
    const newReq = validated.parts.req;

    if (newReq.indexOf(req.name) === -1 && newReq.indexOf(req.short_name) === -1) {
      newReq.push(format === 'long' && !isMobile ? req.name : req.short_name);
    } else if (newReq.indexOf(req.name) !== -1) {
      newReq.splice(newReq.indexOf(req.name), 1);
    } else {
      newReq.splice(newReq.indexOf(req.short_name), 1);
    }

    setValidated(applyClassificationRules({ ...validated.parts, req: newReq }, c12nDef, format, isMobile, isUser));
  }

  function selectLevel(lvlIdx) {
    setValidated(
      applyClassificationRules(
        { ...validated.parts, lvlIdx, lvl: getLevelText(lvlIdx, c12nDef, format, isMobile) },
        c12nDef,
        format,
        isMobile,
        isUser
      )
    );
  }

  const computeColor = (): PossibleColors => {
    const levelStyles = c12nDef.levels_styles_map[validated.parts.lvl];
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
    const newC12n = normalizedClassification(validated.parts, c12nDef, format, isMobile);
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
          label={normalizedClassification(validated.parts, c12nDef, format, isMobile)}
          onClick={type === 'picker' ? () => setShowPicker(true) : null}
        />
        {type === 'picker' ? (
          <Dialog fullScreen={isPhone} fullWidth maxWidth="md" open={showPicker} onClose={useClassification}>
            <DialogTitle>
              <CustomChip
                type="classification"
                variant="outlined"
                size={size}
                color={computeColor()}
                className={classes.classification}
                label={normalizedClassification(validated.parts, c12nDef, format, isMobile)}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={1}>
                <Grid item xs={12} md>
                  <Card variant="outlined">
                    <List disablePadding style={{ borderRadius: '6px' }}>
                      {c12nDef.original_definition.levels.map((lvl, idx) => {
                        return isUser || lvl.lvl <= uParts.lvlIdx ? (
                          <ListItem
                            key={idx}
                            button
                            disabled={
                              validated.disabled.levels.includes(lvl.name) ||
                              validated.disabled.levels.includes(lvl.short_name)
                            }
                            selected={validated.parts.lvlIdx === lvl.lvl}
                            onClick={() => selectLevel(lvl.lvl)}
                          >
                            <ListItemText style={{ textAlign: 'center' }} primary={lvl.name} />
                          </ListItem>
                        ) : null;
                      })}
                    </List>
                  </Card>
                </Grid>
                {isUser || uParts.req.length !== 0 ? (
                  <Grid item xs={12} md>
                    <Card variant="outlined">
                      <List disablePadding>
                        {c12nDef.original_definition.required.map((req, idx) => {
                          return isUser || [req.name, req.short_name].some(r => uParts.req.includes(r)) ? (
                            <ListItem
                              key={idx}
                              button
                              selected={
                                validated.parts.req.includes(req.name) || validated.parts.req.includes(req.short_name)
                              }
                              onClick={() => toggleRequired(req)}
                            >
                              <ListItemText style={{ textAlign: 'center' }} primary={req.name} />
                            </ListItem>
                          ) : null;
                        })}
                      </List>
                    </Card>
                  </Grid>
                ) : null}
                {isUser || uParts.groups.length !== 0 || uParts.subgroups.length !== 0 ? (
                  <Grid item xs={12} md>
                    {isUser || uParts.groups.length !== 0 ? (
                      <Box pb={1}>
                        <Card variant="outlined">
                          <List disablePadding>
                            {c12nDef.original_definition.groups.map((grp, idx) => {
                              return isUser || [grp.name, grp.short_name].some(g => uParts.groups.includes(g)) ? (
                                <ListItem
                                  key={idx}
                                  button
                                  disabled={
                                    validated.disabled.groups.includes(grp.name) ||
                                    validated.disabled.groups.includes(grp.short_name)
                                  }
                                  selected={
                                    validated.parts.groups.includes(grp.name) ||
                                    validated.parts.groups.includes(grp.short_name)
                                  }
                                  onClick={() => toggleGroups(grp)}
                                >
                                  <ListItemText style={{ textAlign: 'center' }} primary={grp.name} />
                                </ListItem>
                              ) : null;
                            })}
                          </List>
                        </Card>
                      </Box>
                    ) : null}
                    {isUser || uParts.subgroups.length !== 0 ? (
                      <Card variant="outlined">
                        <List disablePadding>
                          {c12nDef.original_definition.subgroups.map((sgrp, idx) => {
                            return isUser || [sgrp.name, sgrp.short_name].some(sg => uParts.subgroups.includes(sg)) ? (
                              <ListItem
                                key={idx}
                                button
                                selected={
                                  validated.parts.subgroups.includes(sgrp.name) ||
                                  validated.parts.subgroups.includes(sgrp.short_name)
                                }
                                onClick={() => toggleSubGroups(sgrp)}
                              >
                                <ListItemText style={{ textAlign: 'center' }} primary={sgrp.name} />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </Card>
                    ) : null}
                  </Grid>
                ) : null}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={useClassification} color="primary" autoFocus>
                {t('classification.done')}
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
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
  format: 'short' as 'short',
  isUser: false
};
