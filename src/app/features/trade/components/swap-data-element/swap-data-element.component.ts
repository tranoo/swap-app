import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FeeInfo } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { Token } from '@shared/models/tokens/token';

@Component({
  selector: 'app-swap-data-element',
  templateUrl: './swap-data-element.component.html',
  styleUrls: ['./swap-data-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapDataElementComponent {
  public feeInfo: FeeInfo;

  public displayAmount: string | null;

  @Input({ required: true }) set feeInfoChange(value: { fee: FeeInfo | null; nativeToken: Token }) {
    this.feeInfo = value.fee;

    const sum = new BigNumber(0)
      .plus(value?.fee?.rubicProxy?.fixedFee?.amount || 0)
      .plus(value?.fee?.provider?.cryptoFee?.amount || 0);

    if (value?.nativeToken?.price && sum.gt(0)) {
      this.displayAmount = `~ $${sum.multipliedBy(value.nativeToken.price).toFixed(2)}`;
    } else if (value.nativeToken?.symbol && sum.gt(0)) {
      const bnPipe = new BigNumberFormatPipe();
      const shortenPipe = new ShortenAmountPipe();

      this.displayAmount = `${shortenPipe.transform(bnPipe.transform(sum), 6, 4)} ${
        value.nativeToken.symbol
      }`;
    } else {
      this.displayAmount = null;
    }
  }

  @Input({ required: true }) gasInfo: {
    amount: BigNumber;
    amountInUsd: BigNumber;
    symbol: string;
  } | null;

  @Input({ required: true }) time: string | number;

  constructor(private readonly cdr: ChangeDetectorRef) {}
}
