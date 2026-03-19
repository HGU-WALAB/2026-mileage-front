import {
  BuildingBlueIcon,
  BuildingIcon,
  DashboardBlueIcon,
  DashboardIcon,
  MileageListBlueIcon,
  MileageListIcon,
  ScholarshipBlueIcon,
  ScholarshipIcon,
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
    text: '마일리지 조회',
    shortText: '조회',
    icon: MileageListIcon,
    selectedIcon: MileageListBlueIcon,
    route: ROUTE_PATH.mileageList,
  },
  {
    id: 4,
    text: '장학금 신청',
    shortText: '장학신청',
    icon: ScholarshipIcon,
    selectedIcon: ScholarshipBlueIcon,
    route: ROUTE_PATH.scholarship,
  },
  {
    id: 5,
    text: '포트폴리오 생성',
    shortText: '포폴생성',
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
