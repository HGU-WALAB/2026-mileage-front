import { DownloadIcon } from '@/assets';
import { Button, Flex, Footer } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { SECTION_TITLES, type DraggableSectionKey } from '../constants/constants';
import { useSummaryContext } from './context/SummaryContext';
import { buildSummaryMarkdown } from './utils/buildSummaryMarkdown';
import {
  ActivitiesSectionContent,
  MileageSectionContent,
  RepoSectionContent,
  StaticSection,
  TechStackSectionContent,
  UserInfoSectionContent,
} from './components';

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech_stack: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const SummaryPreviewPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약 미리보기' });
  const navigate = useNavigate();
  const {
    sectionOrder,
    techStackTags,
    repos,
    mileageItems,
    activities,
  } = useSummaryContext();

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

  const renderSectionContent = (key: DraggableSectionKey) => {
    switch (key) {
      case 'tech_stack':
        return <TechStackSectionContent readOnly />;
      case 'repo':
        return <RepoSectionContent readOnly />;
      case 'mileage':
        return <MileageSectionContent readOnly />;
      case 'activities':
        return <ActivitiesSectionContent readOnly />;
      default:
        return null;
    }
  };

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.ButtonRow justify="flex-end" gap="0.5rem">
        <S.EditButton
          variant="outlined"
          size="medium"
          onClick={() => navigate(ROUTE_PATH.summary)}
        >
          편집
        </S.EditButton>
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
          <StaticSection
            key={key}
            title={SECTION_TITLES[key]}
            icon={SECTION_ICONS[key]}
          >
            {renderSectionContent(key)}
          </StaticSection>
        ))}
      </Flex.Column>
      <Footer />
    </Flex.Column>
  );
};

export default SummaryPreviewPage;

const S = {
  ButtonRow: styled(Flex.Row)`
    margin-bottom: 0.5rem;
    width: 100%;
  `,
  EditButton: styled(MuiButton)`
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
