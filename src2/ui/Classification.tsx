import {
  alpha,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ListItemButton,
  ListItemText,
  Skeleton,
  styled,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { Button } from 'components/visual/Buttons/Button';
import CustomChip, { COLOR_MAP } from 'components/visual/CustomChip';
import { Tooltip } from 'components/visual/Tooltip';
import type {
  ClassificationGroup,
  ClassificationLevel,
  ClassificationParts,
  ClassificationRequired,
  ClassificationSubGroup,
  ClassificationValidator,
  FormatProp
} from 'helpers/classificationParser';
import {
  applyAliases,
  applyClassificationRules,
  defaultClassificationValidator,
  defaultDisabled,
  defaultParts,
  getLevelText,
  getParts,
  normalizedClassification
} from 'helpers/classificationParser';
import type { PossibleColor } from 'helpers/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ClassificationProps {
  c12n: string;
  disabled?: boolean;
  dynGroup?: string;
  format?: FormatProp;
  fullWidth?: boolean;
  inline?: boolean;
  isUser?: boolean;
  size?: 'medium' | 'small' | 'tiny';
  type?: 'picker' | 'pill' | 'outlined' | 'text';
  setClassification?: (classification: string) => void;
}

type ClassificationTextProps = {
  color: PossibleColor;
};

const ClassificationText = styled('span', {
  shouldForwardProp: prop => prop !== 'color'
})<ClassificationTextProps>(({ theme, color }) => ({
  fontWeight: 500,
  color: (() => {
    switch (color) {
      case 'default':
        return theme.palette.mode === 'dark' ? '#AAA' : '#888';
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light;
      case 'info':
        return theme.palette.mode !== 'dark' ? theme.palette.info.dark : theme.palette.info.light;
      case 'warning':
        return theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light;
      case 'error':
        return theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light;
    }
  })()
}));

