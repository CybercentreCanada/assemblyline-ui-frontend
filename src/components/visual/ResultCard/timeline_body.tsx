import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { AiOutlineFile, AiOutlineFileImage, AiOutlineFileUnknown, AiOutlineFileZip } from 'react-icons/ai';
import { BsFileEarmarkCode, BsFileLock, BsFileText, BsGlobe2, BsTerminal } from 'react-icons/bs';

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';

import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
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
  PROTECTED: <BsFileLock />
};
const WrappedTimelineBody = ({ body }) => {
  return (
    <Timeline>
      {body.map(element => {
        return (
          <TimelineItem>
            {element.opposite_content ? (
              <TimelineOppositeContent alignSelf="center">{element.opposite_content}</TimelineOppositeContent>
            ) : null}
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot
                variant="outlined"
                sx={{ fontSize: 'x-large', borderWidth: 'medium', borderColor: element.color }}
              >
                {AL_TYPE_ICON[element.icon]}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent alignSelf="center">
              <div style={{ display: 'flex' }}>
                <div>
                  <Typography variant="h6" component="span">
                    {element.title}
                  </Typography>
                  {element.content ? <Typography>{element.content}</Typography> : null}
                </div>
                {element.signatures.length !== 0 ? (
                  <div style={{ padding: '5px' }}>
                    <Tooltip title={element.signatures.join(' | ')} placement="right">
                      <FingerprintOutlinedIcon></FingerprintOutlinedIcon>
                    </Tooltip>
                  </div>
                ) : null}
              </div>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export const TimelineBody = React.memo(WrappedTimelineBody);
