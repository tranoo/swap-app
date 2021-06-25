import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from 'src/app/core/services/store/store.service';

export interface ItSettingsForm {
  slippageTolerance: number;
  deadline: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
}

export interface BridgeSettingsForm {
  tronAddress: string;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.BRIDGE]: BridgeSettingsForm;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSlippage = 0.1;

  public settingsForm: FormGroup<SettingsForm>;

  constructor(private readonly storeService: StoreService) {
    this.createForm();
    const localData = this.storeService.getItem('settings') as string;
    if (localData) {
      this.settingsForm.setValue(JSON.parse(localData), {
        emitEvent: false
      });
    }
    this.settingsForm.valueChanges.subscribe(form => {
      this.storeService.setItem('settings', JSON.stringify(form));
    });
  }

  private createForm(): void {
    this.settingsForm = new FormGroup<SettingsForm>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup({
        slippageTolerance: new FormControl<number>(this.defaultSlippage),
        deadline: new FormControl<number>(20),
        disableMultihops: new FormControl<boolean>(false),
        rubicOptimisation: new FormControl<boolean>(false)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        tronAddress: new FormControl<string>('')
      })
    });
  }
}
