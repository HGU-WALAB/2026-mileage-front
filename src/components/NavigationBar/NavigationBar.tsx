import { Flex } from '@/components';
import { getMobilePrimaryNavItems } from '@/constants/drawerMenu';
import { navigationBarHeight } from '@/constants/layoutSize';
import { getOpacityColor } from '@/utils/getOpacityColor';
import { styled } from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** 모바일 하단 네비 순서 (shortText 기준). 그룹은 서브 탭으로만 전환 */
const MOBILE_NAV_ORDER: string[] = [
  '대시보드',
  '마일리지',
  '활동',
  '프로필',
];

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = useMemo(() => {
    return getMobilePrimaryNavItems().sort(
      (a, b) =>
        MOBILE_NAV_ORDER.indexOf(a.shortText) -
        MOBILE_NAV_ORDER.indexOf(b.shortText),
    );
  }, []);

  return (
    <S.Container
      height={`${navigationBarHeight}px`}
      width="100%"
      align="center"
      justify="space-between"
    >
      {navigationItems.map(item => {
        const selected = item.isActive(location.pathname);
        return (
          <S.Navigation
            key={`navigation-${item.key}`}
            justify="center"
            align="center"
            onClick={() => navigate(item.route)}
          >
            <S.Item
              selected={selected}
              justify="center"
              align="center"
              pointer
            >
              {selected ? <item.selectedIcon /> : <item.icon />}
              {item.shortText}
            </S.Item>
          </S.Navigation>
        );
      })}
    </S.Container>
  );
};

export default NavigationBar;

const S = {
  Container: styled(Flex.Row)`
    backdrop-filter: blur(1.875rem);
    background-color: ${({ theme }) =>
      getOpacityColor(theme.palette.white, 0.1)};
    flex-shrink: 0;
  `,
  Navigation: styled(Flex.Column)`
    ${({ theme }) => theme.typography.body2};
    height: 100%;
    width: 100%;
  `,
  Item: styled(Flex.Column)<{ selected: boolean }>`
    background-color: ${({ selected, theme }) =>
      selected ? theme.palette.white : 'none'};
    border-radius: 0.5rem;
    color: ${({ selected, theme }) =>
      selected ? theme.palette.primary.main : theme.palette.white};
    height: 90%;
    width: 90%;
  `,
};
