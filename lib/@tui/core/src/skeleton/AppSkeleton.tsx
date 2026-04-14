import { Apps } from '@mui/icons-material';
import { Box, Divider, List, Skeleton, Stack, Toolbar, styled, useMediaQuery, useTheme } from '@mui/material';
import type { AppLayoutMode } from '../app';
import { useAppBreadcrumbs, useAppLayout, useAppLeftNav, useAppPreferences, useAppQuickSearch } from '../app/hooks';
import { AppUserAvatar } from '../display/AppAvatar';
import type { LeftNavMenuItem } from '../leftnav';
import { AppBarBase } from '../topnav/AppBar';

/**
 * Utility component to render the  skeleton of the left navigation menu elements.
 *
 * The specified properties are simply passed down to each child [ButtonSkeleton] component.
 *
 * @param props
 */
interface LeftNavElementsSkeletonProps {
  withText?: boolean;
  elements: LeftNavMenuItem[];
}

interface ButtonSkeletonProps {
  style: { [styleAttr: string]: any };
  withText?: boolean;
  [propName: string]: any;
}

const StyledContainer = styled('div')(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.appBar + 1000,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
}));

const StyledTopLayout = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const StyledLeftLayout = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'row'
});

const StyledContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  backgroundColor: theme.palette.background.default
}));

const StyledContentLeft = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderTopColor: 'transparent',
  backgroundColor: theme.palette.background.paper,
  marginRight: 5,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

const StyledContentRight = styled('div')({
  flex: '1 1 auto'
});

const StyledQuickSearchSkeleton = styled(Skeleton)(({ theme }) => ({
  padding: theme.spacing(2)
}));