export const Classification = React.memo(
  ({
    c12n = null,
    disabled = false,
    dynGroup = null,
    format = 'short',
    fullWidth = true,
    inline = false,
    isUser = false,
    size = 'medium',
    type = 'pill',
    setClassification = null
  }: ClassificationProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { user: currentUser, c12nDef, classificationAliases } = useALContext();

    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [uParts, setUserParts] = useState<ClassificationParts>(defaultParts);
    const [validated, setValidated] = useState<ClassificationValidator>(defaultClassificationValidator);

    const sp2 = theme.spacing(2);
    const isPhone = useMediaQuery(theme.breakpoints.only('xs'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const skelheight = useMemo(
      () => ({
        medium: theme.spacing(4),
        small: theme.spacing(3.5),
        tiny: theme.spacing(3)
      }),
      [theme]
    );

    const classificationColor = useMemo<PossibleColor>(() => {
      const levelStyles = c12nDef.levels_styles_map[validated.parts.lvl];
      if (!levelStyles) {
        return 'default';
      }
      return COLOR_MAP[levelStyles.color || levelStyles.label.replace('label-', '')] || ('default' as const);
    }, [c12nDef.levels_styles_map, validated.parts.lvl]);

    const classificationLabel = useMemo<string>(
      () =>
        c12nDef && c12nDef.enforce && !!validated?.parts?.lvl && c12n
          ? normalizedClassification(validated.parts, c12nDef, format, isMobile, isUser, classificationAliases)
          : null,
      [c12n, c12nDef, classificationAliases, format, isMobile, isUser, validated.parts]
    );

    const classificationTooltip = useMemo<string>(
      () =>
        c12nDef && c12nDef.enforce && !!validated?.parts?.lvl && c12n
          ? normalizedClassification(validated.parts, c12nDef, 'long', isMobile, isUser, classificationAliases)
          : null,
      [c12n, c12nDef, classificationAliases, isMobile, isUser, validated.parts]
    );

    const toggleGroups = useCallback(
      (grp: Partial<ClassificationGroup>) => {
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

        setValidated(
          applyClassificationRules({ ...validated.parts, groups: newGrp }, c12nDef, format, isMobile, isUser)
        );
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const toggleSubGroups = useCallback(
      (sgrp: Partial<ClassificationSubGroup>) => {
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
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const toggleRequired = useCallback(
      (req: Partial<ClassificationRequired>) => {
        const newReq = validated.parts.req;

        if (newReq.indexOf(req.name) === -1 && newReq.indexOf(req.short_name) === -1) {
          newReq.push(format === 'long' && !isMobile ? req.name : req.short_name);
        } else if (newReq.indexOf(req.name) !== -1) {
          newReq.splice(newReq.indexOf(req.name), 1);
        } else {
          newReq.splice(newReq.indexOf(req.short_name), 1);
        }

        setValidated(applyClassificationRules({ ...validated.parts, req: newReq }, c12nDef, format, isMobile, isUser));
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const selectLevel = useCallback(
      (lvlIdx: ClassificationLevel['lvl']) => {
        setValidated(
          applyClassificationRules(
            { ...validated.parts, lvlIdx, lvl: getLevelText(lvlIdx, c12nDef, format, isMobile) },
            c12nDef,
            format,
            isMobile,
            isUser
          )
        );
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const applyClassification = useCallback(() => {
      const newC12n = normalizedClassification(validated.parts, c12nDef, format, isMobile, isUser);
      const originalParts = getParts(c12n.toLocaleUpperCase(), c12nDef, format, isMobile);
      const originalC12n = normalizedClassification(originalParts, c12nDef, format, isMobile, isUser);
      if (setClassification && newC12n !== originalC12n) {
        setClassification(newC12n);
      }
      setShowPicker(false);
    }, [c12n, c12nDef, format, isMobile, isUser, setClassification, validated.parts]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [c12n, currentUser, isMobile, type]);

    return (
      c12nDef &&
      c12nDef.enforce &&
      (!!validated?.parts?.lvl && c12n ? (
        <>
          {type === 'text' ? (
            <Tooltip title={classificationTooltip} placement="bottom" noDiv>
              <ClassificationText color={classificationColor}>{classificationLabel}</ClassificationText>
            </Tooltip>
          ) : (
            <Tooltip title={classificationTooltip} placement="bottom" noDiv>
              <div style={{ display: inline ? 'inline-block' : null }}>
                <CustomChip
                  type="rounded"
                  variant={type === 'outlined' ? 'outlined' : 'filled'}
                  size={size}
                  color={classificationColor}
                  label={classificationLabel}
                  onClick={type === 'picker' ? () => setShowPicker(true) : null}
                  fullWidth={fullWidth}
                  disabled={disabled}
                  sx={{ fontWeight: 500 }}
                />
              </div>
            </Tooltip>
          )}
          {type === 'picker' ? (
            <Dialog
              fullScreen={isPhone}
              fullWidth
              maxWidth={isMobile ? 'xs' : 'md'}
              open={showPicker}
              onClose={applyClassification}
            >
              <DialogTitle>
                <CustomChip
                  type="rounded"
                  variant="outlined"
                  size={size}
                  color={classificationColor}
                  label={classificationLabel}
                  fullWidth={fullWidth}
                  sx={{ fontWeight: 500 }}
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 'grow' }}>
                    <Typography color="textSecondary" variant="body2">
                      {t('classification.level')}
                    </Typography>
                    <Card variant="outlined">
                      {c12nDef.original_definition.levels.map(
                        (lvl, idx) =>
                          (isUser || (lvl.lvl <= uParts.lvlIdx && !lvl.is_hidden)) && (
                            <Tooltip
                              key={idx}
                              title={c12nDef.description?.[lvl.name]}
                              placement="bottom"
                              slotProps={{
                                popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] },
                                tooltip: { sx: { backgroundColor: alpha(theme.palette.Tooltip.bg, 1) } }
                              }}
                            >
                              <ListItemButton
                                disabled={
                                  validated.disabled.levels.includes(lvl.name) ||
                                  validated.disabled.levels.includes(lvl.short_name)
                                }
                                selected={validated.parts.lvlIdx === lvl.lvl}
                                onClick={() => selectLevel(lvl.lvl)}
                              >
                                <ListItemText style={{ textAlign: 'center' }} primary={lvl.name} />
                              </ListItemButton>
                            </Tooltip>
                          )
                      )}
                    </Card>
                  </Grid>
                  {((isUser && c12nDef.original_definition.required.length !== 0) ||
                    (uParts.req.length !== 0 &&
                      c12nDef.original_definition.required.filter(r => !r.is_hidden).length !== 0)) && (
                    <Grid size={{ xs: 12, md: 'grow' }}>
                      <Typography color="textSecondary" variant="body2">
                        {t('classification.required_tokens')}
                      </Typography>
                      <Card variant="outlined">
                        {c12nDef.original_definition.required.map(
                          (req, idx) =>
                            (isUser ||
                              ([req.name, req.short_name].some(r => uParts.req.includes(r)) && !req.is_hidden)) && (
                              <Tooltip
                                key={idx}
                                title={c12nDef.description?.[req.short_name]}
                                placement="bottom"
                                slotProps={{
                                  popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] },
                                  tooltip: { sx: { backgroundColor: alpha(theme.palette.Tooltip.bg, 1) } }
                                }}
                              >
                                <ListItemButton
                                  key={idx}
                                  selected={
                                    validated.parts.req.includes(req.name) ||
                                    validated.parts.req.includes(req.short_name)
                                  }
                                  onClick={() => toggleRequired(req)}
                                >
                                  <ListItemText style={{ textAlign: 'center' }} primary={req.name} />
                                </ListItemButton>
                              </Tooltip>
                            )
                        )}
                      </Card>
                    </Grid>
                  )}
                  {((isUser &&
                    (c12nDef.original_definition.groups.length !== 0 ||
                      c12nDef.original_definition.subgroups.length !== 0)) ||
                    (uParts.groups.length !== 0 &&
                      c12nDef.original_definition.groups.filter(g => !g.is_hidden).length !== 0) ||
                    (uParts.subgroups.length !== 0 &&
                      c12nDef.original_definition.subgroups.filter(sg => !sg.is_hidden).length !== 0)) && (
                    <Grid size={{ xs: 12, md: 'grow' }}>
                      {((isUser && (c12nDef.original_definition.groups.length !== 0 || c12nDef.dynamic_groups)) ||
                        (uParts.groups.length !== 0 &&
                          c12nDef.original_definition.groups.filter(g => !g.is_hidden).length !== 0)) && (
                        <div style={{ paddingBottom: sp2 }}>
                          <Typography color="textSecondary" variant="body2">
                            {t('classification.groups_releasability')}
                          </Typography>
                          <Card variant="outlined">
                            {c12nDef.original_definition.groups
                              .filter(grp => isUser || !grp.is_hidden)
                              .map((grp, idx) => (
                                <Tooltip
                                  key={idx}
                                  title={grp?.description}
                                  placement="bottom"
                                  slotProps={{
                                    popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] },
                                    tooltip: { sx: { backgroundColor: alpha(theme.palette.Tooltip.bg, 1) } }
                                  }}
                                >
                                  <ListItemButton
                                    key={idx}
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
                                    <ListItemText
                                      style={{ textAlign: 'center' }}
                                      primary={applyAliases(grp.name, classificationAliases, format)}
                                    />
                                  </ListItemButton>
                                </Tooltip>
                              ))}
                            {c12nDef.dynamic_groups &&
                              ['email', 'all'].includes(c12nDef.dynamic_groups_type) &&
                              currentUser.email && (
                                <ListItemButton
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
                                    primary={applyAliases(
                                      dynGroup || currentUser.dynamic_group,
                                      classificationAliases,
                                      format
                                    )}
                                  />
                                </ListItemButton>
                              )}
                            {c12nDef.dynamic_groups &&
                              ['group', 'all'].includes(c12nDef.dynamic_groups_type) &&
                              currentUser.groups
                                .filter(
                                  group =>
                                    !(
                                      group in c12nDef.groups_map_lts ||
                                      group in c12nDef.groups_map_stl ||
                                      group in c12nDef.subgroups_map_lts ||
                                      group in c12nDef.subgroups_map_stl
                                    )
                                )
                                .map((group, idx_group) => (
                                  <Tooltip
                                    key={idx_group}
                                    title={c12nDef.description?.[group]}
                                    placement="bottom"
                                    slotProps={{
                                      popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] },
                                      tooltip: { sx: { backgroundColor: alpha(theme.palette.Tooltip.bg, 1) } }
                                    }}
                                  >
                                    <ListItemButton
                                      key={idx_group}
                                      disabled={validated.disabled.groups.includes(group)}
                                      selected={validated.parts.groups.includes(group)}
                                      onClick={() =>
                                        toggleGroups({
                                          name: group,
                                          short_name: group
                                        })
                                      }
                                    >
                                      <ListItemText
                                        style={{ textAlign: 'center' }}
                                        primary={applyAliases(group, classificationAliases, format)}
                                      />
                                    </ListItemButton>
                                  </Tooltip>
                                ))}
                          </Card>
                        </div>
                      )}
                      {((isUser && c12nDef.original_definition.subgroups.length !== 0) ||
                        (uParts.subgroups.length !== 0 &&
                          c12nDef.original_definition.subgroups.filter(sg => !sg.is_hidden).length !== 0)) && (
                        <>
                          <Typography color="textSecondary" variant="body2">
                            {t('classification.sub-groups_releasability')}
                          </Typography>
                          <Card variant="outlined">
                            {c12nDef.original_definition.subgroups
                              .filter(sgrp => isUser || !sgrp.is_hidden)
                              .map((sgrp, idx) => (
                                <Tooltip
                                  key={idx}
                                  title={sgrp?.description}
                                  placement="bottom"
                                  slotProps={{
                                    popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] },
                                    tooltip: { sx: { backgroundColor: alpha(theme.palette.Tooltip.bg, 1) } }
                                  }}
                                >
                                  <ListItemButton
                                    key={idx}
                                    selected={
                                      validated.parts.subgroups.includes(sgrp.name) ||
                                      validated.parts.subgroups.includes(sgrp.short_name)
                                    }
                                    onClick={() => toggleSubGroups(sgrp)}
                                  >
                                    <ListItemText style={{ textAlign: 'center' }} primary={sgrp.name} />
                                  </ListItemButton>
                                </Tooltip>
                              ))}
                          </Card>
                        </>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  color="secondary"
                  to="/help/classification"
                  variant="outlined"
                  onClick={() => setShowPicker(false)}
                >
                  {t('classification.help')}
                </Button>
                <div style={{ flex: 1 }} />
                <Button autoFocus color="primary" disableElevation variant="contained" onClick={applyClassification}>
                  {t('classification.done')}
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}
        </>
      ) : (
        <Skeleton
          variant={type === 'text' ? 'text' : 'rectangular'}
          height={type !== 'text' ? skelheight[size] : null}
          sx={{
            borderRadius: theme.spacing(0.5),
            ...(inline && { display: 'inline-block', width: '8rem', verticalAlign: 'bottom' })
          }}
        />
      ))
    );
  }
);

Classification.displayName = 'Classification';
export default Classification;
