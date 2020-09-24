import { Box, Checkbox, createStyles, FormControlLabel, makeStyles, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Skeleton from '@material-ui/lab/Skeleton';
import React from 'react';
import Masonry from 'react-masonry-css';

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
    <Box display="flex" flexDirection="row" pb={1}>
      <Skeleton style={{ height: size === 'medium' ? '2.5rem' : '2rem', width: '1.5rem' }} />
      <Skeleton style={{ marginLeft: '1rem', height: size === 'medium' ? '2.5rem' : '2rem', width: '100%' }} />
    </Box>
  );
}

type ServiceTreeItemProps = {
  item: any;
  onChange: (name: string, category: string) => void;
  size: 'medium' | 'small';
};

function ServiceTreeItem({ item, onChange, size = 'medium' as 'medium' }: ServiceTreeItemProps) {
  const classes = useStyles();
  return (
    <Box display="block" pl={1}>
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
        label={<Typography variant={size === 'small' ? 'body2' : 'body1'}>{item.name}</Typography>}
        className={classes.item}
      />
      <Box pl={4}>
        {item.services
          ? item.services.map((service, service_id) => {
              return <ServiceTreeItem size={size} key={service_id} item={service} onChange={onChange} />;
            })
          : null}
      </Box>
    </Box>
  );
}

type SkelItemsProps = {
  size: 'medium' | 'small';
};

function SkelItems({ size }: SkelItemsProps) {
  return (
    <>
      <Box>
        <ServiceTreeItemSkel size={size} />
        <Box pl={4}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </Box>
      </Box>
      <Box>
        <ServiceTreeItemSkel size={size} />
        <Box pl={4}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </Box>
      </Box>
      <Box>
        <ServiceTreeItemSkel size={size} />
        <Box pl={4}>
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
          <ServiceTreeItemSkel size={size} />
        </Box>
      </Box>
    </>
  );
}

type ServiceTreeProps = {
  settings: any;
  setSettings: (settings: any) => void;
  setModified?: (isModified: boolean) => void;
  useMasonery?: boolean;
  size?: 'medium' | 'small';
};

export default function ServiceTree({
  settings,
  setSettings,
  setModified = null,
  useMasonery = true,
  size = 'medium' as 'medium'
}: ServiceTreeProps) {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const bp = xs ? 1 : sm ? 2 : 3;

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

  return settings ? (
    useMasonery ? (
      <Masonry breakpointCols={bp} className="m-grid" columnClassName="m-grid_column">
        {settings.services.map((category, cat_id) => {
          return <ServiceTreeItem size={size} key={cat_id} item={category} onChange={handleServiceChange} />;
        })}
      </Masonry>
    ) : (
      <Box>
        {settings.services.map((category, cat_id) => {
          return <ServiceTreeItem size={size} key={cat_id} item={category} onChange={handleServiceChange} />;
        })}
      </Box>
    )
  ) : useMasonery ? (
    <Masonry breakpointCols={bp} className="m-grid" columnClassName="m-grid_column">
      <SkelItems size={size} />
    </Masonry>
  ) : (
    <SkelItems size={size} />
  );
}
