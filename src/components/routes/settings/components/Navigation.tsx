import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SelectedService } from 'components/models/base/service';
import { useForm } from 'components/routes/settings/contexts/form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const Navigation = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  const fileSources = useMemo<string[]>(
    () =>
      Object.values(configuration?.submission?.file_sources || {})
        .flatMap(file => file?.sources)
        .filter((value, index, array) => value && array.indexOf(value) === index)
        .sort(),
    [configuration]
  );

  return (
    <List dense sx={{ '& ul': { padding: 0 } }}>
      <ListItem disablePadding sx={{ marginTop: theme.spacing(1) }}>
        <ListItemButton
          onClick={() => {
            const element = document.getElementById(`content`);
            element.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ListItemText
            primary={t('content')}
            primaryTypographyProps={{ color: 'textSecondary', textTransform: 'uppercase' }}
          />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            const element = document.getElementById(`submissions`);
            element.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ListItemText
            primary={t('submissions')}
            primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
          />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            const element = document.getElementById(`interface`);
            element.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ListItemText
            primary={t('interface')}
            primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
          />
        </ListItemButton>
      </ListItem>

      {fileSources.length > 0 ? (
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              const element = document.getElementById(`submissions.default_external_sources`);
              element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ListItemText
              primary={t('submissions.default_external_sources')}
              primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
            />
          </ListItemButton>
        </ListItem>
      ) : null}

      <form.Field
        name="settings.services"
        mode="array"
        children={({ state: categories }) =>
          categories.value.map((category, cat_id) => (
            <div key={cat_id} style={{ display: 'contents' }}>
              <form.Subscribe
                selector={state => [state.values.settings.services[cat_id].selected]}
                children={([selected]) => (
                  <ListItem
                    key={cat_id}
                    disablePadding
                    sx={{ marginTop: theme.spacing(1) }}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        inputProps={{ 'aria-labelledby': category.name }}
                        checked={selected}
                        onChange={() =>
                          form.setStore(s => {
                            if (selected) {
                              s.settings.services[cat_id].selected = false;
                              s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
                                ...srv,
                                selected: false
                              }));
                            } else {
                              s.settings.services[cat_id].selected = true;
                              s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
                                ...srv,
                                selected: true
                              }));
                            }

                            return s;
                          })
                        }
                      />
                    }
                  >
                    <ListItemButton
                      onClick={() => {
                        const element = document.getElementById(`${category.name}`);
                        element.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <ListItemText primary={category.name} primaryTypographyProps={{ color: 'textSecondary' }} />
                    </ListItemButton>
                  </ListItem>
                )}
              />

              <form.Field
                name={`settings.services[${cat_id}].services`}
                mode="array"
                children={props => {
                  const services = props.state.value as unknown as SelectedService[];
                  return services.map((service, svr_id) => (
                    <form.Field
                      key={`${cat_id}-${svr_id}`}
                      name={`settings.services[${cat_id}].services[${svr_id}].selected`}
                      children={svr_props => {
                        const selected = svr_props.state.value as unknown as boolean;
                        return (
                          <ListItem
                            disablePadding
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                inputProps={{ 'aria-labelledby': service.name }}
                                checked={selected}
                                onChange={() =>
                                  form.setStore(s => {
                                    if (selected) {
                                      s.settings.services[cat_id].selected = false;
                                      s.settings.services[cat_id].services[svr_id].selected = false;
                                    } else {
                                      s.settings.services[cat_id].services[svr_id].selected = true;
                                      s.settings.services[cat_id].selected = s.settings.services[cat_id].services.every(
                                        srv => srv.selected
                                      );
                                    }
                                    return s;
                                  })
                                }
                              />
                            }
                          >
                            <ListItemButton
                              onClick={() => {
                                const element = document.getElementById(`${category.name} - ${service.name}`);
                                element.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              <ListItemText
                                id={`${svr_id}`}
                                primary={service.name}
                                style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      }}
                    />
                  ));
                }}
              />
            </div>
          ))
        }
      />
    </List>
  );
};
