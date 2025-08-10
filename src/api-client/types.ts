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

// Client authentication credentials
export interface ClientCredentials {
  apiKey: string;
  appSecret: string;
}

// Chain types supported by the system
export enum ChainType {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  ARBITRUM = 'ARBITRUM',
  OPTIMISM = 'OPTIMISM',
}

// Client schema information
export interface ClientSchema {
  id: string;
  schemaName: string;
  credentialAddress: string;
  schemaAddress: string;
  chainType: ChainType;
  isDefault: boolean;
}

// Client category information
export interface ClientCategory {
  id: string;
  name: string;
  slug: string;
}

// Categories list response
export interface GetCategoriesResponse {
  data: ClientCategory[];
  message: string;
}

// Full client information response
export interface ClientInfo {
  id: string;
  name: string;
  url: string | null;
  logo: string | null;
  apiKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: ClientCategory;
  clientSchemas?: ClientSchema[];
}

// Client update data payload
export interface ClientUpdateData {
  name?: string;
  url?: string;
  logo?: string;
  categoryId?: string;
}
