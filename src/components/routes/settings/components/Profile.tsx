import { Button, List, ListItem, MenuItem, Select, Skeleton, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/contexts/form';

export const ProfileSection = () => {
  const theme = useTheme();
  const { configuration } = useALContext();

  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading]}
      children={([loading]) => (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            paddingBottom: theme.spacing(2),
            backgroundColor: theme.palette.background.default
          }}
        >
          <List disablePadding sx={{ bgcolor: 'background.paper' }}>
            <ListItem sx={{ columnGap: theme.spacing(2), alignItems: 'stretch' }}>
              {loading ? (
                <Skeleton height={40} style={{ width: '100%' }} />
              ) : (
                <form.Subscribe
                  selector={state => [state.values.state.profile]}
                  children={([profile]) => (
                    <Select
                      value={profile}
                      size="small"
                      fullWidth
                      onChange={event => {
                        form.setStore(s => {
                          s.state.profile = event.target.value;
                          return s;
                        });
                      }}
                    >
                      {Object.keys(configuration.submission.profiles).map((item, i) => (
                        <MenuItem key={`${item}-${i}`} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              )}

              {loading ? (
                <Skeleton height={40} style={{ width: '100%' }} />
              ) : (
                <form.Subscribe
                  selector={state => [state.values.state.hide]}
                  children={([hide]) => (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        form.setStore(s => {
                          s.state.hide = !hide;
                          return s;
                        });
                      }}
                    >
                      {hide ? 'Show' : 'Hide'}
                    </Button>
                  )}
                />
              )}
            </ListItem>
          </List>
        </div>
      )}
    />
  );
};
