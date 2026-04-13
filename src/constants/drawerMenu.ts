import {
  BuildingBlueIcon,
  BuildingIcon,
  DashboardBlueIcon,
  DashboardIcon,
  EditIcon,
  MileageListBlueIcon,
  MileageListIcon,
  UserBlueIcon,
  UserIcon,
} from '@/assets';
import { ROUTE_PATH } from '@/constants/routePath';
import type { ComponentType, SVGProps } from 'react';

export type DrawerIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** 드로어 2뎁스 항목 — 추가·삭제·수정은 `DRAWER_MENU_ENTRIES` 배열만 편집하면 됨 */
export type DrawerMenuSubItem = {
  id: string;
  text: string;
  shortText: string;
  route: string;
  icon: DrawerIcon;
  selectedIcon: DrawerIcon;
  isNavActive: (pathname: string) => boolean;
};

/** 단일 링크 (서브 없음) */
export type DrawerMenuLink = {
  kind: 'link';
  id: string;
  text: string;
  shortText: string;
  route: string;
  icon: DrawerIcon;
  selectedIcon: DrawerIcon;
  /** 없으면 `pathname === route`. 하위 경로 포함 시 지정 */
  isNavActive?: (pathname: string) => boolean;
};

/** 접는 그룹 — 서브는 `children`만 수정 */
export type DrawerMenuGroup = {
  kind: 'group';
  id: string;
  text: string;
  shortText: string;
  icon: DrawerIcon;
  selectedIcon: DrawerIcon;
  /** 현재 경로가 이 그룹에 속하는지 (그룹 헤더 강조·자동 펼침) */
  isGroupActive: (pathname: string) => boolean;
  children: DrawerMenuSubItem[];
};

export type DrawerMenuEntry = DrawerMenuLink | DrawerMenuGroup;

/**
 * 사이드바·모바일 네비 메뉴 정의. 서브 탭 변경 시 이 배열만 편집하세요.
 */
export const DRAWER_MENU_ENTRIES: DrawerMenuEntry[] = [
  {
    kind: 'link',
    id: 'dashboard',
    text: '대시보드',
    shortText: '대시보드',
    route: ROUTE_PATH.dashboard,
    icon: DashboardIcon,
    selectedIcon: DashboardBlueIcon,
  },
  {
    kind: 'link',
    id: 'mileage-list',
    text: '마일리지 조회',
    shortText: '마일리지',
    route: ROUTE_PATH.mileageList,
    icon: MileageListIcon,
    selectedIcon: MileageListBlueIcon,
    isNavActive: pathname =>
      pathname === ROUTE_PATH.mileageList ||
      pathname.startsWith(`${ROUTE_PATH.mileageList}/`),
  },
  {
    kind: 'group',
    id: 'portfolio-management',
    text: '활동 아카이브',
    shortText: '활동',
    icon: BuildingIcon,
    selectedIcon: BuildingBlueIcon,
    isGroupActive: pathname =>
      pathname === ROUTE_PATH.portfolio ||
      pathname.startsWith(`${ROUTE_PATH.portfolio}/`) ||
      pathname === ROUTE_PATH.cv ||
      pathname.startsWith(`${ROUTE_PATH.cv}/`),
    children: [
      {
        id: 'portfolio-main',
        text: '내 활동 관리',
        shortText: '활동',
        route: ROUTE_PATH.portfolio,
        icon: BuildingIcon,
        selectedIcon: BuildingBlueIcon,
        isNavActive: pathname =>
          pathname === ROUTE_PATH.portfolio ||
          pathname.startsWith(`${ROUTE_PATH.portfolio}/`),
      },
      {
        id: 'cv-generate',
        text: '포트폴리오 관리',
        shortText: '포폴',
        route: ROUTE_PATH.cv,
        icon: EditIcon,
        selectedIcon: EditIcon,
        isNavActive: pathname =>
          pathname === ROUTE_PATH.cv ||
          pathname.startsWith(`${ROUTE_PATH.cv}/`),
      },
    ],
  },
  {
    kind: 'link',
    id: 'my-page',
    text: '마이페이지',
    shortText: '프로필',
    route: ROUTE_PATH.myPage,
    icon: UserIcon,
    selectedIcon: UserBlueIcon,
  },
];

function isDrawerMenuGroup(entry: DrawerMenuEntry): entry is DrawerMenuGroup {
  return entry.kind === 'group';
}

const routeNavActiveRegistry = (() => {
  const map = new Map<string, (pathname: string) => boolean>();
  for (const entry of DRAWER_MENU_ENTRIES) {
    if (isDrawerMenuGroup(entry)) {
      entry.children.forEach(child => {
        map.set(child.route, child.isNavActive);
      });
    } else {
      map.set(
        entry.route,
        entry.isNavActive ?? (pathname => pathname === entry.route),
      );
    }
  }
  return map;
})();

export function isRouteActiveForNav(pathname: string, route: string): boolean {
  const matcher = routeNavActiveRegistry.get(route);
  return matcher ? matcher(pathname) : pathname === route;
}

/** 모바일 하단 주 메뉴(그룹은 서브 탭과 분리, 슬롯 1개만 사용) */
export type MobilePrimaryNavItem = {
  key: string;
  text: string;
  shortText: string;
  route: string;
  icon: DrawerIcon;
  selectedIcon: DrawerIcon;
  isActive: (pathname: string) => boolean;
};

export function getMobilePrimaryNavItems(): MobilePrimaryNavItem[] {
  const out: MobilePrimaryNavItem[] = [];
  for (const entry of DRAWER_MENU_ENTRIES) {
    if (isDrawerMenuGroup(entry)) {
      const defaultRoute = entry.children[0]?.route;
      if (!defaultRoute) continue;
      out.push({
        key: entry.id,
        text: entry.text,
        shortText: entry.shortText,
        route: defaultRoute,
        icon: entry.icon,
        selectedIcon: entry.selectedIcon,
        isActive: pathname => entry.isGroupActive(pathname),
      });
    } else {
      out.push({
        key: entry.id,
        text: entry.text,
        shortText: entry.shortText,
        route: entry.route,
        icon: entry.icon,
        selectedIcon: entry.selectedIcon,
        isActive:
          entry.isNavActive ?? (pathname => pathname === entry.route),
      });
    }
  }
  return out;
}

/** 현재 경로가 속한 드로어 그룹(모바일 서브 탭 표시용). 없으면 null */
export function getActiveMenuGroupForPath(
  pathname: string,
): DrawerMenuGroup | null {
  for (const entry of DRAWER_MENU_ENTRIES) {
    if (isDrawerMenuGroup(entry) && entry.isGroupActive(pathname)) {
      return entry;
    }
  }
  return null;
}
