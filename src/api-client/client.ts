import { SOLID_API_ENDPOINT } from './constant';
import {
  GetKycUrlResponse,
  UserAttestationResponse,
  ClientCredentials,
  ClientInfo,
  ClientUpdateData,
  ClientCategory,
  GetCategoriesResponse,
} from './types';

export class SolidApiClient {
  private apiEndpoint: string;
  private credentials?: ClientCredentials;

  constructor(apiEndpoint?: string, credentials?: ClientCredentials) {
    this.apiEndpoint = apiEndpoint ?? SOLID_API_ENDPOINT;
    this.credentials = credentials;
  }

  /**
   * Create headers for authenticated requests
   * @private
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.credentials) {
      headers['X-API-Key'] = this.credentials.apiKey;
      headers['X-App-Secret'] = this.credentials.appSecret;
    }

    return headers;
  }

  /**
   * Fetch the attestation information for a given wallet address
   * This is a public endpoint that doesn't require authentication
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
   * If credentials are provided, the KYC session will be tracked to this client
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch SDK KYC URL: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get client information (requires authentication)
   * @returns {Promise<ClientInfo>} Client information including schemas
   * @throws Will throw an error if not authenticated or client not found
   */
  async getClientInfo(): Promise<ClientInfo> {
    if (!this.credentials) {
      throw new Error(
        'Authentication required: Please provide API credentials to access client information',
      );
    }

    const response = await fetch(`${this.apiEndpoint}/sdk/client/info`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid client credentials');
      }
      if (response.status === 404) {
        throw new Error('Client not found');
      }
      throw new Error(`Failed to fetch client info: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data; // Backend returns { data: ClientInfo, message: string }
  }

  /**
   * Update client information (requires authentication)
   * @param updateData The data to update
   * @returns {Promise<ClientInfo>} Updated client information
   * @throws Will throw an error if not authenticated, client not found, or validation fails
   */
  async updateClientInfo(updateData: ClientUpdateData): Promise<ClientInfo> {
    if (!this.credentials) {
      throw new Error(
        'Authentication required: Please provide API credentials to update client information',
      );
    }

    const response = await fetch(`${this.apiEndpoint}/sdk/client/info`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid input data');
      }
      if (response.status === 401) {
        throw new Error('Invalid client credentials');
      }
      if (response.status === 404) {
        throw new Error('Client not found');
      }
      if (response.status === 409) {
        throw new Error('Client name already exists');
      }
      throw new Error(`Failed to update client info: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data; // Backend returns { data: ClientInfo, message: string }
  }

  /**
   * Get available client categories (public endpoint)
   * @returns {Promise<ClientCategory[]>} List of available categories
   * @throws Will throw an error if the request fails
   */
  async getCategories(): Promise<ClientCategory[]> {
    const response = await fetch(`${this.apiEndpoint}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result: GetCategoriesResponse = await response.json();
    return result.data;
  }
}
