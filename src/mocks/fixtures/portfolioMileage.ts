import type { PortfolioMileageItem } from '@/pages/portfolio/apis/portfolio';

export const mockPortfolioMileage: PortfolioMileageItem[] = [
  {
    id: 1,
    mileage_id: 1,
    additional_info: '',
    display_order: 0,
    subitemId: 1,
    subitemName: '기술 스택 학습',
    categoryId: 101,
    categoryName: '프로그래밍 언어',
    semester: '2025-01',
    description1: '',
  },
  {
    id: 2,
    mileage_id: 3,
    additional_info: '유저 추가 설명',
    display_order: 1,
    subitemId: 3,
    subitemName: '클린 코드 작성',
    categoryId: 103,
    categoryName: '소프트웨어 품질',
    semester: '2024-01',
    description1: '클린 코드 작성과 코드 리뷰 진행',
  },
];
