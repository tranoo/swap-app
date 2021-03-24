import { Injectable } from '@angular/core';
import {
  ChainId,
  Fetcher,
  Percent,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  WETH
} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { ethers } from 'ethers';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../../models/InstantTrade';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { UniSwapContractAbi, UniSwapContractAddress } from './uni-swap-contract';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { PublicProviderService } from '../../../../../core/services/blockchain/public-provider/public-provider.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../models/InstantTradeToken';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH'
}

@Injectable()
export class UniSwapService extends InstantTradeService {
  static slippageTolerance = new Percent('150', '10000'); // 1.5%

  static tokensToTokensEstimatedGas = new BigNumber(120_000);

  static tokensToEthEstimatedGas = new BigNumber(150_000);

  static ethToTokensEstimatedGas = new BigNumber(150_000);

  private provider;

  private WETH;

  private blockchain: IBlockchain | { id: number; name: BLOCKCHAIN_NAME.ETHEREUM };

  constructor(
    private coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    publicProvider: PublicProviderService,
    useTestingModeService: UseTestingModeService
  ) {
    super();

    useTestingModeService.isTestingMode.subscribe(value => (this.isTestingMode = value));

    this.web3Private = web3Private;
    this.blockchain = web3Private.network || {
      id: 1,
      name: BLOCKCHAIN_NAME.ETHEREUM
    };

    this.web3Public = web3Public[this.blockchain.name];
    this.provider = new ethers.providers.JsonRpcProvider(
      publicProvider.getBlockchainRpcLink(this.blockchain.name)
    );
    this.WETH = WETH[this.blockchain.id.toString()];
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.WETH.address;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WETH.address;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
    }

    const uniSwapTrade = await this.getUniSwapTrade(fromAmount, fromTokenClone, toTokenClone);

    const amountIn = new BigNumber(uniSwapTrade.inputAmount.toSignificant(fromTokenClone.decimals))
      .multipliedBy(10 ** fromTokenClone.decimals)
      .toFixed(0);
    const amountOutMin = new BigNumber(
      uniSwapTrade
        .minimumAmountOut(UniSwapService.slippageTolerance)
        .toSignificant(toTokenClone.decimals)
    )
      .multipliedBy(10 ** toTokenClone.decimals)
      .toFixed(0);

    const path = [fromTokenClone.address, toTokenClone.address];
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const estimatedGas = await this[estimatedGasPredictionMethod](
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );

    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();

    const gasFeeInUsd = await this.web3Public.getGasFee(estimatedGas, ethPrice);
    const gasFeeInEth = await this.web3Public.getGasFee(estimatedGas, new BigNumber(1));
    const amountOut = uniSwapTrade
      .minimumAmountOut(new Percent('0', '1'))
      .toSignificant(toTokenClone.decimals);

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(amountOut)
      },
      estimatedGas,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async calculateTokensToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToTokensEstimatedGas;
    if (walletAddress) {
      const allowance = await this.web3Public.getAllowance(
        path[0],
        walletAddress,
        UniSwapContractAddress
      );
      const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
      if (allowance.gte(amountIn) && balance.gte(amountIn)) {
        estimatedGas = await this.web3Public.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          SWAP_METHOD.TOKENS_TO_TOKENS,
          [amountIn, amountOutMin, path, walletAddress, deadline],
          walletAddress
        );
      }
    }

    return estimatedGas;
  }

  private async calculateEthToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    if (walletAddress) {
      const balance = await this.web3Public.getBalance(walletAddress);
      return balance.gte(amountIn)
        ? this.web3Public.getEstimatedGas(
            UniSwapContractAbi,
            UniSwapContractAddress,
            SWAP_METHOD.ETH_TO_TOKENS,
            [amountOutMin, path, walletAddress, deadline],
            walletAddress,
            amountIn
          )
        : UniSwapService.ethToTokensEstimatedGas;
    }
    return UniSwapService.ethToTokensEstimatedGas;
  }

  private async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToEthEstimatedGas;
    if (walletAddress) {
      const allowance = await this.web3Public.getAllowance(
        path[0],
        walletAddress,
        UniSwapContractAddress
      );
      const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
      if (allowance.gte(amountIn) && balance.gte(amountIn)) {
        estimatedGas = await this.web3Public.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          SWAP_METHOD.TOKENS_TO_ETH,
          [amountIn, amountOutMin, path, walletAddress, deadline],
          walletAddress
        );
      }
    }

    return estimatedGas;
  }

  public async createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.checkSettings(this.blockchain.name);
    await this.checkBalance(trade);
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(percentSlippage))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const path = [trade.from.token.address, trade.to.token.address];
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.createEthToTokensTrade(uniSwapTrade, options);
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.createTokensToEthTrade(uniSwapTrade, options);
    }

    return this.createTokensToTokensTrade(uniSwapTrade, options);
  }

  private async createEthToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[0] = this.WETH.address;

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  private async createTokensToEthTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[1] = this.WETH.address;

    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      UniSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  private async createTokensToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      UniSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  private async getUniSwapTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<Trade> {
    const chainId = (this.web3Private.network?.id as ChainId) || ChainId.MAINNET;
    const uniSwapFromToken = new Token(chainId, fromToken.address, fromToken.decimals);
    const uniSwapToToken = new Token(chainId, toToken.address, toToken.decimals);
    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken, this.provider);
    const route = new Route([pair], uniSwapFromToken);

    const fullFromAmount = fromAmount.multipliedBy(10 ** fromToken.decimals);

    return new Trade(
      route,
      new TokenAmount(uniSwapFromToken, fullFromAmount.toFixed(0)),
      TradeType.EXACT_INPUT
    );
  }
}
