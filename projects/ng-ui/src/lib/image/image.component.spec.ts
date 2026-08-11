import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ImageComponent } from './image.component';

@Component({
  selector: 'image-host',
  standalone: true,
  imports: [ImageComponent],
  template: `
    <ui-image
      [src]="src()"
      [alt]="alt()"
      [width]="width()"
      [height]="height()"
      [loading]="loading()"
      [priority]="priority()"
      [blurSrc]="blurSrc()"
      [srcset]="srcset()"
      [sizes]="sizes()"
      [objectFit]="objectFit()"
      [objectPosition]="objectPosition()"
    />
  `,
})
class ImageHost {
  readonly src = signal('https://example.com/foto.jpg');
  readonly alt = signal('Una foto de prueba');
  readonly width = signal<number | undefined>(400);
  readonly height = signal<number | undefined>(300);
  readonly loading = signal<'lazy' | 'eager'>('lazy');
  readonly priority = signal(false);
  readonly blurSrc = signal<string | undefined>(undefined);
  readonly srcset = signal<string | undefined>(undefined);
  readonly sizes = signal<string | undefined>(undefined);
  readonly objectFit = signal<'cover' | 'contain' | 'fill' | 'none' | 'scale-down'>('cover');
  readonly objectPosition = signal<string | undefined>(undefined);
}

describe('ImageComponent', () => {
  let fixture: ComponentFixture<ImageHost>;
  let host: ImageHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ImageHost] }).compileComponents();
    fixture = TestBed.createComponent(ImageHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function mainImg(): HTMLImageElement {
    return fixture.nativeElement.querySelector('img[data-main]') as HTMLImageElement;
  }

  it('renders an img with src and alt', () => {
    const img = mainImg();
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://example.com/foto.jpg');
    expect(img.getAttribute('alt')).toBe('Una foto de prueba');
  });

  it('is lazy by default and switches to eager on demand', () => {
    expect(mainImg().getAttribute('loading')).toBe('lazy');
    host.loading.set('eager');
    fixture.detectChanges();
    expect(mainImg().getAttribute('loading')).toBe('eager');
  });

  it('sets fetchpriority high when priority is enabled', () => {
    expect(mainImg().getAttribute('fetchpriority')).toBeNull();
    host.priority.set(true);
    fixture.detectChanges();
    expect(mainImg().getAttribute('fetchpriority')).toBe('high');
  });

  it('passes srcset and sizes through to the img', () => {
    host.srcset.set('foto-400.jpg 400w, foto-800.jpg 800w');
    host.sizes.set('(max-width: 600px) 100vw, 50vw');
    fixture.detectChanges();

    expect(mainImg().getAttribute('srcset')).toBe('foto-400.jpg 400w, foto-800.jpg 800w');
    expect(mainImg().getAttribute('sizes')).toBe('(max-width: 600px) 100vw, 50vw');
  });

  it('renders width and height attributes to reserve space', () => {
    expect(mainImg().getAttribute('width')).toBe('400');
    expect(mainImg().getAttribute('height')).toBe('300');
  });

  it('starts hidden and fades in once the image loads', () => {
    const img = mainImg();
    expect(img.classList.contains('opacity-0')).toBe(true);

    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(mainImg().classList.contains('opacity-0')).toBe(false);
  });

  it('renders a blur placeholder behind the main image while loading', () => {
    host.blurSrc.set('data:image/jpeg;base64,xxxx');
    fixture.detectChanges();

    const blur = fixture.nativeElement.querySelector('img[data-blur]') as HTMLImageElement;
    expect(blur).not.toBeNull();
    expect(blur.getAttribute('src')).toBe('data:image/jpeg;base64,xxxx');
    expect(blur.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows a fallback state when the image fails to load', () => {
    mainImg().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const fallback = fixture.nativeElement.querySelector('[data-fallback]') as HTMLElement;
    expect(fallback).not.toBeNull();
    expect(fallback.textContent).toContain('No se pudo cargar la imagen');
    expect(fixture.nativeElement.querySelector('img[data-main]')).toBeNull();
  });

  it('applies objectFit and objectPosition to the main image', () => {
    host.objectFit.set('contain');
    host.objectPosition.set('center top');
    fixture.detectChanges();

    const img = mainImg();
    expect(img.classList.contains('object-contain')).toBe(true);
    expect(img.style.objectPosition).toBe('center top');
  });
});
