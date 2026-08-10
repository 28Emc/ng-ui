import { InjectionToken } from '@angular/core';

export interface RadioGroupContext {
  readonly value: () => string | null;
  readonly disabled: () => boolean;
  readonly onSelect: (value: string) => void;
  readonly onTouched: () => void;
}

const NOOP_RADIO_GROUP: RadioGroupContext = {
  value: () => null,
  disabled: () => false,
  onSelect: () => {},
  onTouched: () => {},
};

export const RADIO_GROUP_CONTEXT = new InjectionToken<RadioGroupContext>('ui-radio-group context', {
  providedIn: 'root',
  factory: () => NOOP_RADIO_GROUP,
});
