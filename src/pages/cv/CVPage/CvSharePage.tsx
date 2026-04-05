import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import { AxiosError } from 'axios';
import { EmptyBoxImg } from '@/assets';
import { Button, Flex, Heading, Text } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { getPortfolioCvShareHtml } from '@/pages/cv/apis/cv';
import { isCvPublicTokenFormat } from '@/pages/cv/utils/cvPublicToken';
import { palette } from '@/styles/palette';
import { getErrorMessage } from '@/utils/getErrorMessage';

const EMPTY_SHARE_MESSAGE =
  '공개 포트폴리오 내용이 아직 없어요. 잠시 후 다시 확인해 주세요.';
const EMPTY_SHARE_DESCRIPTION =
  '작성자가 HTML을 아직 생성하지 않았거나, 내용이 비어 있을 수 있어요.';

const CV_SHARE_NOT_FOUND_TITLE = '공개 포트폴리오를 찾을 수 없어요';
const CV_SHARE_NOT_FOUND_DESCRIPTION =
  '링크가 잘못되었거나, 포트폴리오 비공개로 바뀌었거나 삭제되었을 수 있어요.';

const CV_SHARE_FORBIDDEN_TITLE = '이 포트폴리오를 볼 수 없어요';
const CV_SHARE_FORBIDDEN_DESCRIPTION =
  '비공개로 전환되었거나, 이 링크로는 더 이상 열람할 수 없어요.';

const INVALID_TOKEN_DESCRIPTION =
  '공개 링크 주소가 올바른지 다시 확인해 주세요.';

function messageForUnknownError(error: unknown): string {
  if (error instanceof AxiosError && error.response?.status != null) {
    return getErrorMessage(String(error.response.status));
  }
  return getErrorMessage('default');
}

type CvShareGuidanceProps = {
  title: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
};

/**
 * PageErrorFallback / ErrorPage 계열과 맞춘 공개 이력서 전용 안내 (iframe guidance HTML 대신 앱 UI).
 */
function CvShareGuidance({
  title,
  description,
  showRetry,
  onRetry,
}: CvShareGuidanceProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <S.MessageWrap>
      <S.GuidanceCard>
        <Flex.Column width="100%" gap="1.25rem" justify="center" align="center">
          <EmptyBoxImg />
          <Flex.Column gap="0.5rem" align="center" width="100%">
            <Heading
              as="h2"
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: theme.palette.grey300,
                textAlign: 'center',
                lineHeight: 1.35,
              }}
            >
              {title}
            </Heading>
            {description ? (
              <Text
                as="p"
                margin="0"
                color={palette.grey400}
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.65,
                  textAlign: 'center',
                  maxWidth: '100%',
                }}
              >
                {description}
              </Text>
            ) : null}
          </Flex.Column>
          <Flex
            direction="row"
            gap="0.75rem"
            wrap="wrap"
            justify="center"
            align="center"
          >
            <Button
              label="홈으로 가기"
              variant="contained"
              color="blue"
              size="medium"
              onClick={() => navigate(ROUTE_PATH.login)}
            />
            {showRetry && onRetry ? (
              <Button
                label="다시 시도하기"
                variant="outlined"
                color="blue"
                size="medium"
                onClick={onRetry}
              />
            ) : null}
          </Flex>
        </Flex.Column>
      </S.GuidanceCard>
    </S.MessageWrap>
  );
}

export default function CvSharePage() {
  const { publicToken } = useParams<{ publicToken: string }>();

  const tokenTrimmed = publicToken?.trim() ?? '';
  const hasParam = publicToken !== undefined;
  const tokenOk = hasParam && isCvPublicTokenFormat(tokenTrimmed);

  const query = useQuery({
    queryKey: ['cv', 'html', 'public', tokenTrimmed],
    queryFn: () => getPortfolioCvShareHtml(tokenTrimmed),
    enabled: tokenOk,
    retry: false,
  });

  if (!hasParam || !tokenOk) {
    return (
      <S.Root>
        <CvShareGuidance
          title={getErrorMessage('404')}
          description={INVALID_TOKEN_DESCRIPTION}
        />
      </S.Root>
    );
  }

  if (query.isPending) {
    return <S.Root aria-busy />;
  }

  if (query.isError) {
    return (
      <S.Root>
        <CvShareGuidance
          title={messageForUnknownError(query.error)}
          showRetry
          onRetry={() => query.refetch()}
        />
      </S.Root>
    );
  }

  const data = query.data;
  if (!data) {
    return <S.Root />;
  }

  if (data.status === 200) {
    return (
      <S.Root>
        <iframe title="공개 포트폴리오" srcDoc={data.html} sandbox="allow-same-origin" />
      </S.Root>
    );
  }

  if (data.status === 204) {
    return (
      <S.Root>
        <CvShareGuidance
          title={EMPTY_SHARE_MESSAGE}
          description={EMPTY_SHARE_DESCRIPTION}
        />
      </S.Root>
    );
  }

  if (data.status === 403) {
    return (
      <S.Root>
        <CvShareGuidance
          title={CV_SHARE_FORBIDDEN_TITLE}
          description={CV_SHARE_FORBIDDEN_DESCRIPTION}
        />
      </S.Root>
    );
  }

  if (data.status === 404) {
    return (
      <S.Root>
        <CvShareGuidance
          title={CV_SHARE_NOT_FOUND_TITLE}
          description={CV_SHARE_NOT_FOUND_DESCRIPTION}
        />
      </S.Root>
    );
  }

  return <S.Root />;
}

const S = {
  Root: styled('div')`
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    background-color: ${palette.white};

    & > iframe {
      display: block;
      width: 100%;
      min-height: 100vh;
      border: none;
    }
  `,
  MessageWrap: styled('div')`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    padding: 1.5rem;
  `,
  GuidanceCard: styled('div')`
    box-sizing: border-box;
    /* 404 기본 문구 한 줄 표시(일반 뷰포트) — 패딩 제외 본문 폭 확보 */
    max-width: min(38rem, 100%);
    width: 100%;
    padding: 2rem 1.75rem;
    border-radius: 1rem;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.white};
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  `,
};
