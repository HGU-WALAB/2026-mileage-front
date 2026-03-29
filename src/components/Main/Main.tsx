import {
  drawerWidth,
  globalHeight,
  globalMobileHeight,
  headerHeight,
  navigationBarHeight,
} from '@/constants/layoutSize';
import { styled } from '@mui/material/styles';

const Main = styled('main', {
  shouldForwardProp: prop =>
    prop !== 'open' && prop !== 'isMobile' && prop !== 'mobileSubNavOffset',
})<{
  open?: boolean;
  isMobile?: boolean;
  /** 모바일 하단 서브 탭 줄 높이(px). 0이면 무시. */
  mobileSubNavOffset?: number;
}>(({ theme, isMobile, mobileSubNavOffset = 0 }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  height:
    isMobile && mobileSubNavOffset > 0
      ? `calc(100dvh - ${headerHeight}px - ${navigationBarHeight}px - ${mobileSubNavOffset}px - 1rem)`
      : isMobile
        ? globalMobileHeight
        : globalHeight,
  maxWidth: `100%`,
  margin: `.5rem`,
  backgroundColor: theme.palette.background.default,
  overflowY: 'scroll',
  position: 'relative',
  borderRadius: '.5rem',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        height: globalHeight,
        maxWidth: `calc(100% - ${drawerWidth + 24}px)`,
        marginLeft: `${drawerWidth + 16}px`,
      },
    },
  ],
}));

export default Main;
