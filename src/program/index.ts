import { Program as AnchorProgram, IdlEvents, Idl } from '@coral-xyz/anchor';
import {
  Connection,
  Ed25519Program,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';

import { SolidSvm as BaseSolidSvm } from './idl';
import IDL from './idl.json';

export type UserRegisteredEvent = IdlEvents<BaseSolidSvm>['userRegistered'];

type SolidSvm<T extends string = BaseSolidSvm['address']> = Omit<
  BaseSolidSvm,
  'address'
> & { address: T };

const USER_ACCOUNT_SEED = Buffer.from('user_account');
const IDENTITY_SEED = Buffer.from('identity');

export type Program<T extends string = BaseSolidSvm['address']> = AnchorProgram<
  SolidSvm<T>
>;

// No need to specify the type here because it's not related to the UserAccount type
export type UserAccount = NonNullable<
  Awaited<ReturnType<Program['account']['user']['fetch']>>
>;

export function signatureInstruction(data: {
  publicKey: PublicKey;
  message: string;
  signature: string;
}): TransactionInstruction {
  return Ed25519Program.createInstructionWithPublicKey({
    publicKey: data.publicKey.toBytes(),
    message: new TextEncoder().encode(data.message), // Convert plain text to bytes
    signature: bs58.decode(data.signature),
  });
}

export class SolidProgram<T extends string = BaseSolidSvm['address']> {
  private idl = Object.assign({}, IDL);
  private readonly program: Program<T>;

  constructor(
    private readonly connection: Connection,
    programId?: T,
  ) {
    if (programId) {
      this.idl.address = programId;
    }
    this.program = new AnchorProgram(this.idl as Idl, {
      connection: this.connection,
    });
  }

  onUserRegisteredEvent(
    callback: (
      event: UserRegisteredEvent,
      slot: number,
      signature: string,
    ) => void,
  ): number {
    return this.program.addEventListener('userRegistered', callback);
  }

  /**
   * Removes event listeners by their ids.
   * @param eventIds - The ids of the event listeners to remove.
   */
  removeListeners(eventIds: number[]) {
    eventIds.forEach(eventId => {
      this.program.removeEventListener(eventId);
    });
  }

  /**
   * Gets the PDA for a user account
   * @param publicKey - The public key to derive the PDA for. Defaults to the current wallet.
   * @returns The derived PDA and bump
   */
  getUserAccountPDA(publicKey: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [USER_ACCOUNT_SEED, publicKey.toBuffer()],
      this.program.programId,
    );
  }

  /**
   * Gets the PDA for an identity
   * @param username - The username to derive the PDA for
   * @returns The derived PDA and bump
   */
  getIdentityPDA(username: string) {
    return PublicKey.findProgramAddressSync(
      [IDENTITY_SEED, Buffer.from(username)],
      this.program.programId,
    );
  }

  /**
   * Registers a new user in the Solid program.
   * @param username - The desired username for the account
   * @returns Promise<string> - Transaction signature
   * @throws Will throw an error if registration fails, if the username is too long,
   *         if the username is already taken, or if the wallet is already in registration
   */
  async register(publicKey: PublicKey, username: string) {
    const [userAccountPda] = this.getUserAccountPDA(publicKey);
    const [identityPda] = this.getIdentityPDA(username);

    return await this.program.methods
      .register(username)
      .accountsPartial({
        user: publicKey,
        userAccount: userAccountPda,
        identity: identityPda,
      })
      .transaction();
  }

  /**
   * Links an additional wallet to an existing user account.
   * @param masterWallet - The public key of the master wallet
   * @param message - The message that was signed by the master wallet
   * @param signature - The signature of the message that was signed by the master wallet
   * @returns Promise<Transaction> - Transaction
   * @throws Will throw an error if wallet linking fails, if the wallet is already linked,
   *         or if the master key doesn't match
   */
  async linkWallet(
    publicKey: PublicKey,
    masterWallet: PublicKey,
    message: string,
    signature: string,
  ) {
    // const [masterAccountPda] = this.getUserAccountPDA(masterWallet);
    const signatureIx = signatureInstruction({
      publicKey: masterWallet,
      message,
      signature,
    });

    const linkWalletIx = await this.program.methods
      .linkWallet(masterWallet)
      .accounts({
        requester: publicKey,
      })
      .instruction();

    const tx = new Transaction();
    tx.add(signatureIx);
    tx.add(linkWalletIx);

    return tx;
  }

  /**
   * Gets all linked wallets for a user account
   * @param publicKey - The public key to check. If not provided, checks the current wallet's public key.
   * @returns The user account data if registered, null if not registered
   */
  async getUserAccount(publicKey: PublicKey) {
    try {
      const [userAccountPda] = this.getUserAccountPDA(publicKey);

      // First check if the account exists
      const accountInfo =
        await this.program.provider.connection.getAccountInfo(userAccountPda);
      if (!accountInfo) {
        console.log('Account does not exist yet');
        return null;
      }

      const account = await this.program.account.user.fetch(
        userAccountPda,
        'confirmed',
      );
      return account;
    } catch (error) {
      console.error('Error fetching user account:', error);
      return null;
    }
  }
}
