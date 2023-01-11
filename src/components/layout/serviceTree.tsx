import { Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';
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
  size: 'medium' | 'small';
};

function ServiceTreeItem({ item, onChange, size = 'medium' as 'medium' }: ServiceTreeItemProps) {
  const classes = useStyles();
  const theme = useTheme();
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);
  return (
    <div
      style={{
        paddingLeft: sp1,
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid'
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            size={size}
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
            {item.is_external && (
              <HiOutlineExternalLink
                style={{ fontSize: 'large', verticalAlign: 'middle', marginLeft: theme.spacing(2) }}
              />
            )}
          </Typography>
        }
        className={classes.item}
      />
      <div style={{ paddingLeft: sp4 }}>
        {item.services
          ? item.services.map((service, service_id) => (
              <ServiceTreeItem size={size} key={service_id} item={service} onChange={onChange} />
            ))
          : null}
      </div>
    </div>
  );
}

type SkelItemsProps = {
  size: 'medium' | 'small';
  spacing: number;
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
  size?: 'medium' | 'small';
};

const ServiceTree: React.FC<ServiceTreeProps> = ({
  settings,
  setSettings,
  setModified = null,
  compressed = false,
  size = 'medium' as 'medium'
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
            <ServiceTreeItem size={size} key={cat_id} item={category} onChange={handleServiceChange} />
          ))
      ) : (
        <SkelItems size={size} spacing={sp4} />
      )}
    </div>
  );
};

export default ServiceTree;
