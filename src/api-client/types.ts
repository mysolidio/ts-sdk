export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum KycResult {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  REVIEW = 'REVIEW',
  UNKNOWN = 'UNKNOWN',
}

export type UserAttestationResponse = {
  walletAddress: string;
  attestationAddress: string | null;
  kycStatus: KycStatus;
  kycResult: KycResult;
};

export type GetKycUrlResponse = {
  url: string;
};
