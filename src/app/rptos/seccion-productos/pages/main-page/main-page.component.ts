import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { ChoferTabla, Chofere } from '../../interfaces';
import { DialogoVerBancoComponent } from './components/dialogo-ver-banco/dialogo-ver-banco.component';
import { DialogoEvaluacionChoferComponent } from './components/dialogo-evaluacion-chofer/dialogo-evaluacion-chofer.component';
import { DialogoVehiculoChoferComponent } from './components/dialogo-vehiculo-chofer/dialogo-vehiculo-chofer.component';
import { MainPageService } from './services/main-page.service';
import { Lugares } from '../../interfaces/models/lugares';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrasladoResponse } from '../../interfaces/traslado-response';
import { DialogoVerTrasladoWebComponent } from './components/dialogo-ver-traslado-webs/dialogo-ver-traslado-web.component';
import { DialogoVerContactoEmergenciaComponent } from './components/dialogo-ver-contacto-emergencia/dialogo-ver-contacto-emergencia.component';

@Component({
  selector: 'app-lista-producto',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog)
  private authService = inject(AuthService)
  private MainPageService = inject(MainPageService);
  private fb = inject(FormBuilder);

  choferes: Chofere[] = [];
  lugares: Lugares[] = [];
  trasladoActual!: TrasladoResponse;

  isLoading = false;
  message: string = '';
  distid?: string = '';
  selectedFile?: File;
  selection = new SelectionModel<ChoferTabla>(true, []);
  selectedRows: ChoferTabla[] = [];
  showButton: boolean = false;

  //Formulario para el control de los lugares
  lugarFormulario: FormGroup = this.fb.group({
    origen: ['', [Validators.maxLength(255)]],
    destino: ['', [Validators.maxLength(255)]],
  });

  displayedColumns: string[] = ['checkbox', 'id', 'nombre', 'apellido', 'cedula', 'fecha', 'carros', 'banco', 'evaluacion', 'emergencia'];
  displayedColumns2: string[] = ['checkbox', 'id', 'nombre', 'apellido', 'cedula', 'fecha', 'carros', 'banco', 'evaluacion'];

  dataSource!: MatTableDataSource<ChoferTabla>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  public user = computed(() => this.authService.usuarioActual());

  constructor() {
  }

  ngOnInit(): void {
    switch (this.user()?.rol) {
      case 1:
        this.getChoferesFromBBDD();
      break;
      case 2:
        this.getLugaresDisponibles();
      break;
      case 3:
        // this.mainTitle = 'Lista de Vehiculos'
      break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
  }

  //Si es para administradores
  getChoferesFromBBDD() {
    this.MainPageService.getChoferes().subscribe(resp => {
      this.choferes = resp.choferes
      const users = Array.from({ length: this.choferes.length }, (_, k) => this.createNewProducts(k));
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  //Si es para clientes
  getLugaresDisponibles(){
    this.MainPageService.getLugaresDisponibles()
    .subscribe(resp => {
      this.lugares = resp
    })
  }

  guardarTraslado():void{
    const {origen, destino } = this.lugarFormulario.value

    if (origen === destino) {
      Swal.fire('Error', "No se puede pedir una carrera en con origen y destino iguales", 'error') 
    }else{
      const idOrigen = origen
      const idDestino = destino
      const costo = 30
      const body = {idOrigen, idDestino, costo}
      this.MainPageService.postSolictarTraslado(this.user()?.idUsuario!, body)
      .subscribe(
        resp => {
          if(resp["message"] === "Traslado solicitado con éxito.")
          this.MainPageService.getTraslado(this.user()?.idUsuario!)
          .subscribe(
            resp => {
              //obtengo el ultimo traslado realizado por el cliente
              this.trasladoActual = resp[resp.length-1];
              let lugarOrigen = this.lugares.find(lugar => lugar.id === idOrigen);
              let lugarDestino = this.lugares.find(lugar => lugar.id === idDestino);
              this.dialog.open(DialogoVerTrasladoWebComponent, {
                data: {
                  origen: lugarOrigen?.nombre,
                  destino: lugarDestino?.nombre,
                  traslado: this.trasladoActual
                },
              })
            }
          )
        }
      )
    }
  }

  //TODO: Hacer la de chofer 
    //getVehiculoFromBBDD()

  //TODO: Hacer la de cliente
    //getRutasFromBBDD()
  
    applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Builds and returns a new Products. */
  createNewProducts(i: number): ChoferTabla {
    return {
      id: this.choferes[i].id,
      nombre: this.choferes[i].nombre,
      apellido: this.choferes[i].apellido,
      cedula: this.choferes[i].cedula,
      fecha_nacimiento: this.choferes[i].fechaNacimiento,
    }
  }

  /* Abre el dialogo para ver el banco*/
  openDialogBanco(element: ChoferTabla) {
    this.dialog.open(DialogoVerBancoComponent, {
      data: element.id,
    })
  }

  openDialogEvaluacionChofer(element: any) {
    this.dialog.open(DialogoEvaluacionChoferComponent, {
      data: element.id,
    })
  }

  openDialogVehiculo(element: ChoferTabla) {
    this.dialog.open(DialogoVehiculoChoferComponent, {
      data: element.id,
    })
  }

  openDialogContactoEmergencia(element: ChoferTabla) {
    this.dialog.open(DialogoVerContactoEmergenciaComponent, {
      data: element.id,
    })
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (this.selectedFile == undefined) {
      Swal.fire('Error', "No ha subido ningún archivo!", 'error')
    } else {
      this.isLoading = true;
      this.MainPageService.postExcelProduct(this.selectedFile)
        .subscribe(resp => {
          if (resp["ok"] === true) {
            this.getChoferesFromBBDD();
            Swal.fire('Todo correcto!!', resp["msg"], 'success')
          }
          else {
            Swal.fire('Error', "Sucedió un error. Notificar a administración", 'error')
          }
          this.isLoading = false;
        })
    }
  }

  downloadExcel(): void {
    window.location.href = `${this.MainPageService.getBaseUrl}/productos/downloadExcel`;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ChoferTabla): string {
    if (!row) {
      return '';
    }
    if (this.selection.isSelected(row)) {
      console.log(row);
      //return row.descripcion;
      return row.cedula;
    }
    return `${this.selection.isSelected(row) ? 'select' : 'deselect'} row ${row.id}`;
    // console.log(`${this.selection.isSelected(row) ? 'select' : 'deselect'} row ${row.id}`);
  }

  onRowSelect(event: any, row: any) {
    if (event.checked) {
      this.selectedRows.push(row);
    } else {
      const index = this.selectedRows.indexOf(row);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      }
    }
    this.showButton = this.selectedRows.length > 0;
  }


  deleteProductSelected() {
    let productosABorrar: number[] = [];
    this.selectedRows.forEach(element => {
      productosABorrar.push(element.id);
    })
    Swal.fire({
      title: '¿Estás seguro de borrar este artículo?',
      text: "¡Este cambio no podrá ser revertido!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar'
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.MainPageService.deleteProducts(productosABorrar).subscribe(resp => {
          if(resp["ok"] == true){
            Swal.fire(
              'Borrado!',
              resp["msg"],
              'success'
            );
            this.getChoferesFromBBDD();
          }else{
            Swal.fire(
              'Error!',
              resp["errorMsg"],
              'error'
            );
          }
        })
      }
    });
    
  }

  /*---------------

/** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedRows = [];
      this.showButton = this.selectedRows.length > 0;
      return;
    }

    this.selection.select(...this.dataSource.data);
    this.selection.selected.forEach(element => {
      this.selectedRows.push(element);
    });
    //Habilita el boton para subir el producto
    this.showButton = this.selectedRows.length > 0;
  }
}

