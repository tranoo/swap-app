import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { combineLatestWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { EvmBlockchainName } from 'rubic-sdk';
import { ModalService } from '@core/modals/services/modal.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonComponent {
  public readonly buttonState$ = this.tradeState.tradeState$.pipe(
    combineLatestWith(
      this.tradeState.wrongBlockchain$,
      this.tradeState.notEnoughBalance$,
      this.walletConnector.addressChange$
    ),
    map(([currentTrade, wrongBlockchain, notEnoughBalance, address]) => {
      if (currentTrade.error) {
        return {
          type: 'error',
          text: currentTrade.error.message,
          action: () => {}
        };
      }

      if (!address) {
        return {
          type: 'action',
          text: 'Connect wallet',
          action: this.connectWallet.bind(this)
        };
      }
      if (wrongBlockchain) {
        return {
          type: 'action',
          text: 'Switch Blockchain',
          action: this.switchChain.bind(this)
        };
      }
      if (notEnoughBalance) {
        return {
          type: 'error',
          text: 'Not enough balance',
          action: () => {}
        };
      }
      if (currentTrade.status === TRADE_STATUS.READY_TO_APPROVE) {
        return {
          type: 'action',
          text: 'Approve',
          action: this.approve.bind(this)
        };
      }
      if (currentTrade.status === TRADE_STATUS.READY_TO_SWAP) {
        return {
          type: 'action',
          text: 'Preview swap',
          action: this.swap.bind(this)
        };
      }
      if (currentTrade.status === TRADE_STATUS.LOADING) {
        return {
          type: 'error',
          text: 'Calculating',
          action: () => {}
        };
      }
      if (currentTrade.status === TRADE_STATUS.NOT_INITIATED) {
        return {
          type: 'error',
          text: 'Select tokens',
          action: () => {}
        };
      }
      debugger;
    })
  );

  constructor(
    private readonly tradeState: SwapsStateService,
    private readonly walletConnector: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly swapsFormService: SwapsFormService
  ) {}

  private approve(): void {
    this.tradePageService.setState('preview');
  }

  private swap(): void {
    this.tradePageService.setState('preview');
  }

  private async switchChain(): Promise<void> {
    const blockchain = this.swapsFormService.inputValue.fromBlockchain;
    await this.walletConnector.switchChain(blockchain as EvmBlockchainName);
  }

  private connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}
