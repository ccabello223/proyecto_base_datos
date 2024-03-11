import { Component, Inject, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-dialogo-ver-contacto-emergencia',
  templateUrl: './dialogo-ver-contacto-emergencia.component.html',
  styleUrls: ['./dialogo-ver-contacto-emergencia.component.css'],
})


export class DialogoVerContactoEmergenciaComponent {
  private authService = inject(AuthService)
  
  public user = computed(() => this.authService.usuarioActual());

  constructor(@Inject(MAT_DIALOG_DATA) public data: number) {
    
  }
}
