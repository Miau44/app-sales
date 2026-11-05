import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreeDTiltDirective } from './three-d-tilt.directive';

@Component({ template: '<article app3dTilt></article>' })
class TiltHostComponent { }

describe('ThreeDTiltDirective', () => {
  let fixture: ComponentFixture<TiltHostComponent>;
  let card: HTMLElement;

  function configureMedia(hover: boolean, reducedMotion: boolean): void {
    spyOn(window, 'matchMedia').and.callFake((query: string) => ({
      matches: query.includes('hover') ? hover : reducedMotion,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    } as MediaQueryList));
  }

  function createFixture(hover = true, reducedMotion = false): void {
    configureMedia(hover, reducedMotion);
    TestBed.configureTestingModule({ declarations: [TiltHostComponent, ThreeDTiltDirective] });
    fixture = TestBed.createComponent(TiltHostComponent);
    fixture.detectChanges();
    card = fixture.nativeElement.querySelector('article');
    spyOn(card, 'getBoundingClientRect').and.returnValue({
      left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100, x: 100, y: 100, toJSON: () => ({})
    } as DOMRect);
  }

  it('caps cursor rotation at fourteen degrees and applies the requested depth', () => {
    createFixture();
    card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: 300, clientY: 200 }));
    expect(card.style.getPropertyValue('perspective')).toBe('750px');
    expect(card.style.getPropertyValue('--tilt-rotate-x')).toBe('-14.00deg');
    expect(card.style.getPropertyValue('--tilt-rotate-y')).toBe('14.00deg');
    expect(card.style.getPropertyValue('--tilt-card-y')).toBe('-8px');
    expect(card.style.getPropertyValue('--tilt-image-z')).toBe('60px');
    expect(card.style.getPropertyValue('--tilt-image-scale')).toBe('1.06');
    expect(card.style.getPropertyValue('--tilt-content-z')).toBe('30px');
    expect(card.classList.contains('tilt-active')).toBeTrue();
  });

  it('returns to the resting position when the pointer leaves', () => {
    createFixture();
    card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: 300, clientY: 200 }));
    card.dispatchEvent(new PointerEvent('pointerleave'));
    expect(card.style.getPropertyValue('--tilt-rotate-x')).toBe('0deg');
    expect(card.style.getPropertyValue('--tilt-rotate-y')).toBe('0deg');
    expect(card.style.getPropertyValue('--tilt-card-y')).toBe('0px');
    expect(card.style.getPropertyValue('--tilt-image-z')).toBe('0px');
    expect(card.style.getPropertyValue('--tilt-image-scale')).toBe('1');
    expect(card.style.getPropertyValue('--tilt-content-z')).toBe('0px');
    expect(card.classList.contains('tilt-active')).toBeFalse();
  });

  it('does not tilt on touch pointers', () => {
    createFixture();
    card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', clientX: 300, clientY: 200 }));
    expect(card.classList.contains('tilt-active')).toBeFalse();
  });

  it('does not enable tilt when reduced motion is requested', () => {
    createFixture(true, true);
    card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: 300, clientY: 200 }));
    expect(card.classList.contains('tilt-active')).toBeFalse();
  });

  it('does not enable tilt on devices without fine hover pointers', () => {
    createFixture(false, false);
    card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: 300, clientY: 200 }));
    expect(card.classList.contains('tilt-active')).toBeFalse();
  });
});
