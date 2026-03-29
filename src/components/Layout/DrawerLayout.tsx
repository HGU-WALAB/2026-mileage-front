import {
  Drawer,
  ErrorResetBoundary,
  Flex,
  Header,
  HeaderMobile,
  Main,
  NavigationBar,
} from '@/components';
import MobileNavGroupSubTabs from '@/components/NavigationBar/MobileNavGroupSubTabs';
import { getActiveMenuGroupForPath } from '@/constants/drawerMenu';
import {
  mobileNavSubTabsStripHeight,
} from '@/constants/layoutSize';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useDrawerStore } from '@/stores';
import { styled, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';

const DrawerLayout = () => {
  const { isDrawerOpen } = useDrawerStore();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);

  if (isMobile) return <MobileDrawerLayout />;
  return (
    <Flex.Column>
      <Drawer />
      <Flex.Row justify="center">
        <Main open={isDrawerOpen} isMobile={isMobile}>
          <Header />
          <ErrorResetBoundary />
        </Main>
      </Flex.Row>
    </Flex.Column>
  );
};

export default DrawerLayout;

const MobileDrawerLayout = () => {
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const location = useLocation();
  const activeGroup = getActiveMenuGroupForPath(location.pathname);
  const mobileSubNavOffset = activeGroup ? mobileNavSubTabsStripHeight : 0;

  return (
    <Flex.Column>
      <HeaderMobile />
      <Main
        open={false}
        isMobile={isMobile}
        mobileSubNavOffset={mobileSubNavOffset}
      >
        <ErrorResetBoundary />
      </Main>
      <S.MobileNavDock>
        <MobileNavGroupSubTabs />
        <NavigationBar />
      </S.MobileNavDock>
    </Flex.Column>
  );
};

const S = {
  MobileNavDock: styled('div')`
    bottom: 0;
    display: flex;
    flex-direction: column;
    left: 0;
    position: fixed;
    right: 0;
    z-index: 10;
  `,
};
