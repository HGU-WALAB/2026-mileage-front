import { DownloadIcon } from '@/assets';
import { Button, Flex, Footer, Text } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { putPortfolioSettings } from '../apis/portfolio';
import {
  SECTION_TITLES,
  type DraggableSectionKey,
} from '../constants/constants';
import { useSummaryContext } from './context/SummaryContext';
import { buildSummaryMarkdown } from './utils/buildSummaryMarkdown';
import {
  ActivitiesSectionContent,
  CertificatesSectionContent,
  DraggableSection,
  MileageSectionContent,
  MileageSelectModal,
  RepoSelectModal,
  RepoSectionContent,
  TechStackSectionContent,
  UserInfoSectionContent,
} from './components';

const GITHUB_STORAGE_KEY = 'github-storage';
function getGithubUsernameFromStorage(): string | null {
  try {
    const raw =
      typeof window !== 'undefined'
        ? localStorage.getItem(GITHUB_STORAGE_KEY)
        : null;
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      state?: { connected?: boolean; githubName?: string | null };
      githubUsername?: string;
    } | null;
    const name = data?.state?.githubName ?? data?.githubUsername;
    return typeof name === 'string' && name.trim() ? name.trim() : null;
  } catch {
    return null;
  }
}

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  certificates: <CardMembershipIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const SummaryEditPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약' });
  const navigate = useNavigate();
  const {
    userInfo,
    sectionOrder,
    setSectionOrder,
    techStackTags,
    repos,
    mileageItems,
    activities,
    certificates,
  } = useSummaryContext();
  const [draggedId, setDraggedId] = useState<DraggableSectionKey | null>(null);
  const [dragOverId, setDragOverId] = useState<DraggableSectionKey | null>(null);
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const hasGithub = getGithubUsernameFromStorage() != null;

  const handleDragStart = useCallback((id: DraggableSectionKey) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (_e: React.DragEvent<HTMLElement>, targetId: DraggableSectionKey) => {
      setDragOverId(targetId);
    },
    [],
  );

  const handleDragLeave = useCallback((_e: React.DragEvent<HTMLElement>) => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (targetId: DraggableSectionKey) => {
      if (draggedId == null || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const fromIdx = sectionOrder.indexOf(draggedId);
      const toIdx = sectionOrder.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const next = [...sectionOrder];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed);
      setSectionOrder(next);
      setDraggedId(null);
      setDragOverId(null);
      putPortfolioSettings({ section_order: next })
        .then(() => {
          toast.success('변경사항이 저장되었습니다.', {
            position: 'top-center',
          });
        })
        .catch(() => {
          toast.error('섹션 순서 저장에 실패했습니다.');
        });
    },
    [draggedId, sectionOrder, setSectionOrder],
  );

  const renderSectionContent = (key: DraggableSectionKey) => {
    switch (key) {
      case 'tech':
        return <TechStackSectionContent />;
      case 'repo':
        return <RepoSectionContent />;
      case 'mileage':
        return <MileageSectionContent />;
      case 'activities':
        return <ActivitiesSectionContent />;
      case 'certificates':
        return <CertificatesSectionContent />;
      default:
        return null;
    }
  };

  const handleCopyMarkdown = useCallback(async () => {
    let markdown: string;
    try {
      markdown = buildSummaryMarkdown({
        userInfo,
        sectionOrder,
        techStackTags,
        repos,
        mileageItems,
        activities,
        certificates,
      });
    } catch {
      toast.error('마크다운 생성에 실패했습니다.');
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = markdown;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('프롬프트가 클립보드에 복사되었습니다.');
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }, [userInfo, sectionOrder, techStackTags, repos, mileageItems, activities, certificates]);

  const repoHeaderRight =
    hasGithub ? (
      <S.RepoSelectButton
        type="button"
        onClick={() => setRepoModalOpen(true)}
      >
        <FolderIcon sx={{ fontSize: 18 }} />
        깃허브 레포지토리 선택하기
      </S.RepoSelectButton>
    ) : undefined;

  const mileageHeaderRight = (
    <S.RepoSelectButton
      type="button"
      onClick={() => setMileageModalOpen(true)}
    >
      <MenuBookIcon sx={{ fontSize: 18 }} />
      마일리지 선택하기
    </S.RepoSelectButton>
  );

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.TopRow align="center" justify="space-between" gap="1rem" wrap="wrap">
        <S.GuideText>
          포트폴리오를 제작하기 위한 페이지입니다. 아래 항목을 통해
          포트폴리오가 생성됩니다.
        </S.GuideText>
        <S.ButtonGroup gap="0.5rem">
          <S.PreviewButton
            variant="outlined"
            size="large"
            onClick={() => navigate(ROUTE_PATH.summaryPreview)}
          >
            미리보기
          </S.PreviewButton>
          <Button
            label="프롬프트 복사"
            variant="contained"
            color="blue"
            size="large"
            icon={DownloadIcon}
            iconPosition="start"
            onClick={handleCopyMarkdown}
          />
        </S.ButtonGroup>
      </S.TopRow>
      <UserInfoSectionContent />
      <Flex.Column gap="1rem">
        {sectionOrder.map(key => (
          <DraggableSection
            key={key}
            sectionId={key}
            title={SECTION_TITLES[key]}
            subtitle={
              key === 'activities'
                ? '교내·외 수상 경력, 동아리, 대외활동 등을 추가하면 더 풍부한 포트폴리오 설명을 생성할 수 있습니다.'
                : key === 'mileage'
                  ? '해당 마일리지 활동의 구체적인 내용을 입력하면 더욱 완성도 높은 포트폴리오 설명을 생성할 수 있습니다.'
                  : key === 'certificates'
                    ? '운전면허증, 정보처리기사, SQLD 등 보유 자격증을 추가하여 더 풍부한 포트폴리오 설명을 생성할 수 있습니다.'
                    : undefined
            }
            icon={SECTION_ICONS[key]}
            headerRight={
              key === 'repo'
                ? repoHeaderRight
                : key === 'mileage'
                  ? mileageHeaderRight
                  : undefined
            }
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOverId === key}
          >
            {renderSectionContent(key)}
          </DraggableSection> 

        ))}
      </Flex.Column> 
      <RepoSelectModal
        open={repoModalOpen}
        onClose={() => setRepoModalOpen(false)}
      />
      <MileageSelectModal
        open={mileageModalOpen}
        onClose={() => setMileageModalOpen(false)}
      />
      <Footer />
    </Flex.Column>
  );
};

