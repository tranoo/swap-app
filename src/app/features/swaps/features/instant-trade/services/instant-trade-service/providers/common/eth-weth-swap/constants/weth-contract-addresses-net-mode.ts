import { BLOCKCHAIN_NAME, wrappedNativeTokensList } from 'rubic-sdk';

export const SUPPORTED_ETH_WETH_SWAP_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.AURORA,
  BLOCKCHAIN_NAME.TELOS,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.OKE_X_CHAIN,
  BLOCKCHAIN_NAME.GNOSIS,
  BLOCKCHAIN_NAME.FUSE,
  BLOCKCHAIN_NAME.MOONBEAM,
  BLOCKCHAIN_NAME.ETHEREUM_POW,
  BLOCKCHAIN_NAME.KAVA,
  BLOCKCHAIN_NAME.ZK_SYNC,
  BLOCKCHAIN_NAME.PULSECHAIN,
  BLOCKCHAIN_NAME.POLYGON_ZKEVM
] as const;

export type SupportedEthWethSwapBlockchain = (typeof SUPPORTED_ETH_WETH_SWAP_BLOCKCHAINS)[number];

export const WETH_CONTRACT_ADDRESS: Record<SupportedEthWethSwapBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  [BLOCKCHAIN_NAME.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [BLOCKCHAIN_NAME.HARMONY]: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
  [BLOCKCHAIN_NAME.AVALANCHE]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  [BLOCKCHAIN_NAME.MOONRIVER]: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
  [BLOCKCHAIN_NAME.FANTOM]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  [BLOCKCHAIN_NAME.ARBITRUM]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [BLOCKCHAIN_NAME.AURORA]: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  [BLOCKCHAIN_NAME.TELOS]: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  [BLOCKCHAIN_NAME.OPTIMISM]: '0x4200000000000000000000000000000000000006',
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
  [BLOCKCHAIN_NAME.GNOSIS]: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  [BLOCKCHAIN_NAME.FUSE]: '0x0be9e53fd7edac9f859882afdda116645287c629',
  [BLOCKCHAIN_NAME.MOONBEAM]: '0xacc15dc74880c9944775448304b263d191c6077f',
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [BLOCKCHAIN_NAME.KAVA]: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
  [BLOCKCHAIN_NAME.ZK_SYNC]: wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_SYNC].address,
  [BLOCKCHAIN_NAME.PULSECHAIN]: wrappedNativeTokensList[BLOCKCHAIN_NAME.PULSECHAIN].address,
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON_ZKEVM].address
};
