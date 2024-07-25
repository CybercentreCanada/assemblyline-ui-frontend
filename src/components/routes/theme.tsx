import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Button, IconButton, Stack, Switch, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageCenter from 'commons/components/pages/PageCenter';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import AssemblylineIcon from 'components/visual/Icons';
import Priority from 'components/visual/Priority';
import SignatureStatus from 'components/visual/SignatureStatus';
import SubmissionState from 'components/visual/SubmissionState';
import TextVerdict from 'components/visual/TextVerdict';
import Verdict from 'components/visual/Verdict';
import { AlertExtendedScan, AlertPriority, AlertStatus } from './alerts/components/Components';

const Theme = () => {
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <Stack alignItems="center" spacing={2}>
        <Typography variant="h4">{'Icons'}</Typography>
        <AssemblylineIcon sx={{ width: '192px', height: '192px' }} />

        <Typography variant="h4">{'Text'}</Typography>
        <Stack direction="row" spacing={1}>
          <Typography color="textPrimary">{'This is what the default text will look like'}</Typography>
          <Typography color="textSecondary">{'Alternate text will look like that'}</Typography>
          <Typography color={theme.palette.action.disabled}>{'Disabled text will look like this'}</Typography>
          <Typography color="primary">{'Text in primary color will look like this'}</Typography>
          <Typography color="secondary">{'Text in secondary color like that'}</Typography>
          <Typography color="error">{'Text in error will look like this'}</Typography>
        </Stack>

        <Typography variant="h4">{'Buttons'}</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <Button key={i} variant="contained" color={val}>
              {val}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <Button key={i} variant="outlined" color={val}>
              {val}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <Button key={i} variant="text" color={val}>
              {val}
            </Button>
          ))}
        </Stack>

        <Typography variant="h4">{'Icon Buttons'}</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <IconButton key={i} color={val}>
              <FileOpenIcon />
            </IconButton>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <IconButton key={i} color={val}>
              <AddPhotoAlternateOutlinedIcon />
            </IconButton>
          ))}
        </Stack>

        <Typography variant="h4">{'Switches'}</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <Switch key={i} color={val} defaultChecked />
          ))}
          <Switch />
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <Switch key={i} color={val} defaultChecked disabled />
          ))}
          <Switch disabled />
        </Stack>

        <Typography variant="h4">{'Custom Chips'}</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <CustomChip key={i} color={val} label={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <CustomChip key={i} color={val} label={val} onClick={() => null} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {[
            'primary' as const,
            'secondary' as const,
            'default' as const,
            'error' as const,
            'info' as const,
            'success' as const,
            'warning' as const
          ].map((val, i) => (
            <CustomChip key={i} variant="outlined" color={val} label={val} />
          ))}
        </Stack>

        <Typography variant="h4">{'Classifications'}</Typography>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map((val, i) => (
            <Classification key={i} type="outlined" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map((val, i) => (
            <Classification key={i} type="pill" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map((val, i) => (
            <Classification key={i} type="picker" format="long" c12n={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['TLP:C', 'TLP:G', 'TLP:A'].map((val, i) => (
            <Classification key={i} type="text" format="long" c12n={val} />
          ))}
        </Stack>

        <Typography variant="h4">{'Verdicts'}</Typography>
        <Stack direction="row" spacing={1}>
          {[
            'info' as const,
            'safe' as const,
            'suspicious' as const,
            'highly_suspicious' as const,
            'malicious' as const
          ].map((val, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <Verdict verdict={val} />
              <TextVerdict verdict={val} />
            </div>
          ))}
        </Stack>

        <Typography variant="h4">{'Submission Priority'}</Typography>
        <Stack direction="row" spacing={1}>
          {[0, 100, 200, 300, 500, 1000, 1500].map((val, i) => (
            <Priority key={i} priority={val} />
          ))}
        </Stack>

        <Typography variant="h4">{'Submission State'}</Typography>
        <Stack direction="row" spacing={1}>
          {['error', 'completed', 'submitted'].map((val, i) => (
            <SubmissionState key={i} state={val} />
          ))}
        </Stack>

        <Typography variant="h4">{'Signature Status'}</Typography>
        <Stack direction="row" spacing={1}>
          {['DEPLOYED' as const, 'NOISY' as const, 'DISABLED' as const].map((val, i) => (
            <SignatureStatus key={i} status={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['DEPLOYED' as const, 'NOISY' as const, 'DISABLED' as const].map((val, i) => (
            <SignatureStatus key={i} status={val} variant="outlined" />
          ))}
        </Stack>

        <Typography variant="h4">{'Alert Extended Scans'}</Typography>
        <Stack direction="row" spacing={1}>
          {['incomplete', 'completed', 'submitted', 'skipped'].map((val, i) => (
            <AlertExtendedScan key={i} name={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['incomplete', 'completed', 'submitted', 'skipped'].map((val, i) => (
            <AlertExtendedScan key={i} name={val} withChip />
          ))}
        </Stack>

        <Typography variant="h4">{'Alert Priority'}</Typography>
        <Stack direction="row" spacing={1}>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((val, i) => (
            <AlertPriority key={i} name={val} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((val, i) => (
            <AlertPriority key={i} name={val} withChip />
          ))}
        </Stack>

        <Typography variant="h4">{'Alert Status'}</Typography>
        <Stack direction="row" spacing={1}>
          {['TRIAGE', 'MALICIOUS', 'ASSESS'].map((val, i) => (
            <AlertStatus key={i} name={val} />
          ))}
        </Stack>
      </Stack>
    </PageCenter>
  );
};

export default Theme;
