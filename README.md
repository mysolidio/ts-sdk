# Solid TypeScript SDK

This SDK provides tools to interact with the **Solid** attestation management service on the Solana blockchain, as well as the Solid backend API. It enables developers to fetch and decode attestations, manage user accounts, and interact with the Solid program and backend from TypeScript/JavaScript applications.

## Features

- Fetch and decode attestation and schema accounts from Solana
- Find Program Derived Addresses (PDAs) for user accounts and identities
- Register users and link wallets on the Solid program
- Fetch attestation and KYC status from the Solid backend API
- Utility functions for sending and encoding Solana transactions

## Installation

```bash
npm install solid-sdk
# or
yarn add solid-sdk
```

## Usage

### 1. Using the API Client (REST Backend)

```ts
import { SolidApiClient } from 'solid-sdk';

const apiClient = new SolidApiClient(); // Uses default endpoint https://api.mysolid.io
const walletAddress = 'YOUR_WALLET_ADDRESS';

// Fetch user attestation info
const attestationInfo = await apiClient.getUserAttestationInfo(walletAddress);
console.log('Attestation info:', attestationInfo);
// attestationInfo: {
//   walletAddress: string;
//   attestationAddress: string | null;
//   kycStatus: 'NOT_STARTED' | 'PENDING' | 'RUNNING' | 'UNDER_REVIEW' | 'COMPLETED' | 'FAILED';
//   kycResult: 'APPROVED' | 'DECLINED' | 'REVIEW' | 'UNKNOWN';
// }

// Fetch KYC URL for a wallet
const kycUrlResponse = await apiClient.getKycUrl(
  walletAddress,
  'https://yourapp.com/redirect',
);
console.log('KYC URL:', kycUrlResponse.url);
```

### 2. Using the Solana Program SDK

```ts
import { SolidProgram } from 'solid-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('6UZqUB1eVVzUkjrA9bCETqby9GiApBKGwgWoQZ3Qr4EY');
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

### 3. Utility Functions for Transactions

```ts
import { sendEncodedTx, encodeTx, updateBlockhash } from 'solid-sdk';
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

## Typical Flow: Register and Complete KYC

This section describes the recommended flow for an external client to register a user and complete KYC using the SDK:

1. **Register the user on-chain** using the program SDK (create and send the register transaction with `sendAndConfirmTransaction` from `@solana/web3.js`).
2. **Initiate KYC** by calling `getKycUrl` from the API client SDK, then access the returned URL and complete the KYC process in the browser.
3. **Check KYC result** by calling `getUserAttestationInfo` from the API client SDK after KYC is finished.

```ts
import { SolidProgram, SolidApiClient } from 'solid-sdk';
import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// 1. Register the user on-chain
const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('6UZqUB1eVVzUkjrA9bCETqby9GiApBKGwgWoQZ3Qr4EY');
const solidProgram = new SolidProgram(connection, programId);

const userKeypair = Keypair.generate(); // Or load from wallet
const username = 'your_username';

// Create register transaction
const registerTx = await solidProgram.register(userKeypair.publicKey, username);
registerTx.feePayer = userKeypair.publicKey;
// Optionally, set a recent blockhash if needed:
// registerTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
registerTx.sign(userKeypair); // Sign with user's wallet
const signature = await sendAndConfirmTransaction(connection, registerTx, [
  userKeypair,
]);
console.log('Register transaction signature:', signature);

// 2. Initiate KYC
const apiClient = new SolidApiClient();
const kycUrlResponse = await apiClient.getKycUrl(
  userKeypair.publicKey.toBase58(),
  'https://yourapp.com/redirect',
);
console.log('KYC URL:', kycUrlResponse.url);
// Redirect the user to kycUrlResponse.url in the browser and complete KYC

// 3. Check KYC result
// After the user completes KYC, you can check their attestation status:
const attestationInfo = await apiClient.getUserAttestationInfo(
  userKeypair.publicKey.toBase58(),
);
console.log('Attestation info:', attestationInfo);
// attestationInfo.kycStatus will reflect the current KYC process state
// attestationInfo.kycResult will be 'APPROVED', 'DECLINED', 'REVIEW', or 'UNKNOWN'
```
