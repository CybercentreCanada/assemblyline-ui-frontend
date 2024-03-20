import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Button, IconButton, Paper, Stack, TableContainer, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageCenter from 'commons/components/pages/PageCenter';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import AssemblylineIcon from 'components/visual/Icons';

const Theme = () => {
  return (
    <PageCenter width="65%" margin={4}>
      <Stack alignItems="center" spacing={2}>
        <Typography variant="h6">Icons</Typography>
        <AssemblylineIcon sx={{ width: '192px', height: '192px' }} />

        <Typography variant="h6">Text</Typography>
        <Stack direction="row" spacing={1}>
          <Typography color="textPrimary">This is what the default text will look like</Typography>
          <Typography color="textSecondary">Alternate text will look like that</Typography>
          <Typography color="primary">Text in primary color will look like this</Typography>
          <Typography color="secondary">Text in secondary color like that</Typography>
        </Stack>
        <Typography variant="h6">Buttons</Typography>
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
        <Typography variant="h6">Icon Buttons</Typography>
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
        <Typography variant="h6">Custom Chips</Typography>
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
        <Typography variant="h6">Classifications</Typography>
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
        <Typography variant="h6">Forms</Typography>
        <Stack direction="row" spacing={1}>
          {['outlined' as 'outlined', 'standard' as 'standard', 'filled' as 'filled'].map(val => (
            <TextField variant={val} size="small" placeholder={val} />
          ))}
        </Stack>
        <Typography variant="h6">Tables</Typography>
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
      </Stack>
    </PageCenter>
  );
};

export default Theme;
