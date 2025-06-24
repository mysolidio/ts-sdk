export type UserAttestationResponse = {
  walletAddress: string;
  attestationAddress: string | null;
  isKycVerified: boolean;
};

export type GetKycUrlResponse = {
  url: string;
};
