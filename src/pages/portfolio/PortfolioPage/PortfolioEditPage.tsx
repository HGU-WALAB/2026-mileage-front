import { Button, Flex, Footer, Text } from '@/components';
import {
  PORTFOLIO_CV_PANEL_QUERY_KEY,
  PORTFOLIO_CV_PANEL_QUERY_VALUE,
  ROUTE_PATH,
} from '@/constants/routePath';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import useGetGitHubStatusQuery from '@/pages/profile/hooks/useGetGitHubStatusQuery';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState, type FunctionComponent, type SVGProps } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  DRAGGABLE_SECTION_ORDER,
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
  PROMPT_QUALITY_SECTION_HINTS,
  usePortfolioPromptProgress,
} from './utils/portfolioPromptProgress';
import { useScrollPortfolioSection } from '../hooks';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isTechStackLoading,
    isReposLoading,
    isMileageLoading,
    isActivitiesLoading,
  } = usePortfolioContext();
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const { data: githubStatus } = useGetGitHubStatusQuery();
  const hasGithub = githubStatus?.connected === true && !!githubStatus?.githubUsername;
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const techStackRef = useRef<TechStackSectionContentHandle>(null);
  const activitiesRef = useRef<ActivitiesSectionContentHandle>(null);
  const promptProgress = usePortfolioPromptProgress();
  const handlePromptQualitySectionClick = useScrollPortfolioSection();
  useEffect(() => {
    if (
      searchParams.get(PORTFOLIO_CV_PANEL_QUERY_KEY) !==
      PORTFOLIO_CV_PANEL_QUERY_VALUE
    ) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete(PORTFOLIO_CV_PANEL_QUERY_KEY);
    const q = next.toString();
    navigate(`${ROUTE_PATH.cv}${q ? `?${q}` : ''}`, { replace: true });
  }, [searchParams, navigate]);

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

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <S.TopRow align="center" justify="space-between" gap="1rem" wrap="wrap">
        <S.GuideText>
          포트폴리오를 제작하기 위한 페이지입니다. 아래 항목을 통해
          포트폴리오가 생성됩니다.
        </S.GuideText>
      </S.TopRow>
      <Flex.Column gap="1.5rem" width="100%" style={{ minWidth: 0 }}>
        <PortfolioPromptQualityDashboard
          progress={promptProgress}
          onSectionClick={handlePromptQualitySectionClick}
        />
        <UserInfoSectionContent splitViewportLayout={false} />
        <Flex.Column gap="1rem" width="100%" style={{ minWidth: 0 }}>
          {DRAGGABLE_SECTION_ORDER.map(key => (
            <DraggableSection
              key={key}
              sectionId={key}
              title={SECTION_TITLES[key]}
              isLoading={
                key === 'tech'
                  ? isTechStackLoading
                  : key === 'repo'
                    ? isReposLoading
                    : key === 'mileage'
                      ? isMileageLoading
                      : key === 'activities'
                        ? isActivitiesLoading
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
              promptFooter={{
                percent: promptProgress[key],
                hint: PROMPT_QUALITY_SECTION_HINTS[key],
              }}
            >
              {renderSectionContent(key)}
            </DraggableSection>
          ))}
        </Flex.Column>
      </Flex.Column>
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
