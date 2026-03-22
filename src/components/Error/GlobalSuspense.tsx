import { Suspense } from 'react';

import FullViewportLoading from './FullViewportLoading';

const GlobalSuspense = ({ children }: { children: JSX.Element }) => (
  <Suspense fallback={<FullViewportLoading />}>
    {children}
  </Suspense>
);

export default GlobalSuspense;
