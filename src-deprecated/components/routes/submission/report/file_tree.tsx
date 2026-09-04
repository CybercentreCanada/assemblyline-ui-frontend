import { Box, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import type { SubmissionReport } from 'components/models/ui/submission_report';
import Verdict from 'components/visual/Verdict';
import { bytesToSize } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  tree: SubmissionReport['file_tree'];
  important_files: SubmissionReport['important_files'];
};

function FileTree({ tree, important_files }: Props) {
  const theme = useTheme();

  return tree && important_files ? (
    <div>
      {Object.keys(tree).map((f, i) =>
        important_files.indexOf(f) !== -1 ? (
          tree[f].score < 0 ? null : (
            <div key={i} style={{ pageBreakInside: 'avoid' }}>
              <table style={{ borderSpacing: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>
                      <Verdict score={tree[f].score} short mono />
                    </td>
                    <td>
                      <b style={{ fontSize: '110%', wordBreak: 'break-word' }}>{tree[f].name.join(' | ')}</b>
                    </td>
                  </tr>
                  <tr>
                    <td />
                    <td>
                      <Box
                        sx={{
                          fontFamily: 'monospace',
                          color: theme.palette.text.secondary,
                          wordBreak: 'break-word',
                          marginBottom: theme.spacing(1),
                          '@media print': {
                            color: 'rgba(0, 0, 0, 0.54)'
                          }
                        }}
                      >
                        {`${tree[f].sha256} - ${tree[f].type} - `}
                        <b>{tree[f].size}</b>
                        <span style={{ fontWeight: 300 }}> ({bytesToSize(tree[f].size)})</span>
                      </Box>
                    </td>
                  </tr>
                  <tr>
                    <td />
                    <td>
                      <FileTree tree={tree[f].children} important_files={important_files} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        ) : null
      )}
    </div>
  ) : null;
}

function FileTreeSkel() {
  function FileItemSkel() {
    return (
      <>
        <div style={{ display: 'flex' }}>
          <Skeleton style={{ height: '2rem', width: '2rem' }} />
          <Skeleton style={{ height: '2rem', marginLeft: '1rem', flexGrow: 1 }} />
        </div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    );
  }

  return (
    <div>
      <FileItemSkel />
      <div style={{ marginLeft: '2rem' }}>
        <FileItemSkel />
      </div>
    </div>
  );
}

function WrappedFileTreeSection({ report }) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();

  return (
    (!report || report.important_files.length !== 0) && (
      <div style={{ pageBreakInside: 'avoid' }}>
        <div
          style={{
            marginTop: theme.spacing(4),
            pageBreakAfter: 'avoid',
            pageBreakInside: 'avoid'
          }}
        >
          <Typography variant="h6">{t('important_files')}</Typography>
          <Divider
            sx={{
              '@media print': {
                backgroundColor: '#0000001f !important'
              }
            }}
          />
        </div>
        <div
          style={{
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            pageBreakBefore: 'avoid',
            pageBreakInside: 'avoid'
          }}
        >
          {report ? (
            <FileTree
              tree={report?.file_tree[report?.files[0]?.sha256]?.children}
              important_files={report?.important_files}
            />
          ) : (
            <FileTreeSkel />
          )}
        </div>
      </div>
    )
  );
}

const FileTreeSection = React.memo(WrappedFileTreeSection);
export default FileTreeSection;
