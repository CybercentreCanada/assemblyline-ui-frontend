import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { WhoAmI } from 'components/models/ui/user';
import type { ClassificationProps } from 'components/visual/Classification';
import CustomChip, { COLOR_MAP } from 'components/visual/CustomChip';
import {
  HelperText,
  PasswordInput,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ClassificationParts, ClassificationValidator } from 'helpers/classificationParser';
import {
  applyAliases,
  applyClassificationRules,
  defaultClassificationValidator,
  defaultParts,
  getLevelText,
  getParts,
  normalizedClassification
} from 'helpers/classificationParser';
import type { PossibleColor } from 'helpers/colors';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type ClassificationInputProps = Omit<ClassificationProps, 'c12n' | 'setClassification'> &
  InputValues<ClassificationProps['c12n']> &
  InputProps;

type ClassificationInputState = ClassificationInputProps & {
  showPicker: boolean;
  uParts: ClassificationParts;
  validated: ClassificationValidator;
};

const WrappedClassificationInput = React.memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: currentUser, c12nDef, classificationAliases } = useALContext();

  const isPhone = useMediaQuery(theme.breakpoints.only('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sp2 = theme.spacing(2);

  const [get, setStore] = usePropStore<ClassificationInputState>();

  const disabled = get('disabled');
  const format = get('format');
  const fullWidth = get('fullWidth');
  const inline = get('inline');
  const isUser = get('isUser');
  const loading = get('loading');
  const monospace = get('monospace');
  const password = get('password');
  const preventRenderStore = get('preventRender');
  const readOnly = get('readOnly');
  const reset = get('reset');
  const showPassword = get('showPassword');
  const tiny = get('tiny');
  const value = get('value');

  const dynGroup = get('dynGroup');
  const showPicker = get('showPicker') ?? false;
  const uParts = get('uParts') ?? defaultParts;
  const validated = get('validated') ?? defaultClassificationValidator;

  const error = get('error');
  const onChange = get('onChange');
  const onError = get('onError');
  const onReset = get('onReset');

  const preventRender = useMemo(
    () => preventRenderStore || !c12nDef?.enforce || !validated?.parts?.lvl,
    [c12nDef?.enforce, preventRenderStore, validated?.parts?.lvl]
  );

  const normalClassification = useMemo(
    () =>
      preventRender
        ? null
        : normalizedClassification(validated.parts, c12nDef, format, isMobile, isUser, classificationAliases),
    [c12nDef, classificationAliases, format, isMobile, isUser, preventRender, validated.parts]
  );

  const computedColor = useMemo<PossibleColor>(() => {
    if (preventRender) return null;

    const levelStyles = c12nDef.levels_styles_map[validated.parts.lvl];
    if (!levelStyles) {
      return 'default' as const;
    }
    return COLOR_MAP[levelStyles.color || levelStyles.label.replace('label-', '')] || ('default' as const);
  }, [c12nDef.levels_styles_map, preventRender, validated.parts.lvl]);

  const handleGroupsChange = useCallback(
    (grp: WhoAmI['classification_aliases'][keyof WhoAmI['classification_aliases']]) => {
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

      setStore(s => ({
        ...s,
        validated: applyClassificationRules({ ...validated.parts, groups: newGrp }, c12nDef, format, isMobile, isUser)
      }));
    },
    [c12nDef, format, isMobile, isUser, setStore, validated.parts]
  );

  const handleSubGroupsChange = useCallback(
    (sgrp: WhoAmI['classification_aliases'][keyof WhoAmI['classification_aliases']]) => {
      const newSGrp = validated.parts.subgroups;

      if (newSGrp.indexOf(sgrp.name) === -1 && newSGrp.indexOf(sgrp.short_name) === -1) {
        newSGrp.push(format === 'long' && !isMobile ? sgrp.name : sgrp.short_name);
      } else if (newSGrp.indexOf(sgrp.name) !== -1) {
        newSGrp.splice(newSGrp.indexOf(sgrp.name), 1);
      } else {
        newSGrp.splice(newSGrp.indexOf(sgrp.short_name), 1);
      }

      setStore(s => ({
        ...s,
        validated: applyClassificationRules(
          { ...validated.parts, subgroups: newSGrp },
          c12nDef,
          format,
          isMobile,
          isUser
        )
      }));
    },
    [c12nDef, format, isMobile, isUser, setStore, validated.parts]
  );

  const handleRequiredChange = useCallback(
    (req: WhoAmI['classification_aliases'][keyof WhoAmI['classification_aliases']]) => {
      const newReq = validated.parts.req;

      if (newReq.indexOf(req.name) === -1 && newReq.indexOf(req.short_name) === -1) {
        newReq.push(format === 'long' && !isMobile ? req.name : req.short_name);
      } else if (newReq.indexOf(req.name) !== -1) {
        newReq.splice(newReq.indexOf(req.name), 1);
      } else {
        newReq.splice(newReq.indexOf(req.short_name), 1);
      }

      setStore(s => ({
        ...s,
        validated: applyClassificationRules({ ...validated.parts, req: newReq }, c12nDef, format, isMobile, isUser)
      }));
    },
    [c12nDef, format, isMobile, isUser, setStore, validated.parts]
  );

  const handleLevelChange = useCallback(
    (lvlIdx: number) =>
      setStore(s => ({
        ...s,
        validated: applyClassificationRules(
          { ...validated.parts, lvlIdx, lvl: getLevelText(lvlIdx, c12nDef, format, isMobile) },
          c12nDef,
          format,
          isMobile,
          isUser
        )
      })),
    [c12nDef, format, isMobile, isUser, setStore, validated.parts]
  );

  const handleChange = useCallback(
    (event: React.SyntheticEvent) => {
      const newC12n = normalizedClassification(validated.parts, c12nDef, format, isMobile, isUser);
      const err = error(newC12n);
      onError(err);
      if (!err) onChange(event, newC12n);
      setStore(() => ({ ...(!err && { value: newC12n }), inputValue: newC12n, errorMsg: err, showPicker: false }));
    },
    [c12nDef, error, format, isMobile, isUser, onChange, onError, setStore, validated.parts]
  );

  useEffect(() => {
    if (c12nDef && c12nDef?.enforce && value) {
      const parts = getParts(value.toLocaleUpperCase(), c12nDef, format, isMobile);
      setStore(s => ({
        ...s,
        uParts: getParts(currentUser.classification, c12nDef, format, isMobile),
        validated: applyClassificationRules(parts, c12nDef, format, isMobile, isUser)
      }));
    }
  }, [c12nDef, currentUser.classification, format, isMobile, isUser, setStore, value]);

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <div style={{ display: inline ? 'inline-block' : null }}>
              <CustomChip
                type="rounded"
                variant="filled"
                size={tiny ? 'tiny' : 'medium'}
                color={computedColor}
                label={normalClassification}
                fullWidth={fullWidth}
                disabled={disabled}
                onClick={readOnly ? null : () => setStore(s => ({ ...s, showPicker: true }))}
                sx={{
                  fontWeight: 500,
                  mb: 0.75,
                  ...(monospace && { fontFamily: 'monospace' }),
                  ...(password &&
                    showPassword && {
                      fontFamily: 'password',
                      WebkitTextSecurity: 'disc',
                      MozTextSecurity: 'disc',
                      textSecurity: 'disc'
                    })
                }}
              />
            </div>

            <Dialog
              fullScreen={isPhone}
              fullWidth
              maxWidth={isMobile ? 'xs' : 'md'}
              open={showPicker}
              onClose={event => handleChange(event as React.SyntheticEvent)}
            >
              <DialogTitle>
                <CustomChip
                  type="rounded"
                  variant="outlined"
                  size="medium"
                  color={computedColor}
                  label={normalClassification}
                  fullWidth={fullWidth}
                  sx={{ fontWeight: 500 }}
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 'grow' }}>
                    <Card variant="outlined">
                      <List disablePadding style={{ borderRadius: '6px' }}>
                        {c12nDef.original_definition.levels.map(
                          (lvl, idx) =>
                            (isUser || (lvl.lvl <= uParts.lvlIdx && !lvl.is_hidden)) && (
                              <ListItemButton
                                key={idx}
                                disabled={
                                  validated.disabled.levels.includes(lvl.name) ||
                                  validated.disabled.levels.includes(lvl.short_name)
                                }
                                selected={validated.parts.lvlIdx === lvl.lvl}
                                onClick={() => handleLevelChange(lvl.lvl)}
                              >
                                <ListItemText style={{ textAlign: 'center' }} primary={lvl.name} />
                              </ListItemButton>
                            )
                        )}
                      </List>
                    </Card>
                  </Grid>
                  {((isUser && c12nDef.original_definition.required.length !== 0) ||
                    (uParts.req.length !== 0 &&
                      c12nDef.original_definition.required.filter(r => !r.is_hidden).length !== 0)) && (
                    <Grid size={{ xs: 12, md: 'grow' }}>
                      <Card variant="outlined">
                        <List disablePadding>
                          {c12nDef.original_definition.required.map(
                            (req, idx) =>
                              (isUser ||
                                ([req.name, req.short_name].some(r => uParts.req.includes(r)) && !req.is_hidden)) && (
                                <ListItemButton
                                  key={idx}
                                  selected={
                                    validated.parts.req.includes(req.name) ||
                                    validated.parts.req.includes(req.short_name)
                                  }
                                  onClick={() => handleRequiredChange(req)}
                                >
                                  <ListItemText style={{ textAlign: 'center' }} primary={req.name} />
                                </ListItemButton>
                              )
                          )}
                        </List>
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
                          <Card variant="outlined">
                            <List disablePadding>
                              {c12nDef.original_definition.groups
                                .filter(grp => isUser || !grp.is_hidden)
                                .map((grp, idx) => (
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
                                    onClick={() => handleGroupsChange(grp)}
                                  >
                                    <ListItemText
                                      style={{ textAlign: 'center' }}
                                      primary={applyAliases(grp.name, classificationAliases, format)}
                                    />
                                  </ListItemButton>
                                ))}
                              {c12nDef.dynamic_groups &&
                                ['email', 'all'].includes(c12nDef.dynamic_groups_type) &&
                                currentUser.email && (
                                  <ListItemButton
                                    disabled={validated.disabled.groups.includes(dynGroup || currentUser.dynamic_group)}
                                    selected={validated.parts.groups.includes(dynGroup || currentUser.dynamic_group)}
                                    onClick={() =>
                                      handleGroupsChange({
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
                                    <ListItemButton
                                      key={idx_group}
                                      disabled={validated.disabled.groups.includes(group)}
                                      selected={validated.parts.groups.includes(group)}
                                      onClick={() =>
                                        handleGroupsChange({
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
                                  ))}
                            </List>
                          </Card>
                        </div>
                      )}
                      {((isUser && c12nDef.original_definition.subgroups.length !== 0) ||
                        (uParts.subgroups.length !== 0 &&
                          c12nDef.original_definition.subgroups.filter(sg => !sg.is_hidden).length !== 0)) && (
                        <Card variant="outlined">
                          <List disablePadding>
                            {c12nDef.original_definition.subgroups
                              .filter(sgrp => isUser || !sgrp.is_hidden)
                              .map((sgrp, idx) => (
                                <ListItemButton
                                  key={idx}
                                  selected={
                                    validated.parts.subgroups.includes(sgrp.name) ||
                                    validated.parts.subgroups.includes(sgrp.short_name)
                                  }
                                  onClick={() => handleSubGroupsChange(sgrp)}
                                >
                                  <ListItemText style={{ textAlign: 'center' }} primary={sgrp.name} />
                                </ListItemButton>
                              ))}
                          </List>
                        </Card>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <PasswordInput />
                {reset && (
                  <Button
                    onClick={event => {
                      onReset(event);
                      setStore(s => ({ ...s, showPicker: false }));
                    }}
                    color="secondary"
                  >
                    {t('classification.reset')}
                  </Button>
                )}
                <Button onClick={event => handleChange(event)} color="primary" autoFocus>
                  {t('classification.done')}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const ClassificationInput = ({
  dynGroup = null,
  format = 'short',
  fullWidth = true,
  inline = false,
  isUser = false,
  preventRender = false,
  value,
  ...props
}: ClassificationInputProps) => {
  const parsedProps = useInputParsedProps({
    ...props,
    dynGroup,
    format,
    fullWidth,
    inline,
    isUser,
    preventRender,
    value
  });

  return preventRender || !value ? null : (
    <PropProvider<ClassificationInputProps> props={parsedProps}>
      <WrappedClassificationInput />
    </PropProvider>
  );
};
