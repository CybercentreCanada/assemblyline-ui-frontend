import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
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
  type?: 'picker' | 'pill' | 'outlined' | 'text';
  format?: FormatProp;
  inline: boolean;
  isUser: boolean;
  fullWidth?: boolean;
  dynGroup?: string;
  disabled?: boolean;
}

const useStyles = makeStyles(theme => ({
  classification: {
    fontWeight: 500
  },
  inlineSkel: {
    display: 'inline-block',
    width: '8rem',
    verticalAlign: 'bottom'
  },
  // Text Color
  default: {
    fontWeight: 500,
    color: theme.palette.mode === 'dark' ? '#AAA' : '#888'
  },
  primary: {
    fontWeight: 500,
    color: theme.palette.primary.main
  },
  secondary: {
    fontWeight: 500,
    color: theme.palette.secondary.main
  },
  success: {
    fontWeight: 500,
    color: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
  },
  info: {
    fontWeight: 500,
    color: theme.palette.mode !== 'dark' ? theme.palette.info.dark : theme.palette.info.light
  },
  warning: {
    fontWeight: 500,
    color: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
  },
  error: {
    fontWeight: 500,
    color: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
  }
}));

function WrappedClassification({
  c12n,
  format,
  inline,
  setClassification,
  size,
  type,
  isUser,
  fullWidth,
  dynGroup,
  disabled = false
}: ClassificationProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: currentUser, c12nDef } = useALContext();
  const isPhone = useMediaQuery(theme.breakpoints.down('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPicker, setShowPicker] = useState(false);
  const [uParts, setUserParts] = useState(defaultParts);
  const [validated, setValidated] = useState(defaultClassificationValidator);
  const sp2 = theme.spacing(2);

  useEffect(() => {
    if (c12nDef && c12nDef.enforce && c12n) {
      const parts = getParts(c12n.toLocaleUpperCase(), c12nDef, format, isMobile);
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
  }, [c12n, currentUser, isMobile]);

  function toggleGroups(grp) {
    const newGrp = validated.parts.groups;

    if (newGrp.indexOf(grp.name) === -1 && newGrp.indexOf(grp.short_name) === -1) {
      newGrp.push(format === 'long' && !isMobile ? grp.name : grp.short_name);
    } else {
      if (newGrp.indexOf(grp.name) !== -1) {
        newGrp.splice(newGrp.indexOf(grp.name), 1);
      } else {
        newGrp.splice(newGrp.indexOf(grp.short_name), 1);
      }
      if (newGrp.length === 1 && !isUser) {
        const lastGrp = newGrp[0];
        for (const grpItem of c12nDef.original_definition.groups) {
          if ((lastGrp === grpItem.name || lastGrp === grpItem.short_name) && grpItem.auto_select) {
            newGrp.splice(newGrp.indexOf(lastGrp), 1);
          }
        }
      }
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
    medium: theme.spacing(4),
    small: theme.spacing(3.5),
    tiny: theme.spacing(3)
  };

  const useClassification = () => {
    const newC12n = normalizedClassification(validated.parts, c12nDef, format, isMobile);
    const originalParts = getParts(c12n.toLocaleUpperCase(), c12nDef, format, isMobile);
    const originalC12n = normalizedClassification(originalParts, c12nDef, format, isMobile);
    if (setClassification && newC12n !== originalC12n) {
      setClassification(newC12n);
    }
    setShowPicker(false);
  };
  // Build chip based on computed values
  return (
    c12nDef &&
    c12nDef.enforce &&
    (c12n ? (
      <>
        {type === 'text' ? (
          <span className={classes[computeColor()]}>
            {normalizedClassification(validated.parts, c12nDef, format, isMobile)}
          </span>
        ) : (
          <div style={{ display: inline ? 'inline-block' : null }}>
            <CustomChip
              type="rounded"
              variant={type === 'outlined' ? 'outlined' : 'filled'}
              size={size}
              color={computeColor()}
              className={classes.classification}
              label={normalizedClassification(validated.parts, c12nDef, format, isMobile)}
              onClick={type === 'picker' ? () => setShowPicker(true) : null}
              fullWidth={fullWidth}
              disabled={disabled}
            />
          </div>
        )}
        {type === 'picker' ? (
          <Dialog
            fullScreen={isPhone}
            fullWidth
            maxWidth={isMobile ? 'xs' : 'md'}
            open={showPicker}
            onClose={useClassification}
          >
            <DialogTitle>
              <CustomChip
                type="rounded"
                variant="outlined"
                size={size}
                color={computeColor()}
                className={classes.classification}
                label={normalizedClassification(validated.parts, c12nDef, format, isMobile)}
                fullWidth={fullWidth}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md>
                  <Card variant="outlined">
                    <List disablePadding style={{ borderRadius: '6px' }}>
                      {c12nDef.original_definition.levels.map(
                        (lvl, idx) =>
                          (isUser || lvl.lvl <= uParts.lvlIdx) && (
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
                          )
                      )}
                    </List>
                  </Card>
                </Grid>
                {((isUser && c12nDef.original_definition.required.length !== 0) || uParts.req.length !== 0) && (
                  <Grid item xs={12} md>
                    <Card variant="outlined">
                      <List disablePadding>
                        {c12nDef.original_definition.required.map(
                          (req, idx) =>
                            (isUser || [req.name, req.short_name].some(r => uParts.req.includes(r))) && (
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
                            )
                        )}
                      </List>
                    </Card>
                  </Grid>
                )}
                {((isUser &&
                  (c12nDef.original_definition.groups.length !== 0 ||
                    c12nDef.original_definition.subgroups.length !== 0)) ||
                  uParts.groups.length !== 0 ||
                  uParts.subgroups.length !== 0) && (
                  <Grid item xs={12} md>
                    {((isUser && (c12nDef.original_definition.groups.length !== 0 || c12nDef.dynamic_groups)) ||
                      uParts.groups.length !== 0) && (
                      <div style={{ paddingBottom: sp2 }}>
                        <Card variant="outlined">
                          <List disablePadding>
                            {c12nDef.original_definition.groups.map((grp, idx) => (
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
                            ))}
                            {c12nDef.dynamic_groups && currentUser.email && (
                              <ListItem
                                button
                                disabled={validated.disabled.groups.includes(dynGroup || currentUser.dynamic_group)}
                                selected={validated.parts.groups.includes(dynGroup || currentUser.dynamic_group)}
                                onClick={() =>
                                  toggleGroups({
                                    name: dynGroup || currentUser.dynamic_group,
                                    short_name: dynGroup || currentUser.dynamic_group
                                  })
                                }
                              >
                                <ListItemText
                                  style={{ textAlign: 'center' }}
                                  primary={dynGroup || currentUser.dynamic_group}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Card>
                      </div>
                    )}
                    {((isUser && c12nDef.original_definition.subgroups.length !== 0) ||
                      uParts.subgroups.length !== 0) && (
                      <Card variant="outlined">
                        <List disablePadding>
                          {c12nDef.original_definition.subgroups.map((sgrp, idx) => (
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
                          ))}
                        </List>
                      </Card>
                    )}
                  </Grid>
                )}
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
      <Skeleton
        variant={type === 'text' ? 'text' : 'rectangular'}
        className={inline ? classes.inlineSkel : null}
        height={type !== 'text' ? skelheight[size] : null}
        style={{ borderRadius: theme.spacing(0.5) }}
      />
    ))
  );
}

WrappedClassification.defaultProps = {
  setClassification: null,
  size: 'medium' as 'medium',
  type: 'pill' as 'pill',
  format: 'short' as 'short',
  inline: false,
  isUser: false,
  fullWidth: true,
  dynGroup: null
};

const Classification = React.memo(WrappedClassification);
export default Classification;
