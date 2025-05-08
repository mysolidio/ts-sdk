export interface UserAttestationResponse {
  walletAddress: string;
  attestationAddress: string | null;
}

export class SolidApiSdk {
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Fetch the attestation address for a given wallet address
   * @param walletAddress The wallet address to check
   * @returns {Promise<{ isVerified: boolean; attestationAddress?: string | null }>}
   */
  async fetchUserAttestation(
    walletAddress: string,
  ): Promise<{ isVerified: boolean; attestationAddress?: string | null }> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/user/attestation/${walletAddress}`,
      );
      if (!response.ok) {
        console.error(
          'Failed to fetch attestation address:',
          await response.text(),
        );
        return { isVerified: false };
      }
      const { data } = await response.json();
      const attestationAddress = data?.attestationAddress;
      if (!attestationAddress) {
        console.error('No attestation address returned from API');
        return { isVerified: false };
      }
      return { isVerified: true, attestationAddress };
    } catch (error) {
      console.error('Error fetching attestation address:', error);
      return { isVerified: false };
    }
  }
}
