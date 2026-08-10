import { TestBed } from '@angular/core/testing';
import { LocaleService } from './locale.service';

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocaleService);
  });

  it('detects the date pattern from the locale', () => {
    expect(service.datePattern('es-PE')).toBe('dd/MM/yyyy');
    expect(service.datePattern('en-US')).toBe('MM/dd/yyyy');
    expect(service.datePattern('ja-JP')).toBe('yyyy/MM/dd');
  });

  it('honours an explicit custom format over the locale', () => {
    expect(service.datePattern('en-US', 'dd-MM-yyyy')).toBe('dd/MM/yyyy');
    expect(service.datePattern('es-PE', 'MM/dd/yyyy')).toBe('MM/dd/yyyy');
    expect(service.datePattern('es-PE', 'yyyy-MM-dd')).toBe('yyyy/MM/dd');
  });

  it('falls back to dd/MM/yyyy for an unknown locale', () => {
    expect(service.datePattern('not-a-locale')).toBe('dd/MM/yyyy');
  });

  it('returns localized month names capitalized', () => {
    expect(service.monthNames('es-PE')).toEqual([
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]);
    expect(service.monthNames('en-US')[0]).toBe('January');
    expect(service.monthNames('en-US')[7]).toBe('August');
  });

  it('returns Monday-first weekday labels', () => {
    expect(service.weekdayLabels('es-PE')).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(service.weekdayLabels('en-US').length).toBe(7);
  });

  it('translates UI strings with a language fallback', () => {
    expect(service.translate('selectDate', 'es-PE')).toBe('Seleccionar fecha');
    expect(service.translate('today', 'en-US')).toBe('Today');
    expect(service.translate('clear', 'fr-FR')).toBe('Limpiar');
  });
});
