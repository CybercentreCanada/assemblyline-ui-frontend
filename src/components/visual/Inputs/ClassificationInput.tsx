import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { WhoAmI } from 'components/models/ui/user';
import type { ClassificationProps } from 'components/visual/Classification';
import CustomChip, { COLOR_MAP } from 'components/visual/CustomChip';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ClassificationInputProps = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  // c12n: string;
  // setClassification?: (classification: string) => void;
  // size?: 'medium' | 'small' | 'tiny';
  // type?: 'picker' | 'pill' | 'outlined' | 'text';
  // format?: FormatProp;
  // inline?: boolean;
  // isUser?: boolean;
  // fullWidth?: boolean;
  // dynGroup?: string;
  // disabled?: boolean;

  id?: string;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;

  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  startAdornment?: TextFieldProps['InputProps']['startAdornment'];
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: ClassificationProps['c12n'];
  onChange?: (event: unknown, classification: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const ClassificationInput: React.FC<ClassificationInputProps> = React.memo(
  ({
    format = 'short',
    inline = false,

    // size = 'medium',

    isUser = false,
    fullWidth = true,
    dynGroup = null,
    disabled = false,

    endAdornment = null,
    error = () => null,
    errorProps = null,
    helperText = null,
    helperTextProps = null,
    id: idProp = null,
    label,
    labelProps,
    loading = false,
    placeholder = null,
    preventDisabledColor = false,
    preventRender: preventRenderProp = false,
    readOnly = false,
    reset = false,
    resetProps = null,
    startAdornment = null,
    tiny = false,
    rootProps = null,
    tooltip = null,
    tooltipProps = null,
    value = null,
    onChange = () => null,
    onReset = () => null,
    onError = () => null,
    ...autocompleteProps
  }: ClassificationInputProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { user: currentUser, c12nDef, classificationAliases } = useALContext();

    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [uParts, setUserParts] = useState<ClassificationParts>(defaultParts);
    const [validated, setValidated] = useState<ClassificationValidator>(defaultClassificationValidator);
    const [focused, setFocused] = useState<boolean>(false);

    const isPhone = useMediaQuery(theme.breakpoints.only('xs'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const sp2 = theme.spacing(2);

    const preventRender = useMemo(
      () => preventRenderProp || !c12nDef?.enforce || !validated?.parts?.lvl,
      [c12nDef?.enforce, preventRenderProp, validated?.parts?.lvl]
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

    const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

    const errorValue = useMemo<string>(() => error(value), [error, value]);

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

        setValidated(
          applyClassificationRules({ ...validated.parts, groups: newGrp }, c12nDef, format, isMobile, isUser)
        );
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
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

        setValidated(
          applyClassificationRules({ ...validated.parts, subgroups: newSGrp }, c12nDef, format, isMobile, isUser)
        );
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
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

        setValidated(applyClassificationRules({ ...validated.parts, req: newReq }, c12nDef, format, isMobile, isUser));
      },
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const handleLevelChange = useCallback(
      (lvlIdx: number) =>
        setValidated(
          applyClassificationRules(
            { ...validated.parts, lvlIdx, lvl: getLevelText(lvlIdx, c12nDef, format, isMobile) },
            c12nDef,
            format,
            isMobile,
            isUser
          )
        ),
      [c12nDef, format, isMobile, isUser, validated.parts]
    );

    const handleChange = useCallback(
      (event: unknown) => {
        const newC12n = normalizedClassification(validated.parts, c12nDef, format, isMobile, isUser);
        setShowPicker(false);
        onChange(event, newC12n);
      },
      [c12nDef, format, isMobile, isUser, onChange, validated.parts]
    );

    const handleReset = useCallback(
      (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setShowPicker(false);
        onReset(event);
      },
      [onReset]
    );

    useEffect(() => {
      if (c12nDef && c12nDef?.enforce && value) {
        const parts = getParts(value.toLocaleUpperCase(), c12nDef, format, isMobile);
        setUserParts(getParts(currentUser.classification, c12nDef, format, isMobile));
        setValidated(applyClassificationRules(parts, c12nDef, format, isMobile, isUser));
      }
    }, [c12nDef, currentUser.classification, format, isMobile, isUser, value]);

    return preventRender || !value ? null : (
      <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
        <Tooltip title={tooltip} {...tooltipProps}>
          <Typography
            color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
            component={InputLabel}
            gutterBottom
            htmlFor={id}
            variant="body2"
            whiteSpace="nowrap"
            {...labelProps}
            children={label}
            sx={{
              ...labelProps?.sx,
              ...(disabled &&
                !preventDisabledColor && {
                  WebkitTextFillColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
                })
            }}
          />
        </Tooltip>
        <FormControl fullWidth>
          {loading ? (
            <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
          ) : (
            <Tooltip
              title={!readOnly ? null : t('readonly')}
              placement="bottom"
              arrow
              slotProps={{
                tooltip: { sx: { backgroundColor: theme.palette.primary.main } },
                arrow: { sx: { color: theme.palette.primary.main } }
              }}
            >
              <div style={{ display: inline ? 'inline-block' : null }}>
                <CustomChip
                  type="rounded"
                  variant="filled"
                  size="medium"
                  color={computedColor}
                  label={normalClassification}
                  fullWidth={fullWidth}
                  disabled={disabled}
                  onClick={readOnly ? null : () => setShowPicker(true)}
                  sx={{ fontWeight: 500, marginBottom: theme.spacing(0.75) }}
                  {...(tiny && { size: 'tiny' })}
                />
              </div>

              <Dialog
                fullScreen={isPhone}
                fullWidth
                maxWidth={isMobile ? 'xs' : 'md'}
                open={showPicker}
                onClose={event => handleChange(event)}
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
                                        primary={applyAliases(grp.name, classificationAliases)}
                                      />
                                    </ListItemButton>
                                  ))}
                                {c12nDef.dynamic_groups &&
                                  ['email', 'all'].includes(c12nDef.dynamic_groups_type) &&
                                  currentUser.email && (
                                    <ListItemButton
                                      disabled={validated.disabled.groups.includes(
                                        dynGroup || currentUser.dynamic_group
                                      )}
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
                                          classificationAliases
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
                                          primary={applyAliases(group, classificationAliases)}
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
                  {reset && (
                    <Button onClick={event => handleReset(event)} color="secondary">
                      {t('classification.reset')}
                    </Button>
                  )}
                  <Button onClick={event => handleChange(event)} color="primary" autoFocus>
                    {t('classification.done')}
                  </Button>
                </DialogActions>
              </Dialog>
            </Tooltip>
          )}
          <HelperText
            disabled={disabled}
            errorProps={errorProps}
            errorText={errorValue}
            helperText={helperText}
            helperTextProps={helperTextProps}
            id={id}
            label={label}
          />
        </FormControl>
      </div>
    );
  }
);
