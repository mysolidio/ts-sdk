import { Address, Lamports } from '@solana/kit';
import { decodeAccount } from '@solana/kit';

import { Connection, PublicKey } from '@solana/web3.js';

import { getAttestationDecoder } from './program-sdk/accounts/attestation';
import { getSchemaDecoder } from './program-sdk/accounts/schema';

export class SolidProgramSdk {
  constructor(
    private readonly connection: Connection,
    private readonly programId: PublicKey,
  ) {}

  /**
   * Fetch a schema by its address.
   * @param schemaAddress - The public key address of the schema account.
   * @returns The decoded schema data including name, description, layout, field names, pause status, and version.
   * @throws Error if the schema is not found or decoding fails.
   */
  async fetchSchema(schemaAddress: PublicKey) {
    try {
      const schemaAccount = await this.connection.getAccountInfo(schemaAddress);
      if (!schemaAccount) {
        throw new Error('Schema not found');
      }

      const encodedAccount = {
        address: schemaAddress.toBase58() as Address<string>,
        data: schemaAccount.data,
        exists: true,
        programAddress: this.programId.toBase58() as Address<string>,
        space: BigInt(schemaAccount.data.length),
        executable: false,
        lamports: BigInt(0) as Lamports,
      };

      const schema = decodeAccount(encodedAccount, getSchemaDecoder());

      const fieldNamesBuffer = Buffer.from(schema.data.fieldNames);
      const fieldNames: string[] = [];
      let offset = 0;

      while (offset < fieldNamesBuffer.length) {
        const length = fieldNamesBuffer.readUInt32LE(offset);
        offset += 4;
        const data = fieldNamesBuffer.slice(offset, offset + length);
        const name = new TextDecoder().decode(data);
        fieldNames.push(name);
        offset += length;
      }

      console.log('fieldNames', fieldNames);

      return {
        ...schema.data,
        name: new TextDecoder().decode(schema.data.name),
        description: new TextDecoder().decode(schema.data.description),
        layout: Array.from(schema.data.layout),
        fieldNames,
        isPaused: schema.data.isPaused,
        version: schema.data.version,
      };
    } catch (error) {
      console.error('Failed to fetch schema:', error);
      throw error;
    }
  }

  /**
   * Fetch an attestation by its address.
   * @param attestationAddress - The public key address of the attestation account.
   * @returns The decoded attestation data.
   * @throws Error if the attestation is not found or decoding fails.
   */
  async fetchAttestation(attestationAddress: PublicKey) {
    try {
      const attestationAccount =
        await this.connection.getAccountInfo(attestationAddress);
      if (!attestationAccount) {
        throw new Error('Attestation not found');
      }

      const encodedAccount = {
        address: attestationAddress.toBase58() as Address<string>,
        data: attestationAccount.data,
        exists: true,
        programAddress: this.programId.toBase58() as Address<string>,
        space: BigInt(attestationAccount.data.length),
        executable: false,
        lamports: BigInt(0) as Lamports,
      };

      const attestation = decodeAccount(
        encodedAccount,
        getAttestationDecoder(),
      );
      return attestation.data;
    } catch (error) {
      console.error('Failed to fetch attestation:', error);
      throw error;
    }
  }

  /**
   * Decode attestation data according to schema layout.
   * @param data - The raw attestation data as a Uint8Array.
   * @param layout - The layout array describing the type of each field.
   * @param fieldNames - The names of the fields in the attestation.
   * @returns An object mapping field names to their decoded values.
   * @throws Error if an unsupported type is encountered.
   */
  decodeAttestationData(
    data: Uint8Array,
    layout: number[],
    fieldNames: string[],
  ): Record<string, any> {
    let offset = 0;
    const result: Record<string, any> = {};
    const dataBuffer = Buffer.from(data);

    for (let i = 0; i < layout.length; i++) {
      const type = layout[i];
      const fieldName = fieldNames[i] as string;

      switch (type) {
        case 12: {
          // String
          const stringLength = dataBuffer.readUInt32LE(offset);
          offset += 4;
          const stringValue = new TextDecoder().decode(
            dataBuffer.slice(offset, offset + stringLength),
          );
          offset += stringLength;
          result[fieldName] = stringValue;
          break;
        }
        case 10: {
          // bool
          const boolValue = dataBuffer[offset] === 1;
          offset += 1;
          result[fieldName] = boolValue;
          break;
        }
        // Add more type handlers as needed
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
    }

    return result;
  }

  /**
   * Find the Program Derived Address (PDA) for a schema.
   * @param credentialAddress - The credential's public key address.
   * @param name - The name of the schema.
   * @returns A tuple containing the schema PDA and the bump seed.
   */
  findSchemaPDA(
    credentialAddress: PublicKey,
    name: string,
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('schema'),
        credentialAddress.toBuffer(),
        Buffer.from(name),
        Buffer.from([1]),
      ],
      this.programId,
    );
  }

  /**
   * Find the Program Derived Address (PDA) for an attestation.
   * @param credentialAddress - The credential's public key address.
   * @param authorityAddress - The authority's public key address.
   * @param schemaAddress - The schema's public key address.
   * @param nonce - The nonce as a public key.
   * @returns A tuple containing the attestation PDA and the bump seed.
   */
  findAttestationPDA(
    credentialAddress: PublicKey,
    authorityAddress: PublicKey,
    schemaAddress: PublicKey,
    nonce: PublicKey,
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('attestation'),
        credentialAddress.toBuffer(),
        authorityAddress.toBuffer(),
        schemaAddress.toBuffer(),
        nonce.toBuffer(),
      ],
      this.programId,
    );
  }
}
