import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    service.setDark(false);
    document.documentElement.classList.remove('dark');
  });

  it('starts in light mode without a dark class', () => {
    expect(service.dark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setDark adds or removes the dark class on the html element', () => {
    service.setDark(true);
    expect(service.dark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    service.setDark(false);
    expect(service.dark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggle flips the theme and returns the resulting one', () => {
    expect(service.toggle()).toBe('dark');
    expect(service.dark()).toBe(true);
    expect(service.toggle()).toBe('light');
    expect(service.dark()).toBe(false);
  });
});
