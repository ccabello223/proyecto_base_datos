import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeccionPedidosRoutingModule } from './seccion-pedidos-routing.module';
import { SeccionPedidosComponent } from './seccion-pedidos.component';
import { MaterialModule } from 'src/app/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    SeccionPedidosComponent,
  ],
  imports: [
    CommonModule,
    SeccionPedidosRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ]
})
export class SeccionPedidosModule { }
