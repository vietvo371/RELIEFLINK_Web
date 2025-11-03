/**
 * Mock Blockchain utility
 * Generates random transaction hashes for transparency logs
 */

export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function validateTxHash(hash: string): boolean {
  return /^0x[a-f0-9]{64}$/.test(hash);
}

export interface BlockchainLog {
  txHash: string;
  action: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export function createBlockchainLog(
  action: string,
  data: Record<string, unknown>,
): BlockchainLog {
  return {
    txHash: generateTxHash(),
    action,
    timestamp: new Date(),
    data,
  };
}

