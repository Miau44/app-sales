import { Component } from '@angular/core';
@Component({ selector: 'app-not-found', template: '<section class="not-found panel"><span>404</span><h2>Esta página no existe</h2><p>La dirección puede haber cambiado o no estar disponible.</p><a class="button-primary" routerLink="/dashboard"><i class="ri-arrow-left-line"></i> Volver al resumen</a></section>', styleUrls: ['./not-found.component.scss'] })
export class NotFoundComponent { }
