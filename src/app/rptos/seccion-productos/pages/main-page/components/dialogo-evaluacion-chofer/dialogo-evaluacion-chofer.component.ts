import { Component, ElementRef, Inject, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EvaluacionChofer } from 'src/app/rptos/seccion-productos/interfaces/models/evaluacion_chofer';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { VehiculoTabla } from 'src/app/rptos/seccion-productos/interfaces/vehiculo-tabla';
import { MainPageService } from '../../services/main-page.service';

@Component({
  selector: 'app-dialogo-nota-producto',
  templateUrl: './dialogo-evaluacion-chofer.component.html',
  styleUrls: ['./dialogo-evaluacion-chofer.component.css']
})
export class DialogoEvaluacionChoferComponent {
  private MainPageService = inject(MainPageService);
  @ViewChild('txtTagInput')
  public tagInput!: ElementRef<HTMLInputElement>;
  public calificacion: number = 0;
  private idChofer: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: number) {
    this.idChofer = data
    this.MainPageService.getEvaluacionChofer(data)
    .subscribe( resp => {
      this.calificacion = resp.calificacion
      this.tagInput.nativeElement.value = resp.calificacion.toString();
    })
  }


  EvaluarChofer(): void{
    const calificacion = this.tagInput.nativeElement.value
    if(calificacion.length === 0){
      this.MainPageService.postEvaluacion(this.idChofer, Number(calificacion))
      .subscribe( resp => {
        console.log(resp);
      })
      }else{
        console.log("No se hace nada");
      }
    }
 }

