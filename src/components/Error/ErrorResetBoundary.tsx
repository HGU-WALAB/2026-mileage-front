import { GlobalErrorBoundary, GlobalSuspense } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import useCvWizardStore from '@/stores/useCvWizardStore';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/** /cv 가 아닌 경로로 이동하면 CV 생성 마법사 상태를 초기화합니다. */
function ClearCvWizardOnLeaveCvRoute() {
  const location = useLocation();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathnameRef.current;
    if (prev === ROUTE_PATH.cv && location.pathname !== ROUTE_PATH.cv) {
      useCvWizardStore.getState().resetAll();
    }
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (prevPathnameRef.current === ROUTE_PATH.cv) {
        useCvWizardStore.getState().resetAll();
      }
    };
  }, []);

  return null;
}

const ErrorResetBoundary = () => {
  return (
    <QueryErrorResetBoundary>
      <GlobalErrorBoundary>
        <GlobalSuspense>
          <>
            <ClearCvWizardOnLeaveCvRoute />
            <Outlet />
          </>
        </GlobalSuspense>
      </GlobalErrorBoundary>
    </QueryErrorResetBoundary>
  );
};

export default ErrorResetBoundary;
