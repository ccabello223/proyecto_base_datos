import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeccionProductosComponent } from './seccion-productos.component';

const routes: Routes = [
  {
    path: '',
    component: SeccionProductosComponent,
    children: [
      {
        path: 'lista-producto',
        loadChildren: () => import('./pages/main-page/main-page.module').then(m=>m.ListaProductoModule)
      },
      {
        path: '**', redirectTo: 'lista-producto', pathMatch:'full'
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeccionProductosRoutingModule { }
