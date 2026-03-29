import { Button, Flex, Footer } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type FunctionComponent, type SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { SECTION_TITLES, type DraggableSectionKey } from '../constants/constants';
import { usePortfolioContext } from './context/PortfolioContext';
import {
  ActivitiesSectionContent,
  MileageSectionContent,
  PortfolioPromptQualityDashboard,
  RepoSectionContent,
  ScrollToTopFab,
  StaticSection,
  TechStackSectionContent,
  UserInfoSectionContent,
} from './components';
import { useScrollPortfolioSection } from './hooks';
import {
  PROMPT_QUALITY_SECTION_HINTS,
  usePortfolioPromptProgress,
} from './utils/portfolioPromptProgress';

/** MUI SvgIcon은 Button `icon` 타입과 달라 래핑 */
const ResumePaperIcon: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <DescriptionIcon sx={{ fontSize: 20 }} />
);

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const PortfolioPreviewPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약 미리보기' });
  const navigate = useNavigate();
  const { sectionOrder } = usePortfolioContext();
  const promptProgress = usePortfolioPromptProgress();
  const handlePromptQualitySectionClick = useScrollPortfolioSection();

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
          onClick={() => navigate(ROUTE_PATH.portfolio)}
        >
          편집
        </S.EditButton>
        <Button
          label="포트폴리오 관리"
          variant="contained"
          color="blue"
          size="large"
          icon={ResumePaperIcon}
          iconPosition="start"
        />
      </S.ButtonRow>
      <PortfolioPromptQualityDashboard
        progress={promptProgress}
        onSectionClick={handlePromptQualitySectionClick}
      />
      <UserInfoSectionContent readOnly />
      <Flex.Column gap="1rem">
        {sectionOrder.map(key => (
          <StaticSection
            key={key}
            anchorSectionKey={key}
            title={SECTION_TITLES[key]}
            subtitle={
              key === 'activities'
                ? '교내·외 수상 경력, 동아리, 대외활동 등을 추가하면 더 풍부한 포트폴리오 설명을 생성할 수 있습니다.'
                : key === 'mileage'
                  ? '해당 마일리지 활동의 구체적인 내용을 입력하면 더욱 완성도 높은 포트폴리오 설명을 생성할 수 있습니다.'
                  : undefined
            }
            icon={SECTION_ICONS[key]}
            promptFooter={{
              percent: promptProgress[key],
              hint: PROMPT_QUALITY_SECTION_HINTS[key],
            }}
          >
            {renderSectionContent(key)}
          </StaticSection>
        ))}
      </Flex.Column>
      <ScrollToTopFab />
      <Footer />
    </Flex.Column>
  );
};

export default PortfolioPreviewPage;

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
