import { SOLID_API_ENDPOINT } from './constant';
import { GetKycUrlResponse, UserAttestationResponse } from './types';

export class SolidApiClient {
  private apiEndpoint: string;

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint ?? SOLID_API_ENDPOINT;
  }

  /**
   * Fetch the attestation information for a given wallet address
   * @param walletAddress The wallet address to check
   * @returns {Promise<UserAttestationResponse>}
   */
  async getUserAttestationInfo(
    walletAddress: string,
  ): Promise<UserAttestationResponse> {
    const response = await fetch(
      `${this.apiEndpoint}/sdk/users/${walletAddress}/attestation`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch SDK attestation: ${response.statusText}`,
      );
    }
    return response.json();
  }

  /**
   * Fetch the KYC URL for a given wallet address
   * @param walletAddress The wallet address to check
   * @param redirectUri (Optional) The redirect URI to be included as a query parameter
   * @returns {Promise<GetKycUrlResponse>}
   */
  async getKycUrl(
    walletAddress: string,
    redirectUri?: string,
  ): Promise<GetKycUrlResponse> {
    const url = new URL(
      `${this.apiEndpoint}/sdk/users/${walletAddress}/kyc_url`,
    );
    if (redirectUri) {
      url.searchParams.append('redirectUri', redirectUri);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch SDK KYC URL: ${response.statusText}`);
    }
    return response.json();
  }
}
