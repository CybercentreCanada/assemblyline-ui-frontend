import { Box, Checkbox, createStyles, FormControlLabel, makeStyles } from '@material-ui/core';
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

function ServiceTreeItemSkel() {
  return (
    <Box display="flex" flexDirection="row">
      <Skeleton style={{ height: '2rem', width: '1.5rem' }} />
      <Skeleton style={{ marginLeft: '1rem', height: '2rem', width: '100%' }} />
    </Box>
  );
}

function ServiceTreeItem({ item, onChange }) {
  const classes = useStyles();
  return (
    <Box display="block">
      <FormControlLabel
        control={
          <Checkbox
            indeterminate={
              item.services ? !item.services.every(e => e.selected) && !item.services.every(e => !e.selected) : false
            }
            checked={item.services ? item.services.some(e => e.selected) : item.selected}
            name="label"
            onChange={() => onChange(item.name, item.category)}
          />
        }
        label={item.name}
        className={classes.item}
      />
      <Box pl={4}>
        {item.services
          ? item.services.map((service, service_id) => {
              return <ServiceTreeItem key={service_id} item={service} onChange={onChange} />;
            })
          : null}
      </Box>
    </Box>
  );
}

export default function ServiceTree({ settings, setSettings, setModified = null }) {
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
    <Masonry breakpointCols={bp} className="m-grid" columnClassName="m-grid_column">
      {settings.services.map((category, cat_id) => {
        return <ServiceTreeItem key={cat_id} item={category} onChange={handleServiceChange} />;
      })}
    </Masonry>
  ) : (
    <Masonry breakpointCols={bp} className="m-grid" columnClassName="m-grid_column">
      <Box>
        <ServiceTreeItemSkel />
        <Box pl={4}>
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
        </Box>
      </Box>
      <Box>
        <ServiceTreeItemSkel />
        <Box pl={4}>
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
        </Box>
      </Box>
      <Box>
        <ServiceTreeItemSkel />
        <Box pl={4}>
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
          <ServiceTreeItemSkel />
        </Box>
      </Box>
    </Masonry>
  );
}
