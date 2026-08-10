import { InjectionToken } from '@angular/core';

export interface FieldContext {
  readonly errorId: () => string | null;
  readonly hintId: () => string | null;
  readonly required: () => boolean;
}

const NOOP_FIELD: FieldContext = {
  errorId: () => null,
  hintId: () => null,
  required: () => false,
};

export const FIELD_CONTEXT = new InjectionToken<FieldContext>('ui-field context', {
  providedIn: 'root',
  factory: () => NOOP_FIELD,
});
