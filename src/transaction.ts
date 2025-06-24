import {
  Commitment,
  Connection,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';

const AbortedError = new Error('Transaction aborted.');

type SendOptions = {
  commitment?: Commitment;
  delayMs?: number;
};

function _isValidStatus(commitment: Commitment, status?: Commitment | null) {
  switch (status) {
    case 'finalized':
      return commitment === 'finalized';
    case 'confirmed':
      return ['finalized', 'confirmed'].includes(commitment);
    case 'processed':
      return ['finalized', 'confirmed', 'processed'].includes(commitment);
    default:
      return false;
  }
}

async function _sendEncodedTx(
  connection: Connection,
  encodedTx: string,
): Promise<TransactionSignature> {
  const signature = await connection.sendEncodedTransaction(encodedTx, {
    skipPreflight: true,
  });
  return signature;
}

export async function sendEncodedTx(
  connection: Connection,
  encodedTx: string,
  options?: SendOptions,
): Promise<TransactionSignature> {
  const commitment = options?.commitment ?? 'confirmed';
  const delayMs = options?.delayMs ?? 3000;

  const signature = await _sendEncodedTx(connection, encodedTx);

  const controller = new AbortController();
  const { signal } = controller;

  // Auto abort after 30 seconds
  const abortTimeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    while (!signal.aborted) {
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Check if the transaction is successful
      const { value: status } = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: false,
      });
      if (status?.err) {
        if (status.err instanceof Error) {
          throw status.err;
        }
        throw new Error(String(status.err).replace('Error: ', ''));
      }
      if (_isValidStatus(commitment, status?.confirmationStatus)) {
        return signature;
      }

      // Send the transaction again
      await connection.sendEncodedTransaction(encodedTx, {
        skipPreflight: true,
      });
    }

    throw AbortedError;
  } catch (err) {
    if (err === AbortedError) {
      throw err;
    }
    // TODO: Handler other errors
    throw err;
  } finally {
    if (!signal.aborted) {
      clearTimeout(abortTimeout);
      controller.abort();
    }
  }
}

export function encodeTx(tx: Transaction) {
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}

export async function updateBlockhash(connection: Connection, tx: Transaction) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  return tx;
}
