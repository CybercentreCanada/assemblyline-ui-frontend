import type { TypographyProps } from '@mui/material';
import { Skeleton, Typography, useTheme } from '@mui/material';
import { useAppBar, useAppBarHeight, useAppLayout } from 'commons/components/app/hooks';
import useALContext from 'components/hooks/useALContext';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import type { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import React, { useMemo } from 'react';

export type PageHeaderProps = {
  classification?: ClassificationProps['c12n'] | ((loading?: boolean) => ClassificationProps['c12n']);
  primary: ReactNode | ((loading?: boolean) => ReactNode);
  secondary?: ReactNode | ((loading?: boolean) => ReactNode);
  actions?: ReactNode;
  endAdornment?: ReactNode;

  loading?: boolean;
  isSticky?: boolean;
  top?: CSSProperties['top'];
  onClassificationChange?: ClassificationProps['setClassification'];

  slotProps?: {
    root?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    classification?: Omit<ClassificationProps, 'c12n' | 'setClassification'>;
    primary?: TypographyProps;
    secondary?: TypographyProps;
    actions?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { spacing?: number };
  };
};

export const PageHeader: React.FC<PageHeaderProps> = React.memo(
  ({
    actions = null,
    classification = 'undefined',
    endAdornment = null,
    loading = false,
    isSticky = false,
    primary = null,
    top = null,
    secondary = null,

    slotProps = {},
    onClassificationChange = null
  }: PageHeaderProps) => {
    const theme = useTheme();
    const layout = useAppLayout();
    const appbar = useAppBar();
    const appBarHeight = useAppBarHeight();
    const { c12nDef } = useALContext();

    const barWillHide = useMemo(
      () => (layout?.current !== 'top' ? appbar?.autoHide : null),
      [appbar?.autoHide, layout]
    );

    const {
      root: rootProps,
      classification: classificationProps,
      primary: primaryProps,
      secondary: secondaryProps,
      actions: actionsProps
    } = useMemo<PageHeaderProps['slotProps']>(() => slotProps, [slotProps]);

    return (
      <div
        {...rootProps}
        style={{
          display: 'flex',
          flexDirection: 'column',
          top: top !== null ? top : isSticky ? (barWillHide ? 0 : appBarHeight) : null,
          zIndex: !isSticky ? theme.zIndex.appBar - 100 : null,
          ...rootProps?.style
        }}
      >
        {!c12nDef.enforce || classification === 'undefined' ? null : (
          <div style={{ paddingBottom: theme.spacing(4) }}>
            <Classification
              type={!onClassificationChange ? 'pill' : 'picker'}
              size="tiny"
              c12n={loading ? null : typeof classification === 'function' ? classification(loading) : classification}
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
              alignContent: 'center',
              columnGap: theme.spacing(1),
              textAlign: 'left'
            }}
          >
            <Typography
              variant="h4"
              width="100%"
              flex={1}
              {...primaryProps}
              sx={{ overflowWrap: 'break-word', ...primaryProps?.sx }}
            >
              {typeof primary === 'function' ? primary(loading) : primary}
            </Typography>

            {secondary && (
              <Typography
                variant="caption"
                color="textSecondary"
                width="100%"
                minWidth={0}
                {...secondaryProps}
                sx={{ overflowWrap: 'break-word', ...secondaryProps?.sx }}
              >
                {loading ? (
                  <Skeleton style={{ width: '10rem' }} />
                ) : typeof secondary === 'function' ? (
                  secondary(loading)
                ) : (
                  secondary
                )}
              </Typography>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              rowGap: theme.spacing(1),
              paddingTop: theme.spacing(0.5)
            }}
          >
            {actions && (
              <div
                {...actionsProps}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  ...actionsProps?.style,
                  ...(actionsProps?.spacing && { gap: theme.spacing(actionsProps?.spacing) })
                }}
              >
                {actions}
              </div>
            )}

            {endAdornment}
          </div>
        </div>
      </div>
    );
  }
);
