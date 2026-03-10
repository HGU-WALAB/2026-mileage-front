import { DownloadIcon } from '@/assets';
import { Button, Flex, Footer } from '@/components';
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
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { SECTION_TITLES, type DraggableSectionKey } from '../constants/constants';
import { useSummaryContext } from './context/SummaryContext';
import { buildSummaryMarkdown } from './utils/buildSummaryMarkdown';
import {
  ActivitiesSectionContent,
  CertificatesSectionContent,
  MileageSectionContent,
  RepoSectionContent,
  StaticSection,
  TechStackSectionContent,
  UserInfoSectionContent,
} from './components';

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  certificates: <CardMembershipIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const SummaryPreviewPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약 미리보기' });
  const navigate = useNavigate();
  const {
    userInfo,
    sectionOrder,
    techStackTags,
    repos,
    mileageItems,
    activities,
    certificates,
  } = useSummaryContext();

  const handleCopyMarkdown = useCallback(async () => {
    const markdown = buildSummaryMarkdown({
      userInfo,
      sectionOrder,
      techStackTags,
      repos,
      mileageItems,
      activities,
      certificates,
    });
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('마크다운이 클립보드에 복사되었습니다.');
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }, [userInfo, sectionOrder, techStackTags, repos, mileageItems, activities, certificates]);

  const renderSectionContent = (key: DraggableSectionKey) => {
    switch (key) {
      case 'tech':
        return <TechStackSectionContent readOnly />;
      case 'repo':
        return <RepoSectionContent readOnly />;
      case 'mileage':
        return <MileageSectionContent readOnly />;
      case 'activities':
        return <ActivitiesSectionContent readOnly />;
      case 'certificates':
        return <CertificatesSectionContent readOnly />;
      default:
        return null;
    }
  };

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.ButtonRow justify="flex-end" gap="0.5rem">
        <S.EditButton
          variant="outlined"
          size="large"
          onClick={() => navigate(ROUTE_PATH.summary)}
        >
          편집
        </S.EditButton>
        <Button
          label="프롬프트 복사"
          variant="contained"
          color="blue"
          size="large"
          icon={DownloadIcon}
          iconPosition="start"
          onClick={handleCopyMarkdown}
        />
      </S.ButtonRow>
      <UserInfoSectionContent readOnly />
      <Flex.Column gap="1rem">
        {sectionOrder.map(key => (
          <StaticSection
            key={key}
            title={SECTION_TITLES[key]}
            subtitle={
              key === 'activities'
                ? '교내·외 수상 경력, 동아리, 대외활동 등을 추가하면 더 풍부한 포트폴리오 설명을 생성할 수 있습니다.'
                : key === 'mileage'
                  ? '해당 마일리지 활동의 구체적인 내용을 입력하면 더욱 완성도 높은 포트폴리오 설명을 생성할 수 있습니다.'
                  : undefined
            }
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
