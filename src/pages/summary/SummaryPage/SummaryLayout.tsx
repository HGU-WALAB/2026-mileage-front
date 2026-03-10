import { Outlet } from 'react-router-dom';

import { SummaryProvider } from './context/SummaryContext';

const SummaryLayout = () => (
  <SummaryProvider>
    <Outlet />
  </SummaryProvider>
);

export default SummaryLayout;
