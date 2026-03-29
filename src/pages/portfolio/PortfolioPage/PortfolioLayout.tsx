import { Outlet } from 'react-router-dom';

import { PortfolioProvider } from './context/PortfolioContext';

const PortfolioLayout = () => (
  <PortfolioProvider>
    <Outlet />
  </PortfolioProvider>
);

export default PortfolioLayout;
