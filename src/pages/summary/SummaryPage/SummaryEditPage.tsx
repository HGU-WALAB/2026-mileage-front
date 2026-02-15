import { DownloadIcon } from '@/assets';
import { Button, Flex, Footer } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { Button as MuiButton, InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  SECTION_TITLES,
  type DraggableSectionKey,
} from '../constants/constants';
import { useSummaryContext } from './context/SummaryContext';
import { buildSummaryMarkdown } from './utils/buildSummaryMarkdown';
import {
  ActivitiesSectionContent,
  DraggableSection,
  MileageSectionContent,
  RepoSectionContent,
  TechStackSectionContent,
  UserInfoSectionContent,
} from './components';

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech_stack: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const SummaryEditPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약' });
  const navigate = useNavigate();
  const {
    sectionOrder,
    setSectionOrder,
    techStackTags,
    repos,
    mileageItems,
    activities,
  } = useSummaryContext();
  const [draggedId, setDraggedId] = useState<DraggableSectionKey | null>(null);
  const [githubSearchQuery, setGithubSearchQuery] = useState('');
  const [dragOverId, setDragOverId] = useState<DraggableSectionKey | null>(
    null,
  );

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
    },
    [draggedId, sectionOrder, setSectionOrder],
  );

  const renderSectionContent = (key: DraggableSectionKey) => {
    switch (key) {
      case 'tech_stack':
        return <TechStackSectionContent />;
      case 'repo':
        return <RepoSectionContent searchQuery={githubSearchQuery} />;
      case 'mileage':
        return <MileageSectionContent />;
      case 'activities':
        return <ActivitiesSectionContent />;
      default:
        return null;
    }
  };

  const handleCopyMarkdown = useCallback(async () => {
    const markdown = buildSummaryMarkdown({
      sectionOrder,
      techStackTags,
      repos,
      mileageItems,
      activities,
    });
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('마크다운이 클립보드에 복사되었습니다.');
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }, [sectionOrder, techStackTags, repos, mileageItems, activities]);

  const repoHeaderRight = (
    <S.SearchInputWrap>
      <SearchIcon sx={{ fontSize: 18, color: palette.grey500 }} />
      <S.GithubSearchInput
        placeholder="레포지토리 이름으로 검색"
        value={githubSearchQuery}
        onChange={e => setGithubSearchQuery(e.target.value)}
        inputProps={{ 'aria-label': '레포지토리 이름 검색' }}
      />
    </S.SearchInputWrap>
  );

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.ButtonRow justify="flex-end" gap="0.5rem">
        <S.PreviewButton
          variant="outlined"
          size="medium"
          onClick={() => navigate(ROUTE_PATH.summaryPreview)}
        >
          미리보기
        </S.PreviewButton>
        <Button
          label="마크다운"
          variant="contained"
          color="blue"
          size="medium"
          icon={DownloadIcon}
          iconPosition="start"
          style={{ width: '7.5rem' }}
          onClick={handleCopyMarkdown}
        />
      </S.ButtonRow>
      <UserInfoSectionContent />
      <Flex.Column gap="1rem">
        {sectionOrder.map(key => (
          <DraggableSection
            key={key}
            sectionId={key}
            title={SECTION_TITLES[key]}
            icon={SECTION_ICONS[key]}
            headerRight={key === 'repo' ? repoHeaderRight : undefined}
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
      <Footer />
    </Flex.Column>
  );
};

export default SummaryEditPage;

const S = {
  SearchInputWrap: styled('div')`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 12rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.grey[100]};
  `,
  GithubSearchInput: styled(InputBase)`
    flex: 1;
    font-size: 0.875rem;
    & .MuiInputBase-input {
      padding: 0;
      &::placeholder {
        color: ${palette.grey500};
      }
    }
  `,
  ButtonRow: styled(Flex.Row)`
    margin-bottom: 0.5rem;
    width: 100%;
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
};
