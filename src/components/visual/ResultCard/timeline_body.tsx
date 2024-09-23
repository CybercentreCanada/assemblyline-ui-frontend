import { Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useALContext from 'components/hooks/useALContext';
import type { TimelineBody as TimelineData } from 'components/models/base/result_body';
import { verdictToColor } from 'helpers/utils';
import { AiOutlineFile, AiOutlineFileImage, AiOutlineFileUnknown, AiOutlineFileZip } from 'react-icons/ai';
import { BsFileEarmarkCode, BsFileLock, BsFileText, BsGlobe2, BsHddNetwork, BsTerminal } from 'react-icons/bs';

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';

import { default as React } from 'react';

const AL_TYPE_ICON = {
  HTML: <BsGlobe2 />,
  EXECUTABLE: <BsTerminal />,
  TEXT: <BsFileText />,
  ZIP: <AiOutlineFileZip />,
  CODE: <BsFileEarmarkCode />,
  IMAGE: <AiOutlineFileImage />,
  DOCUMENT: <AiOutlineFile />,
  UNKNOWN: <AiOutlineFileUnknown />,
  PROTECTED: <BsFileLock />,
  NETWORK: <BsHddNetwork />
};

type Props = {
  body: TimelineData[];
};

const WrappedTimelineBody = ({ body }: Props) => {
  const { scoreToVerdict } = useALContext();
  const theme = useTheme();
  const COLOR_MAP = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <Timeline style={{ minWidth: '460px' }}>
        {body.map((element, key) => {
          return (
            <TimelineItem key={key}>
              {element.opposite_content ? (
                <TimelineOppositeContent
                  alignSelf="center"
                  variant="body2"
                  textOverflow={'ellipsis'}
                  whiteSpace="nowrap"
                  overflow={{ overflowX: 'hidden' }}
                >
                  {element.opposite_content}
                </TimelineOppositeContent>
              ) : null}
              <TimelineSeparator>
                <TimelineConnector />
                <Tooltip title={element.signatures.join(' | ')} placement="top">
                  <TimelineDot
                    variant="outlined"
                    sx={{
                      fontSize: 'large',
                      borderWidth: 'medium',
                      borderColor: COLOR_MAP[verdictToColor(scoreToVerdict(element.score))],
                      padding: '5px'
                    }}
                  >
                    {AL_TYPE_ICON[element.icon]}
                  </TimelineDot>
                </Tooltip>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent
                alignSelf="center"
                textOverflow={'ellipsis'}
                whiteSpace="nowrap"
                overflow={{ overflowX: 'hidden' }}
              >
                <Typography variant="button" display="block">
                  {element.title}
                </Typography>
                {element.content ? <Typography variant="caption">{element.content}</Typography> : null}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};

export const TimelineBody = React.memo(WrappedTimelineBody);
