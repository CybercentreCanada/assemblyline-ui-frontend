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
import CustomChip, { ColorArray, PossibleColors } from 'components/visual/CustomChip';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ClassificationProps {
  c12n: string;
  setClassification?: (classification: string) => void;
  size?: 'medium' | 'small' | 'tiny';
  type?: 'picker' | 'pill' | 'text';
  format?: 'long' | 'short';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPicker, setShowPicker] = React.useState(false);
  const defaultParts = {
    lvlIdx: '',
    lvl: '',
    req: [],
    groups: [],
    subgroups: []
  };
  const [parts, setParts] = React.useState(defaultParts);

  useEffect(() => {
    if (c12nDef && currentUser.c12n_enforcing && c12n) {
      setParts(getParts());
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
    setParts({ ...parts, lvlIdx, lvl: getLevelText(lvlIdx) });
  }

  function getLevelText(lvl) {
    let text = null;
    if (c12nDef != null) {
      text = c12nDef.levels_map[lvl.toString()];
    }

    if (text === undefined || text == null) {
      text = '';
    }

    if (format === 'long' && !isMobile) {
      return c12nDef.levels_map_stl[text];
    }

    return text;
  }

  function getLevelIndex() {
    let retIndex = null;
    const splitIdx = c12n.indexOf('//');
    let c12nLvl = c12n;
    if (splitIdx !== -1) {
      c12nLvl = c12n.slice(0, splitIdx);
    }

    if (c12nDef.levels_map[c12nLvl] !== undefined) {
      retIndex = c12nDef.levels_map[c12nLvl];
    } else if (c12nDef.levels_map_lts[c12nLvl] !== undefined) {
      retIndex = c12nDef.levels_map[c12nDef.levels_map_lts[c12nLvl]];
    } else if (c12nDef.levels_aliases[c12nLvl] !== undefined) {
      retIndex = c12nDef.levels_map[c12nDef.levels_aliases[c12nLvl]];
    }

    return retIndex;
  }

  function getRequired() {
    const returnSet = [];
    const partSet = c12n.split('/');
    for (const p of partSet) {
      if (p in c12nDef.access_req_map_lts) {
        returnSet.push(c12nDef.access_req_map_lts[p]);
      } else if (p in c12nDef.access_req_map_stl) {
        returnSet.push(p);
      } else if (p in c12nDef.access_req_aliases) {
        for (const a of c12nDef.access_req_aliases[p]) {
          returnSet.push(a);
        }
      }
    }

    if (format === 'long' && !isMobile) {
      const out = [];
      for (const r of returnSet) {
        out.push(c12nDef.access_req_map_stl[r]);
      }

      return out.sort();
    }

    return returnSet.sort();
  }

  function getGroups() {
    const g1 = [];
    const g2 = [];

    const groupParts = c12n.split('//');
    let groups = [];
    for (let grpPart of groupParts) {
      grpPart = grpPart.replace('REL TO ', '');
      const tempGroup = grpPart.split(',');
      for (const tg of tempGroup) {
        groups = groups.concat(tg.trim().split('/'));
      }
    }

    for (const g of groups) {
      if (g in c12nDef.groups_map_lts) {
        g1.push(c12nDef.groups_map_lts[g]);
      } else if (g in c12nDef.groups_map_stl) {
        g1.push(g);
      } else if (g in c12nDef.groups_aliases) {
        for (const a of c12nDef.groups_aliases[g]) {
          g1.push(a);
        }
      } else if (g in c12nDef.subgroups_map_lts) {
        g2.push(c12nDef.subgroups_map_lts[g]);
      } else if (g in c12nDef.subgroups_map_stl) {
        g2.push(g);
      } else if (g in c12nDef.subgroups_aliases) {
        for (const sa of c12nDef.subgroups_aliases[g]) {
          g2.push(sa);
        }
      }
    }

    if (format === 'long' && !isMobile) {
      const g1Out = [];
      for (const gr of g1) {
        g1Out.push(c12nDef.groups_map_stl[gr]);
      }

      const g2Out = [];
      for (const sgr of g2) {
        g2Out.push(c12nDef.subgroups_map_stl[sgr]);
      }

      return { groups: g1Out.sort(), subgroups: g2Out.sort() };
    }

    return { groups: g1.sort(), subgroups: g2.sort() };
  }

  function getParts() {
    const grps = getGroups();
    const lvlIdx = getLevelIndex();
    return {
      lvlIdx,
      lvl: getLevelText(lvlIdx),
      req: getRequired(),
      groups: grps.groups,
      subgroups: grps.subgroups
    };
  }

  function normalizedClassification() {
    const { lvl, req, subgroups } = parts;
    let { groups } = parts;

    let out = lvl;

    const reqGrp = [];
    for (const r of req) {
      if (c12nDef.params_map[r] !== undefined) {
        if (c12nDef.params_map[r].is_required_group !== undefined) {
          if (c12nDef.params_map[r].is_required_group) {
            reqGrp.push(r);
          }
        }
      }
    }

    for (const rg of reqGrp) {
      req.splice(req.indexOf(rg), 1);
    }

    if (req.length > 0) {
      out += `//${req.join('/')}`;
    }
    if (reqGrp.length > 0) {
      out += `//${reqGrp.join('/')}`;
    }

    if (groups.length > 0) {
      if (reqGrp.length > 0) {
        out += '/';
      } else {
        out += '//';
      }

      if (groups.length === 1) {
        const group = groups[0];
        if (c12nDef.params_map[group] !== undefined) {
          if (c12nDef.params_map[group].solitary_display_name !== undefined) {
            out += c12nDef.params_map[group].solitary_display_name;
          } else {
            out += `REL TO ${group}`;
          }
        } else {
          out += `REL TO ${group}`;
        }
      } else {
        if (format === 'short' || isMobile) {
          for (const alias in c12nDef.groups_aliases) {
            if ({}.hasOwnProperty.call(c12nDef.groups_aliases, alias)) {
              const values = c12nDef.groups_aliases[alias];
              if (values.length > 1) {
                if (JSON.stringify(values.sort()) === JSON.stringify(groups)) {
                  groups = [alias];
                }
              }
            }
          }
        }
        out += `REL TO ${groups.join(', ')}`;
      }
    }

    if (subgroups.length > 0) {
      if (groups.length > 0 || reqGrp.length > 0) {
        out += '/';
      } else {
        out += '//';
      }
      out += subgroups.join('/');
    }

    return out;
  }

  const computeColor = (): PossibleColors => {
    const colorMap = c12nDef.levels_styles_map[parts.lvl];
    if (colorMap === undefined || colorMap === null) {
      return 'default';
    }
    const color = colorMap.color || colorMap.label.replace('label-', '');
    if (!ColorArray.includes(color)) {
      return 'default';
    }

    return color;
  };

  const skelheight = {
    medium: '3rem',
    small: '2rem',
    tiny: '1.5rem'
  };

  const useClassification = () => {
    const newC12n = normalizedClassification();
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
          label={normalizedClassification()}
          onClick={type === 'picker' ? () => setShowPicker(true) : null}
        />

        <Dialog fullScreen={isMobile} fullWidth open={showPicker} onClose={useClassification}>
          <DialogTitle>
            <CustomChip
              type="classification"
              variant={type === 'text' ? 'outlined' : 'default'}
              size={size}
              color={computeColor()}
              className={classes.classification}
              label={normalizedClassification()}
            />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
