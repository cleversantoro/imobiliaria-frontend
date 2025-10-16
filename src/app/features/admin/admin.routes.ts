import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'imoveis',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./properties/admin-properties.page').then((m) => m.AdminPropertiesPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./property-edit/admin-property-edit.page').then((m) => m.AdminPropertyEditPage),
      },
    ],
  },
] satisfies Routes;
