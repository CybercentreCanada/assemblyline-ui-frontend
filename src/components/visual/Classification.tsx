import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import { CustomUser } from 'components/hooks/useMyUser';
import CustomChip, { ColorArray, PossibleColors } from 'components/visual/CustomChip';
import React from 'react';

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
  const { user: currentUser } = useUser<CustomUser>();
  const { classification: c12nDef } = useALContext();
  const parts =
    currentUser.c12n_enforcing && c12n
      ? getParts()
      : {
          lvlIdx: '',
          req: [],
          groups: [],
          subgroups: []
        };
  const levelText = currentUser.c12n_enforcing && c12n ? getLevelText(parts.lvlIdx) : '';
  const textType = type === 'text';

  function getLevelText(lvl) {
    let text = null;
    if (c12nDef != null) {
      text = c12nDef.levels_map[lvl.toString()];
    }

    if (text === undefined || text == null) {
      text = '';
    }

    if (format === 'long') {
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

    if (format === 'long') {
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
      for (const t of tempGroup) {
        groups = groups.concat(t.trim().split('/'));
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

    if (format === 'long') {
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
    return {
      lvlIdx: getLevelIndex(),
      req: getRequired(),
      groups: grps.groups,
      subgroups: grps.subgroups
    };
  }

  function normalizeClassification() {
    const { req, subgroups } = parts;
    let { groups } = parts;

    let out = levelText;

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
        if (format === 'short') {
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
    const colorMap = c12nDef.levels_styles_map[levelText];
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

  const showPicker = event => {
    // Obvisouly do more!
    setClassification('TLP:GREEN');
  };
  // Build chip based on computed values
  return currentUser.c12n_enforcing ? (
    c12nDef && c12n ? (
      <CustomChip
        type="classification"
        variant={textType ? 'outlined' : 'default'}
        size={size}
        color={computeColor()}
        className={classes.classification}
        label={normalizeClassification()}
        onClick={type === 'picker' ? showPicker : null}
      />
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
