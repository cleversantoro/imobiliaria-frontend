import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./properties-list.page').then((m) => m.PropertiesListPage),
  },
] satisfies Routes;
