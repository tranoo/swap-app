import { ChangeDetectionStrategy, Component, Injector, Inject } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SwapTypeService } from '@app/core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {
  public isMenuOpened = false;

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE> = this.swapTypeService.swapMode$;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly swapTypeService: SwapTypeService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  private toggleLiveChatContainerHeight(action: string): void {
    const iframe = this.document.getElementById('live-chat-iframe') as HTMLIFrameElement;

    if (action === 'hide') {
      iframe.contentWindow.postMessage({ type: 'lc_visibility', value: 'minimize' }, '*');
      iframe.width = '';
      iframe.height = '';
    }

    if (action === 'show') {
      iframe.contentWindow.postMessage({ type: 'lc_visibility', value: 'maximize' }, '*');
      iframe.height = '560px';
      iframe.width = '375px';
    }
  }

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToLimitOrder(): Promise<void> {
    await this.swapTypeService.navigateToLimitOrder();
  }

  public openNavigationMenu(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openMobileNavigationMenu().subscribe();
  }

  public openRubicMenu(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openRubicMenu().subscribe();
  }

  public openSettings(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openSettings().subscribe();
  }

  public openLiveChat(): void {
    this.toggleLiveChatContainerHeight('show');
  }

  public openProfile(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }

  public openWallet(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}
