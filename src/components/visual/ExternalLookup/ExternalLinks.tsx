import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { SvgIconTypeMap, Tooltip } from '@mui/material';
import React, { forwardRef } from 'react';

type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};

type ExternalLookupProps = {
  results: {
    [sourceName: string]: {
      link: string;
      count: number;
    };
  };
  errors: {
    [sourceName: string]: string;
  };
  success: null | boolean;
  iconStyle?: null | Object;
};

// This needs to be taken out into it's own `forwardRef` to enable ref to be passed onto the Icon for tooltips to work
const EXTERNAL_RESULTS_ICON = forwardRef<SvgIconTypeMap | null, any>((props, ref) => {
  const { success, iconHeight, ...remainingProps } = props;
  return (
    <>
      {success === true && <LinkOutlinedIcon ref={ref} {...remainingProps} />}
      {success === false && <ErrorOutlineOutlinedIcon ref={ref} {...remainingProps} />}
    </>
  );
});

const WrappedExternalLinks: React.FC<ExternalLookupProps> = ({ results, errors, success, iconStyle }) => {
  return (
    <>
      {success !== null ? (
        <Tooltip
          title={
            <>
              {Object.keys(results)?.map((sourceName: keyof LookupSourceDetails, i) => (
                <h3 key={`success_${i}`}>
                  {sourceName}: <a href={results[sourceName].link}>{results[sourceName].count} results</a>
                </h3>
              ))}
              {!!Object.keys(errors).length && (
                <>
                  <h3>Errors</h3>
                  {Object.keys(errors).map((sourceName: keyof LookupSourceDetails, i) => (
                    <p key={`error_${i}`}>{errors[sourceName]}</p>
                  ))}
                </>
              )}
            </>
          }
        >
          <EXTERNAL_RESULTS_ICON success={success} style={iconStyle} />
        </Tooltip>
      ) : null}
    </>
  );
};

const ExternalLinks = React.memo(WrappedExternalLinks);
export default ExternalLinks;
