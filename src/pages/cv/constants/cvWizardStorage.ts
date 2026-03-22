/** 2·3·4단계에서 재사용할 1단계 선택값 (sessionStorage) */
export const CV_WIZARD_STEP1_STORAGE_KEY = 'cv-wizard-step1-selections-v1';

export interface CvWizardStep1Selection {
  selected_mileage_ids: number[];
  selected_activity_ids: number[];
  selected_repo_ids: number[];
}

export function readCvWizardStep1Selection(): CvWizardStep1Selection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CV_WIZARD_STEP1_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CvWizardStep1Selection>;
    return {
      selected_mileage_ids: Array.isArray(parsed.selected_mileage_ids)
        ? parsed.selected_mileage_ids.filter((x): x is number => typeof x === 'number')
        : [],
      selected_activity_ids: Array.isArray(parsed.selected_activity_ids)
        ? parsed.selected_activity_ids.filter((x): x is number => typeof x === 'number')
        : [],
      selected_repo_ids: Array.isArray(parsed.selected_repo_ids)
        ? parsed.selected_repo_ids.filter((x): x is number => typeof x === 'number')
        : [],
    };
  } catch {
    return null;
  }
}

export function writeCvWizardStep1Selection(draft: CvWizardStep1Selection): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_STEP1_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

/** 2단계 입력 초안 (sessionStorage) */
export const CV_WIZARD_STEP2_STORAGE_KEY = 'cv-wizard-step2-draft-v1';

export interface CvWizardStep2Draft {
  title: string;
  job_posting: string;
  target_position: string;
  additional_notes: string;
}

export function readCvWizardStep2Draft(): CvWizardStep2Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CV_WIZARD_STEP2_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CvWizardStep2Draft>;
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      job_posting: typeof parsed.job_posting === 'string' ? parsed.job_posting : '',
      target_position:
        typeof parsed.target_position === 'string' ? parsed.target_position : '',
      additional_notes:
        typeof parsed.additional_notes === 'string' ? parsed.additional_notes : '',
    };
  } catch {
    return null;
  }
}

export function writeCvWizardStep2Draft(draft: CvWizardStep2Draft): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_STEP2_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

/** build-prompt 응답의 CV id (4단계 등에서 사용) */
export const CV_WIZARD_PENDING_CV_ID_KEY = 'cv-wizard-pending-cv-id-v1';

export function readCvWizardPendingCvId(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CV_WIZARD_PENDING_CV_ID_KEY);
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeCvWizardPendingCvId(id: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_PENDING_CV_ID_KEY, String(id));
  } catch {
    // ignore
  }
}

export function clearCvWizardPendingCvId(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CV_WIZARD_PENDING_CV_ID_KEY);
  } catch {
    // ignore
  }
}

/** 3단계에서 사용할 build-prompt 응답 캐시 */
export const CV_WIZARD_PENDING_PROMPT_KEY = 'cv-wizard-pending-prompt-v1';

export function readCvWizardPendingPrompt(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const t = sessionStorage.getItem(CV_WIZARD_PENDING_PROMPT_KEY);
    return t ?? null;
  } catch {
    return null;
  }
}

export function writeCvWizardPendingPrompt(prompt: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_PENDING_PROMPT_KEY, prompt);
  } catch {
    // ignore
  }
}

/** 4단계 HTML 초안 (sessionStorage) */
export const CV_WIZARD_STEP4_HTML_KEY = 'cv-wizard-step4-html-v1';

export function readCvWizardStep4Html(): string {
  if (typeof window === 'undefined') return '';
  try {
    const t = sessionStorage.getItem(CV_WIZARD_STEP4_HTML_KEY);
    return typeof t === 'string' ? t : '';
  } catch {
    return '';
  }
}

export function writeCvWizardStep4Html(html: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_STEP4_HTML_KEY, html);
  } catch {
    // ignore
  }
}

export function clearCvWizardStep4Html(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CV_WIZARD_STEP4_HTML_KEY);
  } catch {
    // ignore
  }
}

/** 현재 마법사 단계 (새로고침 후 복원용) */
export const CV_WIZARD_UI_STEP_KEY = 'cv-wizard-ui-step-v1';

export type CvWizardUiStep = 1 | 2 | 3 | 4;

export function readCvWizardUiStep(): CvWizardUiStep | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(CV_WIZARD_UI_STEP_KEY);
    if (v === '1' || v === '2' || v === '3' || v === '4') {
      return Number(v) as CvWizardUiStep;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeCvWizardUiStep(step: CvWizardUiStep): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CV_WIZARD_UI_STEP_KEY, String(step));
  } catch {
    // ignore
  }
}

export function clearCvWizardPendingPrompt(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CV_WIZARD_PENDING_PROMPT_KEY);
  } catch {
    // ignore
  }
}

/** CV 마법사 관련 sessionStorage 전부 제거 (/cv 이탈 시 등) */
export function clearAllCvWizardSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CV_WIZARD_STEP1_STORAGE_KEY);
    sessionStorage.removeItem(CV_WIZARD_STEP2_STORAGE_KEY);
    sessionStorage.removeItem(CV_WIZARD_PENDING_PROMPT_KEY);
    sessionStorage.removeItem(CV_WIZARD_PENDING_CV_ID_KEY);
    sessionStorage.removeItem(CV_WIZARD_UI_STEP_KEY);
    sessionStorage.removeItem(CV_WIZARD_STEP4_HTML_KEY);
  } catch {
    // ignore
  }
}
