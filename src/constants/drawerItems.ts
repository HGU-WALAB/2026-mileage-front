import {
  BuildingBlueIcon,
  BuildingIcon,
  DashboardBlueIcon,
  DashboardIcon,
  MileageListBlueIcon,
  MileageListIcon,
  UserBlueIcon,
  UserIcon,
} from '@/assets';
import { ROUTE_PATH } from '@/constants/routePath';

export const drawerItems = [
  {
    id: 1,
    text: '대시보드',
    shortText: '대시보드',
    icon: DashboardIcon,
    selectedIcon: DashboardBlueIcon,
    route: ROUTE_PATH.dashboard,
  },
  {
    id: 2,
    text: '마일리지',
    shortText: '마일리지',
    icon: MileageListIcon,
    selectedIcon: MileageListBlueIcon,
    route: ROUTE_PATH.mileageList,
  },
  {
    id: 5,
    text: '내 활동 관리',
    shortText: '활동관리',
    icon: BuildingIcon,
    selectedIcon: BuildingBlueIcon,
    route: ROUTE_PATH.summary,
  },
  {
    id: 6,
    text: '마이페이지',
    shortText: '프로필',
    icon: UserIcon,
    selectedIcon: UserBlueIcon,
    route: ROUTE_PATH.myPage,
  },
];
