import { Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useALContext from 'components/hooks/useALContext';
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

const WrappedTimelineBody = ({ body }) => {
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
    <Timeline>
      {body.map(element => {
        return (
          <TimelineItem>
            {element.opposite_content ? (
              <TimelineOppositeContent alignSelf="center" variant="body2">
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
              overflow={{ 'overflow-x': 'hidden' }}
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
  );
};

export const TimelineBody = React.memo(WrappedTimelineBody);
