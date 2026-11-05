import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isMenuOpen = false;
  pageTitle = 'Resumen';

  constructor(private readonly router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      let activeRoute = this.router.routerState.root;
      while (activeRoute.firstChild) activeRoute = activeRoute.firstChild;
      this.pageTitle = activeRoute.snapshot.data['title'] ?? 'Resumen';
      this.isMenuOpen = false;
    });
  }

  toggleMenu(): void { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu(): void { this.isMenuOpen = false; }
}
