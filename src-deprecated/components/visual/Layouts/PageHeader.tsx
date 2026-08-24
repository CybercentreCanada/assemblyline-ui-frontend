import type { TypographyProps } from '@mui/material';
import { Skeleton, Typography, useTheme } from '@mui/material';
import { useAppBar, useAppBarHeight, useAppLayout } from 'commons/components/app/hooks';
import useALContext from 'components/hooks/useALContext';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import type { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

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
    classification: classificationProp,
    endAdornment = null,
    isSticky = false,
    primary: primaryProp,
    primaryLoading = false,
    secondary: secondaryProp,
    secondaryLoading = false,
    slotProps = {},
    startAdornment = null,
    top = null,
    wrapStart = false,
    onClassificationChange = null
  }) => {
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
      [layout?.current, appbar?.autoHide]
    );

    const {
      root = {},
      classification: classificationProps = {},
      primary: primaryProps = {},
      secondary: secondaryProps = {},
      actions: actionsProps = {}
    } = slotProps;

    const resolvedPrimary = useMemo<ReactNode>(() => {
      if (primaryLoading) return <Skeleton width="20rem" />;
      return typeof primaryProp === 'function' ? primaryProp() : primaryProp;
    }, [primaryLoading, primaryProp]);

    const resolvedSecondary = useMemo<ReactNode>(() => {
      if (secondaryLoading) return <Skeleton width="10rem" />;
      return typeof secondaryProp === 'function' ? secondaryProp() : secondaryProp;
    }, [secondaryLoading, secondaryProp]);

    const classification = useMemo<ClassificationProps['c12n']>(
      () =>
        classificationProp === undefined
          ? undefined
          : primaryLoading || secondaryLoading
            ? null
            : typeof classificationProp === 'function'
              ? classificationProp()
              : classificationProp,
      [classificationProp, primaryLoading, secondaryLoading]
    );

    useLayoutEffect(() => {
      const measure = () => {
        if (!containerRef.current || !primaryRef.current || !actionsRef.current) return;

        const containerWidth = containerRef.current.getBoundingClientRect().width;
        const primaryIdealWidth = primaryRef.current.scrollWidth; // unwrapped width
        const actionsWidth = actionsRef.current.getBoundingClientRect().width;

        setFlexColumn(containerWidth - actionsWidth < primaryIdealWidth + 10);
      };

      const resizeObserver = new ResizeObserver(measure);
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (primaryRef.current) resizeObserver.observe(primaryRef.current);
      if (actionsRef.current) resizeObserver.observe(actionsRef.current);

      measure();

      return () => resizeObserver.disconnect();
    }, []);

    const rootStyle = useMemo(
      () =>
        ({
          display: 'flex',
          flexDirection: 'column',
          top: top !== null ? top : isSticky ? (barWillHide ? 0 : appBarHeight) : null,
          zIndex: !isSticky ? theme.zIndex.appBar - 100 : null,
          ...root.style
        }) satisfies CSSProperties,
      [top, isSticky, barWillHide, appBarHeight, theme.zIndex.appBar, root.style]
    );

    const containerStyle = useMemo(
      () =>
        ({
          display: 'flex',
          flexDirection: flexColumn ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: theme.spacing(1),
          ...(flexColumn && {
            alignItems: wrapStart ? 'flex-start' : 'flex-end'
          })
        }) satisfies CSSProperties,
      [flexColumn, wrapStart, theme]
    );

    return (
      <div {...root} style={rootStyle}>
        {!c12nDef.enforce || classification === undefined ? null : (
          <div style={{ paddingBottom: theme.spacing(4) }}>
            <Classification
              c12n={classification}
              size="tiny"
              type={onClassificationChange ? 'picker' : 'pill'}
              setClassification={onClassificationChange}
              {...classificationProps}
            />
          </div>
        )}

        <div ref={containerRef} style={containerStyle}>
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
            {resolvedPrimary && (
              <Typography
                variant="h4"
                {...primaryProps}
                ref={primaryRef}
                sx={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  ...primaryProps.sx
                }}
              >
                {resolvedPrimary}
              </Typography>
            )}

            {resolvedSecondary && (
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
                  ...secondaryProps.sx
                }}
              >
                {resolvedSecondary}
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
                  ...(actionsProps?.spacing && { gap: theme.spacing(actionsProps.spacing) })
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
