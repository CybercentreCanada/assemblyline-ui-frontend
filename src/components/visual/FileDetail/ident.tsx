import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Autocomplete,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type IdentificationSectionProps = {
  fileinfo: any;
  isArchive?: boolean;
};

const LABELS_COLOR_MAP = {
  info: 'default',
  technique: 'secondary',
  attribution: 'primary'
};

type LabelCategories = {
  info?: string[];
  technique?: string[];
  attribution?: string[];
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo, isArchive = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [labels, setLabels] = useState<LabelCategories>(null);
  const [isEditingLabels, setIsEditingLabels] = useState<boolean>(false);

  const sortingLabels = useCallback(
    (data: LabelCategories): LabelCategories =>
      Object.fromEntries(
        Object.entries(data).map(([category, l]: [string, string[]]) => [
          category,
          l.sort((a, b) => a.localeCompare(b))
        ])
      ),
    []
  );

  useEffect(() => {
    if (!fileinfo || !('label_categories' in fileinfo)) return;
    setLabels(sortingLabels(fileinfo.label_categories));
  }, [fileinfo, sortingLabels]);

  const handleSaveLabels = useCallback(
    data => {
      if (!fileinfo) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/label/${fileinfo.sha256}/`,
        body: { ...data },
        onSuccess: api_data => {
          showSuccessMessage(t('labels.success'));
          setLabels(sortingLabels(api_data.api_response?.response?.label_categories));
          setIsEditingLabels(v => !v);
        },
        onFailure(api_data) {
          showErrorMessage(api_data.api_response);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileinfo?.sha256, showErrorMessage, showSuccessMessage, sortingLabels, t]
  );

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('identification')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>MD5</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.md5 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA1</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.sha1 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA256</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.sha256 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SSDEEP</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.ssdeep : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('size')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <span>
                      {fileinfo.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(fileinfo.size)})</span>
                    </span>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.type : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('mime')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.mime : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('magic')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.magic : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('entropy')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? fileinfo.entropy : <Skeleton />}
                </Grid>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>{t('labels')}</span>
                  {!isEditingLabels && (
                    <IconButton
                      children={<CreateOutlinedIcon fontSize="small" />}
                      size="small"
                      onClick={() => setIsEditingLabels(v => !v)}
                    />
                  )}
                  {isEditingLabels && (
                    <IconButton
                      children={<SaveOutlinedIcon fontSize="small" />}
                      size="small"
                      onClick={() => handleSaveLabels(labels)}
                    />
                  )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <>
                      <Collapse in={!isEditingLabels} timeout="auto">
                        <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                          {labels &&
                            ['attribution', 'technique', 'info'].map(
                              category =>
                                category in labels &&
                                labels[category].map((label, i) => (
                                  <CustomChip
                                    key={i}
                                    wrap
                                    variant="outlined"
                                    size="tiny"
                                    type="rounded"
                                    color={category in LABELS_COLOR_MAP ? LABELS_COLOR_MAP[category] : 'primary'}
                                    label={label}
                                    style={{ height: 'auto', minHeight: '20px' }}
                                  />
                                ))
                            )}
                        </div>
                      </Collapse>
                      <Collapse in={isEditingLabels} timeout="auto">
                        <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                          {labels &&
                            ['attribution', 'technique', 'info'].map(category => (
                              <Autocomplete
                                key={category}
                                options={[]}
                                multiple
                                fullWidth
                                freeSolo
                                value={labels[category]}
                                onChange={(e, newValue) => setLabels(l => ({ ...l, [category]: newValue }))}
                                renderInput={p => <TextField {...p} variant="standard" />}
                                renderTags={(value: readonly string[], getTagProps) =>
                                  value.map((option: string, index: number) => (
                                    <CustomChip
                                      key={`${category}-${index}`}
                                      component="div"
                                      wrap
                                      variant="outlined"
                                      size="small"
                                      type="rounded"
                                      color={category in LABELS_COLOR_MAP ? LABELS_COLOR_MAP[category] : 'primary'}
                                      label={option}
                                      style={{ height: 'auto', minHeight: '20px' }}
                                      {...getTagProps({ index })}
                                    />
                                  ))
                                }
                              />
                            ))}
                        </div>
                      </Collapse>
                    </>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [fileinfo, isEditingLabels, labels, sp2, t, theme]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
