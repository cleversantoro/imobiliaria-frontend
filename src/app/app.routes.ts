import { Routes } from '@angular/router';
import { SiteShellComponent } from './core/layouts/site-shell/site-shell.component';
import { AdminShellComponent } from './core/layouts/admin-shell/admin-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: SiteShellComponent,
    children: [
      {
        path: '',
        title: 'route.home',
        loadComponent: () =>
          import('./features/public/landing/landing.page').then((m) => m.LandingPage),
      },
      {
        path: 'imoveis',
        title: 'route.properties',
        loadChildren: () =>
          import('./features/public/properties/properties.routes').then((m) => m.default),
      },
      {
        path: 'imovel/:id',
        title: 'route.property.detail',
        loadComponent: () =>
          import('./features/public/property-detail/property-detail.page').then((m) => m.PropertyDetailPage),
      },
      {
        path: 'sobre',
        title: 'route.about',
        loadComponent: () =>
          import('./features/public/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'contato',
        title: 'route.contact',
        loadComponent: () =>
          import('./features/public/contact/contact.page').then((m) => m.ContactPage),
      },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        title: 'route.admin.login',
        loadComponent: () =>
          import('./features/admin/login/admin-login.page').then((m) => m.AdminLoginPage),
      },
      {
        path: '',
        component: AdminShellComponent,
        children: [
          {
            path: '',
            title: 'route.admin.dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
          },
          {
            path: 'imoveis',
            title: 'route.admin.properties',
            loadComponent: () =>
              import('./features/admin/properties/admin-properties.page').then((m) => m.AdminPropertiesPage),
          },
          {
            path: 'imoveis/:id',
            title: 'route.property.detail',
            loadComponent: () =>
              import('./features/admin/property-edit/admin-property-edit.page').then((m) => m.AdminPropertyEditPage),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/public/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
