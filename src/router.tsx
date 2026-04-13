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
const PortfolioLayout = React.lazy(
  () => import('@/pages/portfolio/PortfolioPage/PortfolioLayout'),
);
const PortfolioEditPage = React.lazy(
  () => import('@/pages/portfolio/PortfolioPage/PortfolioEditPage'),
);
const CvRoutesLayout = React.lazy(() => import('@/pages/cv/CVPage/CvRoutesLayout'));
const CvManagePage = React.lazy(() => import('@/pages/cv/CVPage/CvManagePage'));
const CvGeneratePage = React.lazy(() => import('@/pages/cv/CVPage/CvGeneratePage'));
const CvSharePage = React.lazy(() => import('@/pages/cv/CVPage/CvSharePage'));
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
              element: <PortfolioLayout />,
              children: [
                {
                  path: ROUTE_PATH.portfolio,
                  element: <PortfolioEditPage />,
                },
                {
                  path: ROUTE_PATH.cv,
                  element: <CvRoutesLayout />,
                  children: [
                    { index: true, element: <CvManagePage /> },
                    { path: 'generate', element: <CvGeneratePage /> },
                  ],
                },
              ],
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
            {
              path: ROUTE_PATH.cvShare,
              element: <CvSharePage />,
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
