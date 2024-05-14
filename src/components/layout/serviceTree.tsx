import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Checkbox, Collapse, FormControlLabel, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Service from 'components/layout/service';
import React, { useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';

const useStyles = makeStyles(theme =>
  createStyles({
    item: {
      width: '100%',
      '&:hover': {
        background: theme.palette.action.hover
      }
    }
  })
);

type ServiceTreeItemSkelProps = {
  size: 'medium' | 'small';
};

function ServiceTreeItemSkel({ size = 'medium' }: ServiceTreeItemSkelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '8px' }}>
      <Skeleton style={{ height: size === 'medium' ? '2.5rem' : '2rem', width: '1.5rem' }} />
      <Skeleton style={{ marginLeft: '1rem', height: size === 'medium' ? '2.5rem' : '2rem', width: '100%' }} />
    </div>
  );
}

type ServiceTreeItemProps = {
  item: any;
  onChange: (name: string, category: string) => void;
  disabled?: boolean;
  size: 'medium' | 'small';
  service_spec;
  setParam;
};

function ServiceTreeItem({
  item,
  onChange,
  disabled = false,
  size = 'medium' as 'medium',
  service_spec,
  setParam
}: ServiceTreeItemProps) {
  const classes = useStyles();
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const [open, setOpen] = useState(false);

  function hasParams(name) {
    for (const svc of service_spec) {
      if (svc.name === name && svc.params) {
        return true;
      }
    }
  }

  function getService(name) {
    for (const svc of service_spec) {
      if (svc.name === name) {
        return svc;
      }
    }
  }

  function getServiceIndex(name) {
    for (const [key, svc] of service_spec.entries()) {
      if (svc.name === name) {
        return key;
      }
    }
  }
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid',
        paddingRight: sp2
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              size={size}
              disabled={disabled}
              indeterminate={
                item.services ? !item.services.every(e => e.selected) && !item.services.every(e => !e.selected) : false
              }
              checked={item.services ? item.services.some(e => e.selected) : item.selected}
              name="label"
              onChange={() => onChange(item.name, item.category)}
            />
          }
          label={
            <Typography variant={size === 'small' ? 'body2' : 'body1'}>
              {item.name}
              {item.description && (
                <Tooltip title={item.description} placement="top">
                  <InfoOutlinedIcon
                    style={{ fontSize: 'large', verticalAlign: 'middle', marginLeft: theme.spacing(2) }}
                  />
                </Tooltip>
              )}
              {item.is_external && (
                <HiOutlineExternalLink
                  style={{ fontSize: 'large', verticalAlign: 'middle', marginLeft: theme.spacing(2) }}
                />
              )}
            </Typography>
          }
          className={!disabled ? classes.item : null}
        />
        {setParam && hasParams(item.name) && (
          <IconButton onClick={() => setOpen(!open)} disableRipple>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </div>
      <div style={{ paddingLeft: sp2 }}>
        {setParam && (
          <Collapse in={open}>
            {hasParams(item.name) && !disabled && (
              <Service
                disabled={disabled}
                setParam={setParam}
                service={getService(item.name)}
                idx={getServiceIndex(item.name)}
              />
            )}
          </Collapse>
        )}
        {item.services
          ? item.services.map((service, service_id) => (
              <ServiceTreeItem
                disabled={disabled}
                size={size}
                key={service_id}
                item={service}
                onChange={onChange}
                service_spec={service_spec}
                setParam={setParam}
              />
            ))
          : null}
      </div>
    </div>
  );
}

type SkelItemsProps = {
  size: 'medium' | 'small';
  spacing: number | string;
};

function SkelItems({ size, spacing }: SkelItemsProps) {
  return (
    <>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'inline-block',
          pageBreakInside: 'avoid'
        }}
      >
        <ServiceTreeItemSkel size={size} />
        <div style={{ paddingLeft: spacing }}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </div>
      </div>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'inline-block',
          pageBreakInside: 'avoid'
        }}
      >
        <ServiceTreeItemSkel size={size} />
        <div style={{ paddingLeft: spacing }}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </div>
      </div>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'inline-block',
          pageBreakInside: 'avoid'
        }}
      >
        <ServiceTreeItemSkel size={size} />
        <div style={{ paddingLeft: spacing }}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </div>
      </div>
    </>
  );
}

type ServiceTreeProps = {
  settings: any;
  setSettings: (settings: any) => void;
  setModified?: (isModified: boolean) => void;
  compressed?: boolean;
  disabled?: boolean;
  size?: 'medium' | 'small';
  setParam?: (service_idx, param_idx, p_value) => void;
};

const ServiceTree: React.FC<ServiceTreeProps> = ({
  settings,
  setSettings,
  setModified = null,
  compressed = false,
  disabled = false,
  size = 'medium' as 'medium',
  setParam
}) => {
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  function handleServiceChange(name, category) {
    if (settings) {
      const newServices = settings.services;
      if (category) {
        for (const cat of newServices) {
          if (cat.name === category) {
            for (const srv of cat.services) {
              if (srv.name === name) {
                srv.selected = !srv.selected;
                break;
              }
            }
            cat.selected = cat.services.every(e => e.selected);
            break;
          }
        }
      } else {
        for (const cat of newServices) {
          if (cat.name === name) {
            cat.selected = !cat.selected;
            for (const srv of cat.services) {
              srv.selected = cat.selected;
            }
            break;
          }
        }
      }
      if (setModified) {
        setModified(true);
      }
      setSettings({ ...settings, services: newServices });
    }
  }

  function sortFunc(a, b) {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }

  return (
    <div
      style={
        compressed
          ? {
              paddingTop: sp2,
              paddingBottom: sp2,
              columnWidth: '18rem',
              columnGap: '1rem',
              columnRuleWidth: '1px',
              columnRuleStyle: 'dotted',
              columnRuleColor: theme.palette.divider
            }
          : null
      }
    >
      {settings ? (
        settings.services
          .sort(sortFunc)
          .map((category, cat_id) => (
            <ServiceTreeItem
              disabled={disabled}
              size={size}
              key={cat_id}
              item={category}
              onChange={handleServiceChange}
              service_spec={settings.service_spec}
              setParam={setParam}
            />
          ))
      ) : (
        <SkelItems size={size} spacing={sp4} />
      )}
    </div>
  );
};

export default ServiceTree;
