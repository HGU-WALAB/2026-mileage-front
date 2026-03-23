/**
 * 이력서 입력 칸 최대 글자수 제한.
 * 모든 summary 섹션 input/textarea 에서 이 값을 참조합니다.
 */
export const INPUT_MAX_LENGTH = {
  /** 한 줄 소개 */
  BIO: 500,
  /** 활동 제목 */
  ACTIVITY_TITLE: 100,
  /** 활동 카테고리 (사용자 입력) */
  ACTIVITY_CATEGORY: 40,
  /** 활동 설명 */
  ACTIVITY_DESCRIPTION: 300,
  /** 마일리지 추가 설명 */
  MILEAGE_ADDITIONAL_INFO: 300,
  /** 기술 스택 태그 (짧은 키워드이므로 별도 제한) */
  TECH_STACK_TAG: 30,
  TECH_STACK_DOMAIN: 40,
  TECH_STACK_NAME: 40,
  /** 레포지토리 제목 (custom_title) */
  REPO_TITLE: 100,
  /** 레포지토리 설명 */
  REPO_DESCRIPTION: 350,
} as const;
