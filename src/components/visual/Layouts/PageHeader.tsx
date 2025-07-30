import type { TypographyProps } from '@mui/material';
import { Skeleton, Typography, useTheme } from '@mui/material';
import { useAppBar, useAppBarHeight, useAppLayout } from 'commons/components/app/hooks';
import useALContext from 'components/hooks/useALContext';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import type { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type PageHeaderProps = {
  actions?: ReactNode;
  classification?: ClassificationProps['c12n'] | (() => ClassificationProps['c12n']);
  endAdornment?: ReactNode;
  isSticky?: boolean;
  primary: ReactNode | (() => ReactNode);
  primaryLoading?: boolean;
  secondary?: ReactNode | (() => ReactNode);
  secondaryLoading?: boolean;
  startAdornment?: ReactNode;
  top?: CSSProperties['top'];
  wrapStart?: boolean;
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
    classification: classificationProp = 'undefined',
    endAdornment = null,
    isSticky = false,
    primary: primaryProp = null,
    primaryLoading = false,
    secondary: secondaryProp = null,
    secondaryLoading = false,
    slotProps = {},
    startAdornment = null,
    top = null,
    wrapStart = false,
    onClassificationChange = null
  }: PageHeaderProps) => {
    const theme = useTheme();
    const layout = useAppLayout();
    const appbar = useAppBar();
    const appBarHeight = useAppBarHeight();
    const { c12nDef } = useALContext();

    const [flexColumn, setFlexColumn] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const primaryRef = useRef<HTMLSpanElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);

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

    const classification = useMemo<ClassificationProps['c12n']>(
      () =>
        primaryLoading || secondaryLoading
          ? null
          : typeof classificationProp === 'function'
            ? classificationProp()
            : classificationProp,
      [classificationProp, primaryLoading, secondaryLoading]
    );

    const primary = useMemo<ReactNode>(
      () =>
        primaryLoading ? (
          <Skeleton style={{ width: '20rem' }} />
        ) : typeof primaryProp === 'function' ? (
          primaryProp()
        ) : (
          primaryProp
        ),
      [primaryLoading, primaryProp]
    );

    const secondary = useMemo<ReactNode>(
      () =>
        secondaryLoading ? (
          <Skeleton style={{ width: '10rem' }} />
        ) : typeof secondaryProp === 'function' ? (
          secondaryProp()
        ) : (
          secondaryProp
        ),
      [secondaryLoading, secondaryProp]
    );

    useEffect(() => {
      const element = containerRef.current;

      if (!element) return;

      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current && primaryRef.current && actionsRef.current) {
          setFlexColumn(
            containerRef.current.getBoundingClientRect().width - actionsRef.current.getBoundingClientRect().width <
              primaryRef.current.getBoundingClientRect().width + 10
          );
        }
      });

      resizeObserver.observe(element);

      return () => {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      };
    }, []);

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
              c12n={classification}
              size="tiny"
              type={!onClassificationChange ? 'pill' : 'picker'}
              setClassification={onClassificationChange}
              {...classificationProps}
            />
          </div>
        )}

        <div
          ref={containerRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing(1),
            ...(flexColumn && {
              flexDirection: 'column',
              alignItems: 'flex-end',
              ...(wrapStart && { alignItems: 'flex-start' })
            })
          }}
        >
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              columnGap: theme.spacing(1),
              textAlign: 'left'
            }}
          >
            {(primary || primaryLoading) && (
              <Typography
                ref={primaryRef}
                variant="h4"
                {...primaryProps}
                sx={{
                  ...primaryProps?.sx,
                  position: 'absolute',
                  opacity: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {primary}
              </Typography>
            )}

            {(primary || primaryLoading) && (
              <Typography
                variant="h4"
                {...primaryProps}
                sx={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', ...primaryProps?.sx }}
              >
                {primary}
              </Typography>
            )}

            {(secondary || secondaryLoading) && (
              <Typography
                variant="caption"
                color="textSecondary"
                width="100%"
                minWidth={0}
                {...secondaryProps}
                sx={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  ...secondaryProps?.sx
                }}
              >
                {secondary}
              </Typography>
            )}

            {startAdornment}
          </div>

          <div
            ref={actionsRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              rowGap: theme.spacing(1)
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
