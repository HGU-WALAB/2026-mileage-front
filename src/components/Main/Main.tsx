import { drawerWidth, globalHeight } from '@/constants/layoutSize';
import { styled } from '@mui/material/styles';

const Main = styled('main', {
  shouldForwardProp: prop => prop !== 'open' && prop !== 'isMobile',
})<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, isMobile }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isMobile
    ? {
        flex: '1 1 0%',
        minHeight: 0,
        alignSelf: 'stretch',
        height: 'auto',
      }
    : {
        height: globalHeight,
      }),
  maxWidth: `100%`,
  margin: `.5rem`,
  backgroundColor: theme.palette.background.default,
  overflowY: 'auto',
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
