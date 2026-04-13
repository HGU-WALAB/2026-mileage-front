import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import axios from 'axios';

/** 인증 인터셉터(401 시 로그아웃) 없이 공개 엔드포인트만 호출 */
const cvSharePublicClient = axios.create({
  baseURL: BASE_URL,
});

/** GET /api/portfolio/cv 목록 한 건 */
export interface PortfolioCvListItem {
  id: number;
  title: string;
  job_posting: string;
  target_position: string;
  additional_notes: string;
  public_token: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface PortfolioCvListResponse {
  cvs: PortfolioCvListItem[];
}

/** GET /api/portfolio/cv/{id} 상세 */
export interface PortfolioCvDetail extends PortfolioCvListItem {
  prompt: string;
  html_content: string;
}

function readCvId(o: Record<string, unknown>): number {
  const v = o.id;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return 0;
}

/** 일부 배포 서버는 `is_public` 대신 `_public`(Jackson 등)으로 내려줌 */
function readCvIsPublic(o: Record<string, unknown>): boolean {
  const v = o.is_public ?? o._public ?? o.isPublic;
  return Boolean(v);
}

function normalizePortfolioCvListItem(raw: unknown): PortfolioCvListItem {
  if (raw == null || typeof raw !== 'object') {
    return {
      id: 0,
      title: '',
      job_posting: '',
      target_position: '',
      additional_notes: '',
      public_token: '',
      created_at: '',
      updated_at: '',
      is_public: false,
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    id: readCvId(o),
    title: String(o.title ?? ''),
    job_posting: String(o.job_posting ?? ''),
    target_position: String(o.target_position ?? ''),
    additional_notes: String(o.additional_notes ?? ''),
    public_token: String(o.public_token ?? ''),
    created_at: String(o.created_at ?? ''),
    updated_at: String(o.updated_at ?? ''),
    is_public: readCvIsPublic(o),
  };
}

export function normalizePortfolioCvDetail(raw: unknown): PortfolioCvDetail {
  const base = normalizePortfolioCvListItem(raw);
  const o =
    raw != null && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};
  return {
    ...base,
    prompt: String(o.prompt ?? ''),
    html_content: String(o.html_content ?? ''),
  };
}

export const getPortfolioCvList = async () => {
  const raw = await http.get<{ cvs?: unknown[] }>(ENDPOINT.PORTFOLIO_CV);
  return {
    cvs: (raw.cvs ?? []).map(normalizePortfolioCvListItem),
  } satisfies PortfolioCvListResponse;
};

export const getPortfolioCvById = async (id: number) => {
  const raw = await http.get<unknown>(`${ENDPOINT.PORTFOLIO_CV}/${id}`);
  return normalizePortfolioCvDetail(raw);
};

/** POST /api/portfolio/cv/build-prompt */
export type PortfolioCvBuildPromptMode = 'cv' | 'archive';

export interface PortfolioCvBuildPromptRequest {
  /** 취업 준비 ON → `cv`, OFF → `archive` (서버 기본은 cv) */
  mode: PortfolioCvBuildPromptMode;
  job_posting: string;
  target_position: string;
  additional_notes: string;
  title: string;
  selected_mileage_ids: number[];
  selected_activity_ids: number[];
  selected_repo_ids: number[];
}

export interface PortfolioCvBuildPromptResponse {
  prompt: string;
  cv_id: number;
  public_token: string;
}

export const postPortfolioCvBuildPrompt = async (body: PortfolioCvBuildPromptRequest) => {
  return http.post<PortfolioCvBuildPromptRequest, PortfolioCvBuildPromptResponse>(
    `${ENDPOINT.PORTFOLIO_CV}/build-prompt`,
    body,
  );
};

/** PATCH /api/portfolio/cv/{id} — title·html_content·is_public 각각 선택(부분 갱신 가능) */
export interface PortfolioCvPatchRequest {
  title?: string;
  html_content?: string;
  is_public?: boolean;
}

export const patchPortfolioCv = async (id: number, body: PortfolioCvPatchRequest) => {
  const raw = await http.patch<PortfolioCvPatchRequest, unknown>(
    `${ENDPOINT.PORTFOLIO_CV}/${id}`,
    body,
  );
  return normalizePortfolioCvDetail(raw);
};

/** DELETE /api/portfolio/cv/{id} */
export const deletePortfolioCv = async (id: number) => {
  return http.delete<void>(`${ENDPOINT.PORTFOLIO_CV}/${id}`);
};

/**
 * GET /api/portfolio/share/cv/{publicToken}/html
 * JWT 없이 호출. 200·204·403·404 는 본 함수에서 예외 없이 구분 반환, 그 외·네트워크 오류는 throw.
 */
export type PortfolioCvShareHtmlResult =
  | { status: 200; html: string }
  | { status: 204 }
  | { status: 403; guidanceHtml: string }
  | { status: 404; guidanceHtml: string };

export const getPortfolioCvShareHtml = async (
  publicToken: string,
): Promise<PortfolioCvShareHtmlResult> => {
  const path = `${ENDPOINT.PORTFOLIO_CV_SHARE}/${encodeURIComponent(publicToken)}/html`;
  const res = await cvSharePublicClient.get<string>(path, {
    responseType: 'text',
    validateStatus: s => [200, 204, 403, 404].includes(s),
  });
  const body = typeof res.data === 'string' ? res.data : '';
  if (res.status === 200) {
    return { status: 200, html: body };
  }
  if (res.status === 204) {
    return { status: 204 };
  }
  if (res.status === 403) {
    return { status: 403, guidanceHtml: body };
  }
  if (res.status === 404) {
    return { status: 404, guidanceHtml: body };
  }
  throw new Error(`Unexpected CV share response: ${res.status}`);
};
