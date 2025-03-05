import type { IconButtonProps, TypographyProps } from '@mui/material';
import { IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import type { TooltipProps } from 'components/visual/Tooltip';
import { Tooltip } from 'components/visual/Tooltip';
import type { ReactNode } from 'react';
import React, { isValidElement } from 'react';

type TitleActionPartialProps = IconButtonProps & {
  icon: React.ReactNode;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children'>;
};

export type TitleActionProps = ReactNode | TitleActionPartialProps;

function isValidAction(action: TitleActionProps): action is TitleActionPartialProps {
  return !isValidElement(action);
}

export type PageHeaderProps = {
  actions?: TitleActionProps[];
  classification?: ClassificationProps['c12n'];
  classificationProps?: Omit<ClassificationProps, 'c12n' | 'setClassification'>;
  endAdornment?: React.ReactNode;
  loading?: boolean;
  primary: React.ReactNode;
  primaryProps?: TypographyProps;
  secondary?: React.ReactNode;
  secondaryProps?: TypographyProps;
  onClassificationChange?: ClassificationProps['setClassification'];
};

export const PageHeader: React.FC<PageHeaderProps> = React.memo(
  ({
    actions = null,
    classification = '',
    classificationProps = null,
    endAdornment = null,
    loading = false,
    primary = null,
    primaryProps = null,
    secondary = null,
    secondaryProps = null,
    onClassificationChange = null
  }: PageHeaderProps) => {
    const theme = useTheme();

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!classification ? null : (
          <div style={{ paddingBottom: theme.spacing(4) }}>
            <Classification
              type={!onClassificationChange ? 'pill' : 'picker'}
              size="tiny"
              c12n={loading ? null : classification}
              setClassification={onClassificationChange}
              {...classificationProps}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            rowGap: theme.spacing(1)
          }}
        >
          <div style={{ flex: 1, width: '100%', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
            <Typography
              variant="h4"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              width="100%"
              {...primaryProps}
            >
              {primary}
            </Typography>

            <Typography
              variant="caption"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              width="100%"
              {...secondaryProps}
            >
              {loading ? <Skeleton style={{ width: '10rem' }} /> : secondary}
            </Typography>
          </div>

          {loading ? null : (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', rowGap: theme.spacing(1) }}
            >
              <div>
                {Array.isArray(actions) && (
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {actions.map((action, i) => {
                      if (isValidAction(action)) {
                        const { icon = null, tooltip = null, tooltipProps, ...iconButtonProps } = action;
                        return (
                          <div key={i}>
                            <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
                              <IconButton size="large" {...iconButtonProps}>
                                {icon}
                              </IconButton>
                            </Tooltip>
                          </div>
                        );
                      } else return action;
                    })}
                  </div>
                )}
              </div>

              {endAdornment}
            </div>
          )}
        </div>
      </div>
    );
  }
);
