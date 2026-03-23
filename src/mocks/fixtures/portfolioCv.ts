import type { PortfolioCvDetail } from '@/pages/cv/apis/cv';

export const mockPortfolioCvDetails: PortfolioCvDetail[] = [
  {
    id: 1,
    title: '네이버',
    job_posting: '2026 상반기 백엔드 신입 채용',
    target_position: '백엔드 개발자',
    additional_notes: 'Go, 분산 시스템 경험 강조',
    prompt:
      '# 이력서용 프롬프트 (Mock)\n\n- 지원 회사: 네이버\n- 직무: 백엔드 개발자\n',
    html_content:
      '<p><strong>경력 요약</strong></p><p>운영체제·알고리즘 프로젝트를 수행했습니다. (Mock HTML)</p>',
    created_at: '2026-03-20T09:00:00.000Z',
    updated_at: '2026-03-20T10:30:00.000Z',
  },
  {
    id: 2,
    title: '카카오',
    job_posting: '플랫폼 서버 개발자 채용',
    target_position: '서버 개발자',
    additional_notes: '',
    prompt: '# 이력서용 프롬프트 (Mock)\n\n- 지원 회사: 카카오\n',
    html_content: '<p>Mock 이력서 본문입니다.</p>',
    created_at: '2026-03-18T14:00:00.000Z',
    updated_at: '2026-03-19T11:00:00.000Z',
  },
];