export default SummaryEditPage;

const S = {
  TopRow: styled(Flex.Row)`
    margin-bottom: 0.5rem;
    width: 100%;
  `,
  GuideText: styled(Text)`
    margin: 0;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    letter-spacing: 0.01em;
    color: ${palette.grey600};
    background-color: ${palette.blue300};
    border-left: 3px solid ${palette.blue500};
    border-radius: 0 0.5rem 0.5rem 0;
    flex: 1 1 16rem;
    min-width: 0;
  `,
  ButtonGroup: styled(Flex.Row)`
    flex-shrink: 0;
  `,
  PreviewButton: styled(MuiButton)`
    width: 7.5rem;
    border-color: ${palette.blue400};
    color: ${palette.blue400};
    border-radius: 0.75rem;
    &:hover {
      border-color: ${palette.blue600};
      color: ${palette.blue600};
      background-color: rgba(91, 140, 241, 0.08);
    }
  `,
  RepoSelectButton: styled('button')`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    background-color: ${palette.blue500};
    color: ${palette.white};
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(83, 127, 241, 0.25);
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
    white-space: nowrap;
    &:hover {
      background-color: ${palette.blue600};
      box-shadow: 0 2px 6px rgba(83, 127, 241, 0.3);
    }
    @media (max-width: 500px) {
      width: 100%;
      justify-content: center;
    }
  `,
};
