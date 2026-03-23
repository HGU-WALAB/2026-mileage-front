export interface CapabilityResponse {
  capabilityId: number;
  capabilityName: string;
  milestoneCount: number;
  totalMilestoneCount: number; //이거 안씀
}

export interface CompareCapabilityRequest {
  term?: string;
  entryYear?: string;
  major?: string;
}

export interface CompareCapabilityResponse {
  capabilityId: number;
  capabilityName: string;
  totalMilestoneCount: number; //이거 안씀
  groupSize: number; // 이거 안씀
  averageMilestoneCount: number;
}

export interface RadarCapability {
  capabilityId: number;
  capabilityName: string;
  '나의 마일리지': number;
  '비교 대상 평균 마일리지': number;
  [key: string]: unknown;
}

export interface SemesterCapabilityResponse {
  semester: string;
  userMilestoneCount: number;
}

export interface CapabilityDetailResponse {
  capabilityId: number;
  capabilityName: string;
  subitemId: number;
  subitemName: string;
  semester: string;
  description1: string;
  done: boolean;
}

export interface ActivityRecommendResponse {
  capabilityName: string;
  suggestion: string[];
}
