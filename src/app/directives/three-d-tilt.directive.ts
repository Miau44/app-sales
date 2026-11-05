import { Directive, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, RendererStyleFlags2 } from '@angular/core';

@Directive({ selector: '[app3dTilt]' })
export class ThreeDTiltDirective implements OnInit, OnDestroy {
  private enabled = false;
  private readonly host: HTMLElement;

  constructor(elementRef: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {
    this.host = elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.enabled = this.supportsHover() && !this.prefersReducedMotion();
    if (!this.enabled) return;

    this.renderer.setStyle(this.host, 'perspective', '750px');
    this.renderer.setStyle(this.host, 'transform-style', 'preserve-3d', RendererStyleFlags2.DashCase);
    this.resetValues();
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.enabled) return;
    if (event.pointerType === 'touch') {
      this.reset();
      return;
    }

    const bounds = this.host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const horizontal = this.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
    const vertical = this.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    const rotateX = (-vertical * 14).toFixed(2);
    const rotateY = (horizontal * 14).toFixed(2);

    this.setVariable('--tilt-rotate-x', `${rotateX}deg`);
    this.setVariable('--tilt-rotate-y', `${rotateY}deg`);
    this.setVariable('--tilt-card-y', '-8px');
    this.setVariable('--tilt-image-z', '60px');
    this.setVariable('--tilt-image-scale', '1.06');
    this.setVariable('--tilt-content-z', '30px');
    this.renderer.addClass(this.host, 'tilt-active');
  }

  @HostListener('pointerleave')
  onPointerLeave(): void { this.reset(); }

  ngOnDestroy(): void { this.reset(); }

  private reset(): void {
    this.resetValues();
    this.renderer.removeClass(this.host, 'tilt-active');
  }

  private resetValues(): void {
    this.setVariable('--tilt-rotate-x', '0deg');
    this.setVariable('--tilt-rotate-y', '0deg');
    this.setVariable('--tilt-card-y', '0px');
    this.setVariable('--tilt-image-z', '0px');
    this.setVariable('--tilt-image-scale', '1');
    this.setVariable('--tilt-content-z', '0px');
  }

  private setVariable(name: string, value: string): void {
    this.renderer.setStyle(this.host, name, value, RendererStyleFlags2.DashCase);
  }

  private clamp(value: number): number { return Math.max(-1, Math.min(1, value)); }

  private supportsHover(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
