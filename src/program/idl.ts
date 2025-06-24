/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solid_svm.json`.
 */
export type SolidSvm = {
  address: '6UZqUB1eVVzUkjrA9bCETqby9GiApBKGwgWoQZ3Qr4EY';
  metadata: {
    name: 'solidSvm';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'linkWallet';
      discriminator: [86, 92, 31, 146, 228, 51, 209, 230];
      accounts: [
        {
          name: 'requester';
          writable: true;
          signer: true;
        },
        {
          name: 'masterAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 97, 99, 99, 111, 117, 110, 116];
              },
              {
                kind: 'arg';
                path: 'wallet';
              },
            ];
          };
        },
        {
          name: 'instructions';
          address: 'Sysvar1nstructions1111111111111111111111111';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'wallet';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'register';
      discriminator: [211, 124, 67, 15, 211, 194, 178, 240];
      accounts: [
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'userAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 97, 99, 99, 111, 117, 110, 116];
              },
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
        {
          name: 'identity';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [105, 100, 101, 110, 116, 105, 116, 121];
              },
              {
                kind: 'arg';
                path: 'username';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'username';
          type: 'string';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'identity';
      discriminator: [58, 132, 5, 12, 176, 164, 85, 112];
    },
    {
      name: 'user';
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
    },
  ];
  events: [
    {
      name: 'userRegistered';
      discriminator: [21, 42, 216, 163, 99, 51, 200, 222];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'usernameTooLong';
      msg: 'The username is too long.';
    },
    {
      code: 6001;
      name: 'linkingWalletNotMatchWithSignerKey';
      msg: 'Linking wallet does not match with signer key';
    },
    {
      code: 6002;
      name: 'masterKeyDoesNotMatch';
      msg: 'Master key does not match with wallet from signature';
    },
    {
      code: 6003;
      name: 'mustBeSignatureVerificationInstruction';
      msg: 'Previous instruction must be ed25519 signature verification';
    },
    {
      code: 6004;
      name: 'walletAlreadyLinked';
      msg: 'This wallet is already linked to the account';
    },
    {
      code: 6005;
      name: 'signatureDataInvalid';
      msg: 'Invalid signature data.';
    },
  ];
  types: [
    {
      name: 'identity';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'master';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'user';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'username';
            type: 'string';
          },
          {
            name: 'master';
            type: 'pubkey';
          },
          {
            name: 'linkingWallets';
            type: {
              vec: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'userRegistered';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'user';
            type: 'pubkey';
          },
          {
            name: 'username';
            type: 'string';
          },
          {
            name: 'userAccount';
            type: 'pubkey';
          },
          {
            name: 'identity';
            type: 'pubkey';
          },
        ];
      };
    },
  ];
};
