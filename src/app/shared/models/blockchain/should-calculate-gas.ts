import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const shouldCalculateGas: Record<BlockchainName, boolean> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: false,
  [BLOCKCHAIN_NAME.POLYGON]: false,
  [BLOCKCHAIN_NAME.HARMONY]: false,
  [BLOCKCHAIN_NAME.AVALANCHE]: true,
  [BLOCKCHAIN_NAME.FANTOM]: true,
  [BLOCKCHAIN_NAME.ARBITRUM]: false,
  [BLOCKCHAIN_NAME.AURORA]: false,
  [BLOCKCHAIN_NAME.TELOS]: true,
  [BLOCKCHAIN_NAME.MOONRIVER]: false,
  [BLOCKCHAIN_NAME.SOLANA]: false,
  [BLOCKCHAIN_NAME.NEAR]: false
};
