import { Outlet } from 'react-router-dom';

/**
 * `/cv` 하위(관리 화면·생성 마법사) 공통 레이아웃. Provider는 상위 `PortfolioLayout`에서 제공.
 */
const CvRoutesLayout = () => {
  return <Outlet />;
};

export default CvRoutesLayout;
