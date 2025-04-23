import type { TypographyProps } from '@mui/material';
import { Skeleton, Typography, useTheme } from '@mui/material';
import type { ButtonProps } from 'components/visual/Buttons/Button';
import { Button } from 'components/visual/Buttons/Button';
import type { IconButtonProps } from 'components/visual/Buttons/IconButton';
import { IconButton } from 'components/visual/Buttons/IconButton';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import type { CSSProperties, ReactNode } from 'react';
import React, { isValidElement } from 'react';

type TitleActionPartialProps = (IconButtonProps & { type?: 'icon' }) | (ButtonProps & { type?: 'button' });

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
  style?: CSSProperties;
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
    style = null,
    onClassificationChange = null
  }: PageHeaderProps) => {
    const theme = useTheme();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
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
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              columnGap: theme.spacing(1)
            }}
          >
            <Typography
              variant="h4"
              width="100%"
              flex={1}
              {...primaryProps}
              sx={{ overflowWrap: 'break-word', ...primaryProps?.sx }}
            >
              {primary}
            </Typography>

            <Typography
              variant="caption"
              color="textSecondary"
              width="100%"
              minWidth={0}
              {...secondaryProps}
              sx={{ overflowWrap: 'break-word', ...secondaryProps?.sx }}
            >
              {loading ? <Skeleton style={{ width: '10rem' }} /> : secondary}
            </Typography>
          </div>

          {loading ? null : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                rowGap: theme.spacing(1),
                paddingTop: theme.spacing(0.5)
              }}
            >
              {Array.isArray(actions) && (
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {actions.map((action, i) => {
                    if (isValidAction(action)) {
                      const { children = null, type = 'icon', ...buttonProps } = action;
                      return type === 'icon' ? (
                        <IconButton key={i} size="large" {...(buttonProps as IconButtonProps)}>
                          {children}
                        </IconButton>
                      ) : (
                        <Button key={i} {...(buttonProps as ButtonProps)}>
                          {children}
                        </Button>
                      );
                    } else return action;
                  })}
                </div>
              )}

              {endAdornment}
            </div>
          )}
        </div>
      </div>
    );
  }
);
