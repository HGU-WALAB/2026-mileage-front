import {
  getActiveMenuGroupForPath,
  isRouteActiveForNav,
} from '@/constants/drawerMenu';
import { mobileNavSubTabsStripHeight } from '@/constants/layoutSize';
import { getOpacityColor } from '@/utils/getOpacityColor';
import { ButtonBase, styled } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

/** 마일리지 관리 등 그룹 URL일 때만 하단 네비 위에 서브 탭 표시 */
const MobileNavGroupSubTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const group = getActiveMenuGroupForPath(location.pathname);

  if (!group) return null;

  return (
    <S.Strip role="tablist" aria-label={`${group.text} 하위 메뉴`}>
      {group.children.map(child => {
        const selected = isRouteActiveForNav(location.pathname, child.route);
        return (
          <S.Tab
            key={child.id}
            role="tab"
            aria-selected={selected}
            selected={selected}
            onClick={() => navigate(child.route)}
          >
            {child.text}
          </S.Tab>
        );
      })}
    </S.Strip>
  );
};

export default MobileNavGroupSubTabs;

const S = {
  Strip: styled('div')`
    backdrop-filter: blur(1.875rem);
    background-color: ${({ theme }) =>
      getOpacityColor(theme.palette.white, 0.12)};
    border-bottom: 1px solid
      ${({ theme }) => getOpacityColor(theme.palette.white, 0.08)};
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    min-height: ${mobileNavSubTabsStripHeight}px;
    width: 100%;
  `,
  Tab: styled(ButtonBase, {
    shouldForwardProp: prop => prop !== 'selected',
  })<{ selected: boolean }>`
    border-radius: 0.375rem;
    color: ${({ theme, selected }) =>
      selected ? theme.palette.primary.main : theme.palette.white};
    flex: 1;
    font-size: 0.8125rem;
    font-weight: ${({ selected }) => (selected ? 600 : 500)};
    justify-content: center;
    margin: 0.25rem;
    min-height: 2rem;
    padding: 0 0.25rem;
    text-align: center;
    background-color: ${({ theme, selected }) =>
      selected ? theme.palette.white : 'transparent'};

    &:hover {
      background-color: ${({ theme, selected }) =>
        selected
          ? getOpacityColor(theme.palette.white, 0.95)
          : getOpacityColor(theme.palette.white, 0.15)};
    }
  `,
};
