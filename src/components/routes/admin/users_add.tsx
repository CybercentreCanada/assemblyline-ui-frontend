import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type User = {
  avatar: string;
  email: string;
  identity_id: string;
  groups: string[];
  is_active: boolean;
  type: string[];
  classification: string;
  name: string;
  new_pass: string;
  uname: string;
  api_quota: number;
  submission_quota: number;
  api_daily_quota: number;
  submission_daily_quota: number;
  submission_async_quota: number;
  roles?: string[];
};

const WrappedAddUserPage = () => {
  const { t } = useTranslation(['adminUsers']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  const defaultUser = useMemo(
    () => ({
      avatar: null,
      groups: ['USERS'],
      is_active: true,
      type: ['user'],
      classification: c12nDef.UNRESTRICTED,
      email: '',
      identity_id: '',
      name: '',
      new_pass: '',
      uname: '',
      api_quota: 10,
      submission_quota: 5,
      api_daily_quota: 0,
      submission_daily_quota: 0,
      submission_async_quota: 0
    }),
    [c12nDef.UNRESTRICTED]
  );

  const [newUser, setNewUser] = useState<User>(defaultUser);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const parseNum = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): number => {
    let num = parseInt(event.target.value);
    num = isNaN(num) ? 0 : num;
    return Math.max(0, num);
  }, []);

  const handleTypeChange = useCallback(
    userType => {
      const newRoles = configuration.user.role_dependencies[userType];
      if (newRoles) {
        setNewUser({ ...newUser, type: [userType], roles: [...newRoles] });
      } else {
        setNewUser({ ...newUser, type: [userType] });
      }
    },
    [configuration.user.role_dependencies, newUser]
  );

  const handleAddUser = useCallback(
    (user: User) => {
      if (!currentUser.is_admin) return;
      apiCall({
        url: `/api/v4/user/${user.uname}/`,
        method: 'PUT',
        body: user,
        onSuccess: () => {
          setNewUser(defaultUser);
          setDrawer(false);
          showSuccessMessage(t('newuser.success'));
          window.dispatchEvent(new CustomEvent('reloadUsers'));
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.is_admin, defaultUser, showSuccessMessage, t]
  );

  return !currentUser.is_admin ? null : (
    <>
      <Tooltip title={t('add_user')}>
        <IconButton
          style={{
            color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
          }}
          onClick={() => setDrawer(true)}
          size="large"
        >
          <PersonAddIcon />
        </IconButton>
      </Tooltip>
      <Drawer
        anchor="right"
        open={drawer}
        onClose={() => {
          setNewUser(defaultUser);
          setDrawer(false);
        }}
        slotProps={{
          paper: {
            sx: {
              width: '80%',
              maxWidth: '800px',
              [theme.breakpoints.down('sm')]: {
                width: '100%'
              }
            }
          }
        }}
      >
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton
            onClick={() => {
              setNewUser(defaultUser);
              setDrawer(false);
            }}
            size="large"
          >
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2), paddingBottom: theme.spacing(6) }}>
          <Box mb={3}>
            <Typography variant="h5">{t('newuser.title')}</Typography>
          </Box>
          {c12nDef.enforce && (
            <Box mb={1}>
              <Classification
                type="picker"
                size="medium"
                format="long"
                c12n={newUser.classification}
                setClassification={value => setNewUser({ ...newUser, classification: value })}
                isUser
              />
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t('newuser.uname')}</Typography>
              <TextField
                autoFocus
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, uname: event.target.value }))}
                value={newUser.uname}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t('newuser.name')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, name: event.target.value }))}
                value={newUser.name}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t('newuser.groups')}</Typography>
              <Autocomplete
                sx={{ display: 'block', margin: theme.spacing(2, 0) }}
                multiple
                freeSolo
                size="small"
                options={[]}
                defaultValue={newUser.groups}
                renderInput={params => <TextField {...params} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={index} variant="outlined" label={option} />
                  ))
                }
                onChange={(event, chips) => setNewUser(u => ({ ...u, groups: chips }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.new_pass')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                type="password"
                onChange={event => setNewUser(u => ({ ...u, new_pass: event.target.value }))}
                value={newUser.new_pass}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.email')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, email: event.target.value }))}
                value={newUser.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.identity_id')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, identity_id: event.target.value }))}
                value={newUser.identity_id}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t('newuser.user_type')}</Typography>
              <div>
                {configuration.user.types.map((uType, type_id) => (
                  <CustomChip
                    key={type_id}
                    type="rounded"
                    size="small"
                    color={newUser.type.includes(uType) ? 'primary' : 'default'}
                    disabled={uType === 'custom'}
                    onClick={() => handleTypeChange(uType)}
                    label={t(`user_type.${uType}`)}
                  />
                ))}
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t('newuser.api_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, api_quota: parseNum(event) }))}
                value={String(newUser.api_quota)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t('newuser.api_daily_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, api_daily_quota: parseNum(event) }))}
                value={String(newUser.api_daily_quota)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.submission_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, submission_quota: parseNum(event) }))}
                value={String(newUser.submission_quota)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.submission_async_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, submission_async_quota: parseNum(event) }))}
                value={String(newUser.submission_async_quota)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t('newuser.submission_daily_quota')}</Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => setNewUser(u => ({ ...u, submission_daily_quota: parseNum(event) }))}
                value={String(newUser.submission_daily_quota)}
              />
            </Grid>
          </Grid>
          <Box my={2} textAlign="right">
            <Button
              disabled={loading || !newUser.uname}
              variant="contained"
              color="primary"
              onClick={() => handleAddUser(newUser)}
            >
              {t('newuser.save')}
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: -12,
                    marginLeft: -12
                  }}
                />
              )}
            </Button>
          </Box>
        </div>
      </Drawer>
    </>
  );
};

export const AddUserPage = React.memo(WrappedAddUserPage);
export default AddUserPage;
