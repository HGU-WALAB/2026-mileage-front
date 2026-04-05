import { Button, Flex, Footer, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button as MuiButton, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef, useState, type FunctionComponent, type SVGProps } from 'react';

import { CvManagementPanel } from '@/pages/cv';
import useGetGitHubStatusQuery from '@/pages/profile/hooks/useGetGitHubStatusQuery';
import {
  SECTION_TITLES,
  type DraggableSectionKey,
} from '../constants/constants';
import { usePortfolioContext } from './context/PortfolioContext';
import {
  ActivitiesSectionContent,
  type ActivitiesSectionContentHandle,
  DraggableSection,
  MileageSectionContent,
  MileageSelectModal,
  PortfolioPromptQualityDashboard,
  RepoSelectModal,
  RepoSectionContent,
  ScrollToTopFab,
  TechStackSectionContent,
  type TechStackSectionContentHandle,
  UserInfoSectionContent,
} from './components';
import {
  useCvPanelOpenFromQuery,
  usePortfolioSectionOrderDragDrop,
  useScrollPortfolioSection,
} from './hooks';
import {
  PROMPT_QUALITY_SECTION_HINTS,
  usePortfolioPromptProgress,
} from './utils/portfolioPromptProgress';

/** MUI SvgIcon은 Button `icon` 타입과 달라 래핑 */
const ResumePaperIcon: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <DescriptionIcon sx={{ fontSize: 20 }} />
);

const AddPlusIcon: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AddIcon sx={{ fontSize: 20 }} />
);

const SECTION_ICONS: Record<DraggableSectionKey, React.ReactNode> = {
  tech: <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  repo: <FolderIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  mileage: <MenuBookIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
  activities: <EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey500 }} />,
};

const PortfolioEditPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약' });
  const {
    sectionOrder,
    setSectionOrder,
    isTechStackLoading,
    isReposLoading,
    isMileageLoading,
    isActivitiesLoading,
  } = usePortfolioContext();
  const { cvPanelOpen, setCvPanelOpen } = useCvPanelOpenFromQuery();
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const { data: githubStatus } = useGetGitHubStatusQuery();
  const hasGithub = githubStatus?.connected === true && !!githubStatus?.githubUsername;
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const techStackRef = useRef<TechStackSectionContentHandle>(null);
  const activitiesRef = useRef<ActivitiesSectionContentHandle>(null);
  const promptProgress = usePortfolioPromptProgress();
  const handlePromptQualitySectionClick = useScrollPortfolioSection();
  const {
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = usePortfolioSectionOrderDragDrop(sectionOrder, setSectionOrder);

  const renderSectionContent = (key: DraggableSectionKey) => {
    switch (key) {
      case 'tech':
        return <TechStackSectionContent ref={techStackRef} />;
      case 'repo':
        return <RepoSectionContent />;
      case 'mileage':
        return <MileageSectionContent />;
      case 'activities':
        return <ActivitiesSectionContent ref={activitiesRef} />;
      default:
        return null;
    }
  };

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

  /** 모바일에서 포트폴리오 패널만 표시 (내 활동 본문 숨김) */
  const mobileCvOnly = isMobile && cvPanelOpen;

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.TopRow align="center" justify="space-between" gap="1rem" wrap="wrap">
        <S.GuideText>
          포트폴리오를 제작하기 위한 페이지입니다. 아래 항목을 통해
          포트폴리오가 생성됩니다.
        </S.GuideText>
        <S.ButtonGroup gap="0.5rem">
          <Button
            label="포트폴리오 관리"
            variant="contained"
            color="blue"
            size="large"
            icon={ResumePaperIcon}
            iconPosition="start"
            onClick={() => setCvPanelOpen(open => !open)}
          />
        </S.ButtonGroup>
      </S.TopRow>
      <S.ContentSplit
        $panelOpen={cvPanelOpen}
        align="stretch"
        gap="1rem"
        width="100%"
        style={{ minWidth: 0 }}
      >
        {!mobileCvOnly ? (
        <S.MainSplit
          $narrow={cvPanelOpen && !isMobile}
          gap="1.5rem"
          width="100%"
          style={{ minWidth: 0 }}
        >
          <PortfolioPromptQualityDashboard
            progress={promptProgress}
            onSectionClick={handlePromptQualitySectionClick}
          />
          <UserInfoSectionContent
            splitViewportLayout={cvPanelOpen && !isMobile}
          />
          <Flex.Column gap="1rem" width="100%" style={{ minWidth: 0 }}>
        {sectionOrder.map(key => (
          <DraggableSection
            key={key}
            sectionId={key}
            title={SECTION_TITLES[key]}
            isLoading={
              key === 'tech' ? isTechStackLoading
              : key === 'repo' ? isReposLoading
              : key === 'mileage' ? isMileageLoading
              : key === 'activities' ? isActivitiesLoading
              : false
            }
            subtitle={
              key === 'activities'
                ? '교내·외 수상 경력, 동아리, 대외활동 등을 추가하면 더 풍부한 포트폴리오 설명을 생성할 수 있습니다.'
                : key === 'mileage'
                  ? '해당 마일리지 활동의 구체적인 내용을 입력하면 더욱 완성도 높은 포트폴리오 설명을 생성할 수 있습니다.'
                  : undefined
            }
            icon={SECTION_ICONS[key]}
            headerRight={
              key === 'repo'
                ? repoHeaderRight
                : key === 'mileage'
                  ? mileageHeaderRight
                  : key === 'tech' && isMobile ? (
                      <Button
                        label="도메인 추가"
                        variant="outlined"
                        color="blue"
                        size="medium"
                        icon={AddPlusIcon}
                        iconPosition="start"
                        onClick={() => techStackRef.current?.openAddDomainDialog()}
                      />
                    )
                  : key === 'activities' ? (
                      <Button
                        label="활동 추가"
                        variant="outlined"
                        color="blue"
                        size="medium"
                        icon={AddPlusIcon}
                        iconPosition="start"
                        onClick={() =>
                          activitiesRef.current?.openAddActivity()
                        }
                      />
                    )
                  : undefined
            }
            compactHeaderRight={
              (key === 'tech' && isMobile) || key === 'activities'
            }
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOverId === key}
            promptFooter={{
              percent: promptProgress[key],
              hint: PROMPT_QUALITY_SECTION_HINTS[key],
            }}
          >
            {renderSectionContent(key)}
          </DraggableSection> 

        ))}
          </Flex.Column>
        </S.MainSplit>
        ) : null}
        {cvPanelOpen ? (
          <S.CvPane
            $mobileOnly={mobileCvOnly}
            width="100%"
            style={{ minWidth: 0 }}
          >
            <CvManagementPanel onClose={() => setCvPanelOpen(false)} />
          </S.CvPane>
        ) : null}
      </S.ContentSplit>
      <RepoSelectModal
        open={repoModalOpen}
        onClose={() => setRepoModalOpen(false)}
      />
      <MileageSelectModal
        open={mileageModalOpen}
        onClose={() => setMileageModalOpen(false)}
      />
      <ScrollToTopFab />
      <Footer />
    </Flex.Column>
  );
};

export default PortfolioEditPage;

const S = {
  ContentSplit: styled(Flex.Row)<{ $panelOpen: boolean }>`
    flex-wrap: nowrap;
    @media ${MAX_RESPONSIVE_WIDTH} {
      flex-direction: ${({ $panelOpen }) => ($panelOpen ? 'column' : 'row')};
      flex-wrap: ${({ $panelOpen }) => ($panelOpen ? 'wrap' : 'nowrap')};
    }
  `,
  MainSplit: styled(Flex.Column)<{ $narrow: boolean }>`
    flex: ${({ $narrow }) => ($narrow ? '1 1 50%' : '1 1 100%')};
    max-width: 100%;
    min-width: 0;
    @media ${MAX_RESPONSIVE_WIDTH} {
      flex: 1 1 auto;
      width: 100%;
    }
  `,
  CvPane: styled(Flex.Column)<{ $mobileOnly?: boolean }>`
    flex: 1 1 50%;
    min-width: 0;
    min-height: min(70vh, 42rem);
    @media ${MAX_RESPONSIVE_WIDTH} {
      flex: 1 1 auto;
      width: 100%;
      ${({ $mobileOnly }) =>
        $mobileOnly
          ? `
        min-height: min(72vh, 40rem);
      `
          : `
        min-height: min(55vh, 28rem);
      `}
    }
  `,
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
