import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Tab,
  TableContainer,
  Tabs,
  TextField,
  useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import PageCenter from 'commons/components/pages/PageCenter';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import AssemblylineIcon from 'components/visual/Icons';

const Theme = () => {
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <Stack alignItems="center" spacing={2}>
        <Typography variant="h4">Icons</Typography>
        <AssemblylineIcon sx={{ width: '192px', height: '192px' }} />

        <Typography variant="h4">Text</Typography>
        <Stack direction="row" spacing={1}>
          <Typography color="textPrimary">This is what the default text will look like</Typography>
          <Typography color="textSecondary">Alternate text will look like that</Typography>
          <Typography color={theme.palette.action.disabled}>Disabled text will look like this</Typography>
          <Typography color="primary">Text in primary color will look like this</Typography>
          <Typography color="secondary">Text in secondary color like that</Typography>
          <Typography color="error">Text in error will look like this</Typography>
        </Stack>

        <Typography variant="h4">Buttons</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <Button variant="contained" color={val}>
              {val}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <Button variant="outlined" color={val}>
              {val}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <Button variant="text" color={val}>
              {val}
            </Button>
          ))}
        </Stack>

        <Typography variant="h4">Icon Buttons</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <IconButton color={val}>
              <FileOpenIcon />
            </IconButton>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <IconButton color={val}>
              <AddPhotoAlternateOutlinedIcon />
            </IconButton>
          ))}
        </Stack>

        <Typography variant="h4">Custom Chips</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <CustomChip color={val} label={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <CustomChip type="rounded" color={val} label={val} onClick={() => null} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <CustomChip variant="outlined" color={val} label={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <CustomChip variant="outlined" type="rounded" color={val} label={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <CustomChip variant="outlined" type="square" color={val} label={val} />
          ))}
        </Stack>

        <Typography variant="h4">Classifications</Typography>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map(val => (
            <Classification type="outlined" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map(val => (
            <Classification type="pill" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map(val => (
            <Classification type="picker" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map(val => (
            <Classification type="text" format="long" c12n={val} />
          ))}
        </Stack>

        <Typography variant="h4">Forms</Typography>
        <Stack direction="row" spacing={1}>
          {['outlined' as 'outlined', 'standard' as 'standard', 'filled' as 'filled'].map(val => (
            <TextField variant={val} size="small" placeholder={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          {['outlined' as 'outlined', 'standard' as 'standard', 'filled' as 'filled'].map(val => (
            <FormControl fullWidth>
              <InputLabel>{val}</InputLabel>
              <Select label={val} variant={val} fullWidth>
                <MenuItem value={1}>Value 1</MenuItem>
                <MenuItem value={2}>Value 1</MenuItem>
                <MenuItem value={3}>Value 1</MenuItem>
              </Select>
            </FormControl>
          ))}
        </Stack>
        <Box sx={{ width: '100%' }}>
          <Divider />
        </Box>
        <CircularProgress variant="indeterminate" />
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="indeterminate" />
        </Box>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Slider defaultValue={30} />
          <Slider disabled defaultValue={20} />
        </Stack>
        <Skeleton sx={{ width: '100%' }}></Skeleton>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <Switch color={val} defaultChecked />
          ))}
          <Switch />
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as 'primary',
            'secondary' as 'secondary',
            'default' as 'default',
            'error' as 'error',
            'info' as 'info',
            'success' as 'success',
            'warning' as 'warning'
          ].map(val => (
            <Switch color={val} defaultChecked disabled />
          ))}
          <Switch disabled />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Checkbox defaultChecked />
          <Checkbox />
          <Checkbox disabled />
          <Checkbox checked />
        </Stack>
        <FormControl>
          <FormLabel>Radio Title</FormLabel>
          <RadioGroup defaultValue="radio 2" name="radio-buttons-group">
            {['radio 1', 'radio 2', 'radio 3'].map(val => (
              <FormControlLabel value={val} control={<Radio />} label={val} />
            ))}
            <FormControlLabel disabled value="disabled" control={<Radio />} label="disabled" />
          </RadioGroup>
        </FormControl>

        <Rating name="simple-controlled" value={2} />

        <Typography variant="h4">Tables</Typography>
        <TableContainer component={Paper}>
          <DivTable>
            <DivTableHead>
              <DivTableRow>
                <DivTableCell>Head 1</DivTableCell>
                <DivTableCell>Head 2</DivTableCell>
                <DivTableCell>Head 3</DivTableCell>
                <DivTableCell>Head 4</DivTableCell>
              </DivTableRow>
            </DivTableHead>
            <DivTableBody>
              <LinkRow to="#" hover>
                <DivTableCell>Cell 1.1</DivTableCell>
                <DivTableCell>Cell 1.2</DivTableCell>
                <DivTableCell>Cell 1.3</DivTableCell>
                <DivTableCell>Cell 1.4</DivTableCell>
              </LinkRow>
            </DivTableBody>
            <DivTableBody>
              <LinkRow to="#" hover>
                <DivTableCell>Cell 2.1</DivTableCell>
                <DivTableCell>Cell 2.2</DivTableCell>
                <DivTableCell>Cell 2.3</DivTableCell>
                <DivTableCell>Cell 2.4</DivTableCell>
              </LinkRow>
            </DivTableBody>
            <DivTableBody>
              <LinkRow to="#" hover>
                <DivTableCell>Cell 3.1</DivTableCell>
                <DivTableCell>Cell 3.2</DivTableCell>
                <DivTableCell>Cell 3.3</DivTableCell>
                <DivTableCell>Cell 3.4</DivTableCell>
              </LinkRow>
            </DivTableBody>
          </DivTable>
        </TableContainer>

        <Typography variant="h4">Alerts</Typography>
        <Stack direction="row" spacing={1}>
          {['error' as 'error', 'info' as 'info', 'success' as 'success', 'warning' as 'warning'].map(val => (
            <Alert severity={val}>
              <AlertTitle>{val}</AlertTitle>
              This is a {val} Alert with a title.
            </Alert>
          ))}
        </Stack>

        <Typography variant="h4">Containers</Typography>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Card sx={{ width: '100%', height: '100px' }}>Card</Card>
          <Paper sx={{ width: '100%', height: '100px' }}>Paper</Paper>
        </Stack>

        <Typography variant="h4">Navigation</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={2} aria-label="basic tabs example">
            <Tab label="Item One" value={1} />
            <Tab label="Item Two" value={2} />
            <Tab label="Item Three" value={3} />
          </Tabs>
        </Box>

        <Typography variant="h4">Assemblyline results</Typography>
      </Stack>
    </PageCenter>
  );
};

export default Theme;
