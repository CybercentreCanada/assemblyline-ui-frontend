import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';
import { Tooltip, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { TimelineBody as TimelineData } from 'components/models/base/result_body';
import type { PossibleColor } from 'helpers/colors';
import { verdictToColor } from 'helpers/utils';
import React, { useMemo } from 'react';
import { AiOutlineFile, AiOutlineFileImage, AiOutlineFileUnknown, AiOutlineFileZip } from 'react-icons/ai';
import { BsFileEarmarkCode, BsFileLock, BsFileText, BsGlobe2, BsHddNetwork, BsTerminal } from 'react-icons/bs';

const TYPE_ICON: Record<string, React.ReactNode> = {
  CODE: <BsFileEarmarkCode />,
  DOCUMENT: <AiOutlineFile />,
  EXECUTABLE: <BsTerminal />,
  HTML: <BsGlobe2 />,
  IMAGE: <AiOutlineFileImage />,
  NETWORK: <BsHddNetwork />,
  PROTECTED: <BsFileLock />,
  TEXT: <BsFileText />,
  UNKNOWN: <AiOutlineFileUnknown />,
  ZIP: <AiOutlineFileZip />
};

type Props = {
  body?: TimelineData[];
};

const TimelineBodyComponent: React.FC<Props> = ({ body }) => {
  const theme = useTheme();
  const { scoreToVerdict } = useALContext();

  const colorMap = useMemo<Partial<Record<PossibleColor, string>>>(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      info: theme.palette.info.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main
    }),
    [theme.palette]
  );

  const data = useMemo<TimelineData[]>(() => {
    if (!body) return [];

    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body) as TimelineData[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return Array.isArray(body) ? body : [];
  }, [body]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <Timeline sx={{ minWidth: 460 }}>
        {data.map((item, idx) => {
          const score = Number.isFinite(item?.score) ? item.score : 0;
          const verdict = verdictToColor(scoreToVerdict(score));
          const borderColor = colorMap[verdict] ?? theme.palette.text.primary;
          const icon = TYPE_ICON[item?.icon ?? 'UNKNOWN'] ?? TYPE_ICON.UNKNOWN;

          const tooltip = Array.isArray(item?.signatures) ? item.signatures.filter(Boolean).join(' | ') : '';

          const title = item?.title || '(Untitled)';
          const content = item?.content || '';
          const opposite = item?.opposite_content;

          return (
            <TimelineItem key={title + idx}>
              {opposite && (
                <TimelineOppositeContent
                  variant="body2"
                  sx={{
                    alignSelf: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {opposite}
                </TimelineOppositeContent>
              )}

              <TimelineSeparator>
                {idx > 0 && <TimelineConnector />}

                <Tooltip title={tooltip} disableHoverListener={!tooltip}>
                  <TimelineDot
                    variant="outlined"
                    sx={{
                      borderColor,
                      borderWidth: 2,
                      fontSize: 'large',
                      p: 0.6
                    }}
                  >
                    {icon}
                  </TimelineDot>
                </Tooltip>

                {idx < data.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent
                sx={{
                  alignSelf: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <Typography variant="button">{title}</Typography>
                {content && (
                  <Typography variant="caption" color="text.secondary">
                    {content}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};

TimelineBodyComponent.displayName = 'TimelineBody';

export const TimelineBody = React.memo(TimelineBodyComponent);
