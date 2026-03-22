import {
  Drawer,
  ErrorResetBoundary,
  Flex,
  Header,
  HeaderMobile,
  Main,
  NavigationBar,
} from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useDrawerStore } from '@/stores';
import { useMediaQuery } from '@mui/material';

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
  return (
    <Flex.Column
      width="100%"
      style={{
        height: '100dvh',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Flex.Column style={{ flexShrink: 0 }} width="100%">
        <HeaderMobile />
      </Flex.Column>
      <Main open={false} isMobile={isMobile}>
        <ErrorResetBoundary />
      </Main>
      <Flex.Column style={{ flexShrink: 0 }} width="100%">
        <NavigationBar />
      </Flex.Column>
    </Flex.Column>
  );
};
