import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getGitHubCallback } from '@/pages/profile/apis/github';
import { postGithubRepositoriesCacheRefresh } from '@/pages/portfolio/apis/repositories';
import { ROUTE_PATH } from '@/constants/routePath';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Flex, Text } from '@/components';
import { BoxSkeleton } from '@/components';
import { styled, useTheme } from '@mui/material';

const GitHubCallbackPage = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const status = await getGitHubCallback(
          code || undefined,
          error || undefined,
        );
        if (status.connected) {
          try {
            await postGithubRepositoriesCacheRefresh();
          } catch {
            // 캐시 갱신 실패해도 연결 플로우는 계속 (마이페이지에서 모달로 재시도 가능)
          }
        }
        // GitHub 상태 쿼리 무효화하여 최신 상태 가져오기
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.githubStatus],
        });
        // 연결 성공 시 마이페이지로 이동
        navigate(ROUTE_PATH.myPage);
      } catch (err) {
        console.error('GitHub 콜백 처리 중 오류:', err);
        // 에러 발생 시에도 마이페이지로 이동
        navigate(ROUTE_PATH.myPage);
      }
    };

    handleCallback();
  }, [code, error, navigate, queryClient]);

  return (
    <S.Container>
      <BoxSkeleton height={400} />
      <Text
        style={{
          ...theme.typography.body2,
          color: theme.palette.grey[600],
          fontSize: '1rem',
          textAlign: 'center',
          marginTop: '1rem',
        }}
      >
        GitHub 연결 처리 중...
      </Text>
    </S.Container>
  );
};

export default GitHubCallbackPage;

const S = {
  Container: styled(Flex.Column)`
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  `,
};



