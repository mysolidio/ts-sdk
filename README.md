# Solid TypeScript SDK

This SDK provides tools to interact with the **Solid** attestation management service on the Solana blockchain, as well as the Solid backend API. It enables developers to fetch and decode attestations, manage user accounts, interact with the Solid program, and manage client credentials from TypeScript/JavaScript applications.

## Features

- **Attestation Management**: Fetch and decode attestation and schema accounts from Solana
- **User Management**: Register users and link wallets on the Solid program  
- **KYC Integration**: Initiate KYC processes and track status from the Solid backend API
- **Client Management**: Authenticate with client credentials and manage client information
- **Solana Integration**: Find Program Derived Addresses (PDAs) for user accounts and identities
- **Transaction Utilities**: Helper functions for sending and encoding Solana transactions

## Installation

```bash
npm install @mysolid/ts-sdk
# or
yarn add @mysolid/ts-sdk
```

## Usage

### 1. Using the API Client for Public Endpoints

```ts
import { SolidApiClient } from '@mysolid/ts-sdk';

// Create client without credentials for public endpoints
const apiClient = new SolidApiClient(); // Uses default endpoint https://api.mysolid.io
const walletAddress = 'YOUR_WALLET_ADDRESS';

// Fetch user attestation info (public endpoint)
const attestationInfo = await apiClient.getUserAttestationInfo(walletAddress);
console.log('Attestation info:', attestationInfo);
// attestationInfo: {
//   walletAddress: string;
//   attestationAddress: string | null;
//   kycStatus: 'NOT_STARTED' | 'PENDING' | 'RUNNING' | 'UNDER_REVIEW' | 'COMPLETED' | 'FAILED';
//   kycResult: 'APPROVED' | 'DECLINED' | 'REVIEW' | 'UNKNOWN';
// }

// Fetch KYC URL (works without credentials but no client tracking)
const kycUrlResponse = await apiClient.getKycUrl(
  walletAddress,
  'https://yourapp.com/redirect',
);
console.log('KYC URL:', kycUrlResponse.url);

// Get available categories (public endpoint, no authentication required)
const categories = await apiClient.getCategories();
console.log('Available categories:', categories);
// categories: [
//   { id: "cat_123", name: "DeFi", slug: "defi" },
//   { id: "cat_456", name: "Gaming", slug: "gaming" },
//   ...
// ]
```

### 2. Using the API Client with Authentication (Client Management)

```ts
import { SolidApiClient } from '@mysolid/ts-sdk';

// Create authenticated client with credentials
const authenticatedClient = new SolidApiClient('https://api.mysolid.io', {
  apiKey: 'ak_your_api_key_here',
  appSecret: 'as_your_app_secret_here'
});

// Fetch your client information
const clientInfo = await authenticatedClient.getClientInfo();
console.log('Client info:', clientInfo);
// clientInfo: {
//   id: string;
//   name: string;
//   url: string | null;
//   logo: string | null;
//   apiKey: string;
//   isActive: boolean;
//   category: { id: string; name: string; slug: string };
//   clientSchemas?: Array<{ ... }>;
// }

// Get available categories (public endpoint, no authentication required)
const categories = await authenticatedClient.getCategories();
console.log('Available categories:', categories);
// categories: [
//   { id: "cat_123", name: "DeFi", slug: "defi" },
//   { id: "cat_456", name: "Gaming", slug: "gaming" },
//   ...
// ]

// Update your client information
const updatedInfo = await authenticatedClient.updateClientInfo({
  name: 'My Updated App Name',
  url: 'https://myapp.com',
  logo: 'https://myapp.com/logo.png',
  categoryId: 'cat_123' // Use category ID from getCategories()
});

// KYC with client tracking (backend knows which client initiated)
const trackedKyc = await authenticatedClient.getKycUrl(
  walletAddress,
  'https://myapp.com/kyc-callback'
);
console.log('Tracked KYC URL:', trackedKyc.url);
```

### 3. Getting Client Credentials

To use authenticated features, you need to request client credentials from SOLID:

1. **Contact SOLID Admin**: Request client credentials through official channels
2. **Receive Credentials**: You'll receive an `apiKey` (starts with `ak_`) and `appSecret` (starts with `as_`)
3. **Store Securely**: Keep these credentials secure and never expose them in client-side code
4. **Use in SDK**: Initialize the SDK with your credentials as shown above

### 4. Using the Solana Program SDK

