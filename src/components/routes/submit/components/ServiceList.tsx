import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useALContext from 'components/hooks/useALContext';
import { SelectedService } from 'components/models/base/service';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/settings';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../form';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

type ItemProps = {
  cat_id: string;
  category: SelectedService;
};

const Item: React.FC<ItemProps> = React.memo(({ cat_id, category }) => {
  const theme = useTheme();

  return (
    <>
      <ListItem
        key={cat_id}
        secondaryAction={
          <Checkbox
            edge="end"
            // onChange={handleToggle(value)}
            // checked={checked.includes(value)}

            inputProps={{ 'aria-labelledby': category.name }}
          />
        }
        disablePadding
        sx={{ marginTop: theme.spacing(1) }}
      >
        <ListItemButton>
          <ListItemText id={cat_id} primary={category.name} primaryTypographyProps={{ color: 'textSecondary' }} />
        </ListItemButton>
      </ListItem>

      {category.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((service, svr_id) => (
          <ListItem
            key={`${cat_id}-${svr_id}`}
            secondaryAction={
              <Checkbox
                edge="end"
                // onChange={handleToggle(value)}
                // checked={checked.includes(value)}
                inputProps={{ 'aria-labelledby': service.name }}
              />
            }
            disablePadding
            sx={
              {
                // borderLeft: `1px solid ${theme.palette.primary.main}`
              }
            }
          >
            <ListItemButton>
              <ListItemText
                id={`${svr_id}`}
                primary={service.name}
                // primaryTypographyProps={{ color: 'primary.main' }}
                style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
              />
            </ListItemButton>
          </ListItem>
        ))}
    </>
  );
});

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedServiceList = ({ settings = DEFAULT_SETTINGS }: ServiceAccordionProps) => {
  const { t, i18n } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  console.log(settings);

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  return (
    <List
      dense
      sx={{
        // bgcolor: 'background.paper',
        '& ul': { padding: 0 }
      }}
    >
      {settings?.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category, cat_id) => (
          <Item key={cat_id} cat_id={`${cat_id}`} category={category} />
        ))}
    </List>
  );
};

export const ServiceList = React.memo(WrappedServiceList);
