import { Flex, Text } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useScholarshipDuration } from '@/hooks';
import { useAuthStore } from '@/stores';
import { boxShadow } from '@/styles/common';
import { getFormattedDate } from '@/utils/getDate';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button as MuiButton, styled, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ScholarshipDurationSection = () => {
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const navigate = useNavigate();
  const { currentSemester } = useAuthStore();

  const { scholarshipDuration, isScholarshipDuration } =
    useScholarshipDuration();

  const goScholarshipApply = () => {
    navigate(ROUTE_PATH.scholarship);
  };

  return (
    <S.OuterWrap>
      <S.DateContainer isMobile={isMobile}>
      <S.LeftBlock justify="flex-start" align="center" gap=".5rem">
        <S.LabelBox isScholarshipDuration={isScholarshipDuration}>
          신청기간
        </S.LabelBox>
        {isScholarshipDuration ? (
          <Flex.Column>
            <Text>{`${currentSemester} 마일리지 장학금 신청`}</Text>
            <Text>
              {`${getFormattedDate(scholarshipDuration?.regStart ?? '')} ~ ${getFormattedDate(scholarshipDuration?.regEnd ?? '')}`}
            </Text>
          </Flex.Column>
        ) : (
          <Text>
            {`현재 ${currentSemester} 마일리지 장학금 신청 기간이 아닙니다.`}
          </Text>
        )}
      </S.LeftBlock>
      {isScholarshipDuration && (
        <S.ApplyButton
          type="button"
          variant="contained"
          disableElevation
          endIcon={<ChevronRightIcon sx={{ fontSize: 20 }} />}
          onClick={goScholarshipApply}
        >
          장학금 신청하러 가기
        </S.ApplyButton>
      )}
      </S.DateContainer>
    </S.OuterWrap>
  );
};

export default ScholarshipDurationSection;

const S = {
  /** 행 안에서 남는 공간은 차지하되, 흰 카드 자체는 내용 너비만큼만 (빈 여백 과다 방지) */
  OuterWrap: styled('div')`
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
  `,
  DateContainer: styled(Flex.Row)<{ isMobile: boolean }>`
    background-color: ${({ theme }) => theme.palette.white};
    border-radius: 0.5rem;
    min-height: 60px;
    padding: 0.5rem 1rem;
    width: fit-content;
    max-width: 100%;
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    flex-wrap: ${({ isMobile }) => (isMobile ? 'wrap' : 'nowrap')};
    ${boxShadow}
  `,
  LeftBlock: styled(Flex.Row)`
    flex: 0 1 auto;
    min-width: 0;
  `,
  ApplyButton: styled(MuiButton)`
    flex-shrink: 0;
    text-transform: none;
    font-weight: 600;
    border-radius: 0.75rem;
    padding: 0.5rem 1rem;
    box-shadow: 0 1px 3px rgba(83, 127, 241, 0.35);
    &:hover {
      box-shadow: 0 2px 6px rgba(83, 127, 241, 0.45);
    }
  `,
  LabelBox: styled(Flex.Row)<{ isScholarshipDuration: boolean }>`
    background-color: ${({ isScholarshipDuration, theme }) =>
      isScholarshipDuration ? theme.palette.primary.main : '#EF4444'};
    border-radius: 0.25rem;
    color: ${({ theme }) => theme.palette.white};
    padding: 0.25rem;
    width: fit-content;

  `,
};