```ts
import { SolidProgram } from '@mysolid/ts-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('EkBnxBMuEm3etvxmGamRKjFva2TXKZ5qhxomN1PXNJS7');
const solidProgram = new SolidProgram(connection, programId);

// Register a new user
const userWallet = new PublicKey('YOUR_WALLET_ADDRESS');
const username = 'your_username';
const registerTx = await solidProgram.register(userWallet, username);
console.log('Register transaction:', registerTx);

// Link an additional wallet (requires signature from master wallet)
const masterWallet = new PublicKey('MASTER_WALLET_ADDRESS');
const message = 'Sign this message to link wallet';
const signature = 'BASE58_SIGNATURE';
const linkTx = await solidProgram.linkWallet(
  userWallet,
  masterWallet,
  message,
  signature,
);
console.log('Link wallet transaction:', linkTx);

// Fetch user account info
const userAccount = await solidProgram.getUserAccount(userWallet);
console.log('User account:', userAccount);
```

### 5. Utility Functions for Transactions

```ts
import { sendEncodedTx, encodeTx, updateBlockhash } from '@mysolid/ts-sdk';
import { Connection, Transaction } from '@solana/web3.js';

// Example: Send a transaction
const connection = new Connection('https://api.mainnet-beta.solana.com');
const tx = new Transaction();
// ... add instructions to tx ...
await updateBlockhash(connection, tx);
const encoded = encodeTx(tx);
const signature = await sendEncodedTx(connection, encoded);
console.log('Transaction signature:', signature);
```

## Documentation

- See the source code for detailed method documentation and usage examples.
- More comprehensive documentation and backend API usage coming soon.

## License

MIT

## Typical Integration Flows

### Flow 1: Basic Integration (Public Endpoints)

For simple integrations that just need to check attestations:

1. **Check attestation status** using `getUserAttestationInfo`
2. **Initiate KYC if needed** using `getKycUrl` (without client tracking)
3. **Verify completion** by rechecking attestation status

### Flow 2: Client Integration (With Tracking)

For clients who want KYC session tracking and client management:

1. **Get client credentials** from SOLID admin
2. **Initialize authenticated SDK** with credentials
3. **Manage client info** using `getClientInfo` and `updateClientInfo`
4. **Initiate tracked KYC** using `getKycUrl` (with client context)
5. **Check attestation results** using `getUserAttestationInfo`

### Flow 3: Full User Onboarding

Complete user onboarding flow including on-chain registration:

1. **Register user on-chain** using the program SDK
2. **Initiate KYC** (with or without client tracking)
3. **Check KYC results** and attestation status

## Example: Complete Integration Flow

```ts
import { SolidProgram, SolidApiClient } from '@mysolid/ts-sdk';
import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// Initialize with client credentials (optional)
const apiClient = new SolidApiClient('https://api.mysolid.io', {
  apiKey: 'ak_your_api_key',
  appSecret: 'as_your_app_secret'
});

// 1. Register user on-chain (optional)
const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('EkBnxBMuEm3etvxmGamRKjFva2TXKZ5qhxomN1PXNJS7');
const solidProgram = new SolidProgram(connection, programId);

const userKeypair = Keypair.generate();
const username = 'your_username';

const registerTx = await solidProgram.register(userKeypair.publicKey, username);
registerTx.feePayer = userKeypair.publicKey;
registerTx.sign(userKeypair);
const signature = await sendAndConfirmTransaction(connection, registerTx, [userKeypair]);
console.log('Register transaction signature:', signature);

// 2. Initiate tracked KYC (with client context)
const walletAddress = userKeypair.publicKey.toBase58();
const kycUrlResponse = await apiClient.getKycUrl(
  walletAddress,
  'https://yourapp.com/callback'
);
console.log('KYC URL:', kycUrlResponse.url);
// User completes KYC in browser

// 3. Check attestation result
const attestationInfo = await apiClient.getUserAttestationInfo(walletAddress);
console.log('Attestation info:', attestationInfo);

// 4. Manage client info (authenticated)
const clientInfo = await apiClient.getClientInfo();
console.log('Client info:', clientInfo);
```

## Breaking Changes from v1.x

- **Constructor signature changed**: `SolidApiClient` now accepts optional credentials as second parameter
- **New authentication**: Client management features require API credentials

Note: The API endpoint remains `https://api.mysolid.io` (no change from v1.x)

## Migration Guide

```ts
// v1.x
const client = new SolidApiClient('https://api.mysolid.io');

// v2.x (backward compatible - same endpoint)
const client = new SolidApiClient(); // Still uses https://api.mysolid.io

// v2.x (with authentication for new features)
const client = new SolidApiClient('https://api.mysolid.io', {
  apiKey: 'ak_...',
  appSecret: 'as_...'
});
```
