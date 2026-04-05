import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { styled } from '@mui/material/styles';
import { getPortfolioCvShareHtml } from '@/pages/cv/apis/cv';
import { isCvPublicTokenFormat } from '@/pages/cv/utils/cvPublicToken';
import { palette } from '@/styles/palette';

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

  const srcDoc = useMemo(() => {
    if (!hasParam || !tokenOk) return null;
    if (query.isError || !query.data) return null;
    const { data } = query;
    if (data.status === 200) return data.html;
    if (data.status === 403 || data.status === 404) return data.guidanceHtml;
    return null;
  }, [hasParam, query.data, query.isError, tokenOk]);

  if (!srcDoc) {
    return <S.Root aria-busy={query.isPending ? true : undefined} />;
  }

  return (
    <S.Root>
      <iframe title="HTML 미리보기" srcDoc={srcDoc} sandbox="allow-same-origin" />
    </S.Root>
  );
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
};