const StyledBreadcrumbsSkeleton = styled(Skeleton)(({ theme }) => ({
  height: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

const ButtonSkeleton = ({ style, withText, ...boxProps }: ButtonSkeletonProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <div style={{ ...style, height: 48, display: 'flex', flexDirection: 'row' }} {...boxProps}>
      <Skeleton variant="text" animation="wave">
        <Apps />
      </Skeleton>
      {withText && (
        <Skeleton
          variant="text"
          animation="wave"
          style={{ flexGrow: 1, marginLeft: isXs ? theme.spacing(2) : theme.spacing(4) }}
        />
      )}
    </div>
  );
};

const LeftNavElementsSkeleton = ({ elements, withText }: LeftNavElementsSkeletonProps) => {
  const theme = useTheme();
  return (
    <>
      {elements.map((element, i) => {
        if (element.type === 'slot' && element.component === Divider) {
          return <Divider key={`leftnav-sklt-divider-${i}`} />;
        }
        return (
          <ButtonSkeleton
            withText={withText}
            style={{
              paddingTop: theme.spacing(1),
              paddingBottom: theme.spacing(1),
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
            key={`leftnav-sklt-${element.id}`}
          />
        );
      })}
    </>
  );
};

const AppBarSkeleton = ({ layout }: { layout: AppLayoutMode }) => {
  const leftnav = useAppLeftNav();
  const breadcrumbs = useAppBreadcrumbs();
  const quicksearch = useAppQuickSearch();

  const { brand, topnav: topnavPreferences } = useAppPreferences();
  const appName = brand?.appName;

  const muiTheme = useTheme();
  const isXs = useMediaQuery(muiTheme.breakpoints.only('xs'));
  const isSm = useMediaQuery(muiTheme.breakpoints.only('sm'));
  const isSmDown = useMediaQuery(muiTheme.breakpoints.down('md'));

  const sp1 = muiTheme.spacing(1);
  const sp2 = muiTheme.spacing(2);
  const sp3 = muiTheme.spacing(3);
  const sp4 = muiTheme.spacing(4);
  const showTopBarBreadcrumbs = breadcrumbs.show && !isSm;

  return (
    <AppBarBase>
      <Toolbar disableGutters style={{ paddingRight: sp2, paddingLeft: !isXs ? sp2 : null }}>
        {isXs && (
          <ButtonSkeleton
            withText={leftnav.open}
            style={{
              paddingTop: sp1,
              paddingBottom: sp1,
              paddingLeft: sp2,
              paddingRight: sp2,
              flexGrow: 1
            }}
          />
        )}

        {layout === 'top' && (
          <>
            {!isXs && (
              <ButtonSkeleton withText={false} style={{ paddingTop: sp1, paddingBottom: sp1, paddingRight: sp4 }} />
            )}
            <Skeleton variant="text" animation="wave" style={{ marginRight: sp3 }}>
              <div style={{ fontSize: '1.5rem', letterSpacing: '-1px' }}>{appName}</div>
            </Skeleton>
          </>
        )}

        {topnavPreferences.slots?.left?.length > 0 && (
          <Stack direction="row" spacing={3} mr={2.5}>
            {topnavPreferences.slots.left.map((_, index) => (
              <ButtonSkeleton key={`topnav.slot.left.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}

        {topnavPreferences.slots?.breadcrumbs?.left?.length > 0 && (
          <Stack direction="row" spacing={3} ml={2} mr={2.5}>
            {topnavPreferences.slots.breadcrumbs.left.map((_, index) => (
              <ButtonSkeleton key={`topnav.slots.breadcrumbs.left.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}

        {showTopBarBreadcrumbs && <StyledBreadcrumbsSkeleton variant="text" animation="wave" width={100} />}

        {topnavPreferences.slots?.breadcrumbs?.right?.length > 0 && (
          <Stack direction="row" spacing={3} ml={2} mr={2.5}>
            {topnavPreferences.slots.breadcrumbs.right.map((_, index) => (
              <ButtonSkeleton key={`topnav.slots.breadcrumbs.right.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}

        {<div style={{ flexGrow: 1 }} />}

        {topnavPreferences.slots?.search?.left?.length > 0 && (
          <Stack direction="row" spacing={3} ml={2} mr={2.5}>
            {topnavPreferences.slots.search.left.map((_, index) => (
              <ButtonSkeleton key={`topnav.slots.search.left.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}

        {quicksearch.show &&
          (isSmDown || topnavPreferences.quickSearchIconOnly ? (
            <ButtonSkeleton withText={false} style={{}} />
          ) : (
            <StyledQuickSearchSkeleton
              variant="text"
              animation="wave"
              width={showTopBarBreadcrumbs ? 358 : 'auto'}
              style={{ flexGrow: !showTopBarBreadcrumbs ? 1 : 0 }}
            />
          ))}

        {topnavPreferences.slots?.search?.right?.length > 0 && (
          <Stack direction="row" spacing={3} ml={2} mr={2.5}>
            {topnavPreferences.slots.search.right.map((_, index) => (
              <ButtonSkeleton key={`topnav.slots.search.right.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}

        <Skeleton animation="wave" variant="circular">
          <AppUserAvatar />
        </Skeleton>

        {topnavPreferences.slots?.right?.length > 0 && (
          <Stack direction="row" spacing={3} ml={2}>
            {topnavPreferences.slots.right.map((_, index) => (
              <ButtonSkeleton key={`topnav.slot.right.${index}`} withText={false} style={{}} />
            ))}
          </Stack>
        )}
      </Toolbar>
    </AppBarBase>
  );
};

/**
 * A Skeleton for the side layout...
 */
const SideLayoutSkeleton = () => {
  const leftnav = useAppLeftNav();

  const { leftnav: leftnavPreference } = useAppPreferences();

  const muiTheme = useTheme();

  const sp1 = muiTheme.spacing(1);
  const sp2 = muiTheme.spacing(2);
  const sp7 = muiTheme.spacing(7);

  return (
    <StyledContainer>
      <StyledLeftLayout>
        <StyledContent>
          <StyledContentLeft style={{ width: leftnav.open ? leftnavPreference.width : sp7 }}>
            <Toolbar disableGutters>
              <ButtonSkeleton
                withText={leftnav.open}
                style={{ paddingTop: sp1, paddingBottom: sp1, paddingLeft: sp2, paddingRight: sp2, flexGrow: 1 }}
              />
            </Toolbar>
            <Divider />
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <LeftNavElementsSkeleton elements={leftnav.menus.map(m => m.items).flat()} withText={leftnav.open} />
              <Box sx={{ flexGrow: 1 }} />
              {leftnav.menus?.length > 0 && <Divider />}
              <ButtonSkeleton
                withText={leftnav.open}
                style={{ paddingTop: sp1, paddingBottom: sp1, paddingLeft: sp2, paddingRight: sp2 }}
              />
            </List>
          </StyledContentLeft>
          <StyledContentRight>
            <AppBarSkeleton layout="side" />
          </StyledContentRight>
        </StyledContent>
      </StyledLeftLayout>
    </StyledContainer>
  );
};

/**
 * A Skeleton for the top layout.
 */
const TopLayoutSkeleton = () => {
  const leftnav = useAppLeftNav();
  const { leftnav: leftnavPreference } = useAppPreferences();

  const muiTheme = useTheme();

  const sp1 = muiTheme.spacing(1);
  const sp2 = muiTheme.spacing(2);
  const sp7 = muiTheme.spacing(7);

  return (
    <StyledContainer>
      <StyledTopLayout>
        <AppBarSkeleton layout="top" />

        <StyledContent>
          <StyledContentLeft style={{ width: leftnav.open ? leftnavPreference.width : sp7 }}>
            <List disablePadding>
              <LeftNavElementsSkeleton elements={leftnav.menus.map(m => m.items).flat()} withText={leftnav.open} />
              {leftnav.menus?.length > 0 && <Divider />}
              <ButtonSkeleton
                withText={leftnav.open}
                style={{ paddingTop: sp1, paddingBottom: sp1, paddingLeft: sp2, paddingRight: sp2 }}
              />
            </List>
          </StyledContentLeft>
          <StyledContentRight />
        </StyledContent>
      </StyledTopLayout>
    </StyledContainer>
  );
};

/**
 * Default Skeleton component that will render either [TopLayoutSkeleton] or [SideLayoutSkeleton] based on [useAppLayout::currentLayout].
 */
export const LayoutSkeleton = () => {
  const layout = useAppLayout();
  return layout.current === 'top' ? <TopLayoutSkeleton /> : <SideLayoutSkeleton />;
};
