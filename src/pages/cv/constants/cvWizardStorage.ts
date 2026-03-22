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
