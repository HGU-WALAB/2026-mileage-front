import { AuthGuard, DrawerLayout, Layout, MaintenanceGate } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

const DashboardPage = React.lazy(
  () => import('@/pages/dashboard/DashboardPage'),
);
const MileageListPage = React.lazy(
  () => import('@/pages/mileage/MileageListPage'),
);
const AddMileagePage = React.lazy(() => import('@/pages/mileage/MileageAddPage'));
const ScholarshipApplyPage = React.lazy(
  () => import('@/pages/mileage/ScholarshipApplyPage'),
);
const MyPage = React.lazy(() => import('@/pages/profile/MyPage'));
// const SummaryLayout = React.lazy(
//   () => import('@/pages/summary/SummaryPage/SummaryLayout'),
// );
// const SummaryEditPage = React.lazy(
//   () => import('@/pages/summary/SummaryPage/SummaryEditPage'),
// );
// const SummaryPreviewPage = React.lazy(
//   () => import('@/pages/summary/SummaryPage/SummaryPreviewPage'),
// );
const GitHubCallbackPage = React.lazy(
  () => import('@/pages/profile/GitHubCallbackPage'),
);
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const ErrorPage = React.lazy(() => import('@/pages/etc/ErrorPage'));
const NotFoundPage = React.lazy(() => import('@/pages/etc/NotFoundPage'));

const router = createBrowserRouter(
  [
    {
      element: <MaintenanceGate />,
      children: [
        {
          element: (
            <AuthGuard>
              <DrawerLayout />
            </AuthGuard>
          ),
          errorElement: <ErrorPage />,
          children: [
            {
              path: ROUTE_PATH.dashboard,
              element: <DashboardPage />,
            },
            {
              path: ROUTE_PATH.mileageList,
              element: <MileageListPage />,
            },
            {
              path: ROUTE_PATH.newMileage,
              element: <AddMileagePage />,
            },
            {
              path: ROUTE_PATH.scholarship,
              element: <ScholarshipApplyPage />,
            },
            {
              path: ROUTE_PATH.myPage,
              element: <MyPage />,
            },
            {
              path: '*',
              element: <NotFoundPage />,
            },
          ],
        },
        {
          element: <Layout />,
          children: [
            {
              path: ROUTE_PATH.login,
              element: <LoginPage />,
            },
            {
              path: ROUTE_PATH.githubCallback,
              element: <GitHubCallbackPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: '/milestone25/',
  },
);

export default router;
