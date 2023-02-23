import { CrossChainTradeType, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';

export const FROM_BACKEND_CROSS_CHAIN_PROVIDERS: Record<string, CrossChainTradeType> = {
  celer: CROSS_CHAIN_TRADE_TYPE.CELER,
  rango: CROSS_CHAIN_TRADE_TYPE.RANGO,
  symbiosis: CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS,
  lifi: CROSS_CHAIN_TRADE_TYPE.LIFI,
  via: CROSS_CHAIN_TRADE_TYPE.VIA,
  bridgers: CROSS_CHAIN_TRADE_TYPE.BRIDGERS,
  debridge: CROSS_CHAIN_TRADE_TYPE.DEBRIDGE,
  multichain: CROSS_CHAIN_TRADE_TYPE.MULTICHAIN,
  cbridge: CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE,
  changenow: CROSS_CHAIN_TRADE_TYPE.CHANGENOW
};
