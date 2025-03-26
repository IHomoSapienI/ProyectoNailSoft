import 'package:mobile/models/cliente.dart';
import 'package:mobile/models/empleado.dart';
import 'package:mobile/models/servicio.dart';
import 'package:mobile/models/producto.dart';
import 'package:mobile/models/cita.dart';
class Venta {
  final String id;
  final String codigoVenta;
  final Cliente nombrecliente;
  final Cita fechacita;
  final Empleado nombreempleado;
  final Producto nombreProducto;
  final Servicio nombreServicio;

  Venta({
    required this.id,
    required this.codigoVenta,
    required this.nombrecliente,
    required this.fechacita,
    required this.nombreempleado,
    required this.nombreProducto,
    required this.nombreServicio
  });

  //Método para crear una instancia de un sevicios desde JSON
  factory Venta.fromJson(Map<String, dynamic> json) {
    return Venta(
      //Mapeamos todos los campos de el modelo
      id: json['_id'] ?? '',
      codigoVenta: json['codigoVenta'] ?? '',
      nombrecliente: Cliente.fromJson(json['nombrecliente'] ?? {}),
      fechacita: Cita.fromJson(json['fechacita'] ?? {}),
      nombreempleado: Empleado.fromJson(json['nombreemopleado']?? {}),
      nombreProducto: Producto.fromJson(json['nombreProducto'] ?? {}),
      nombreServicio: Servicio.fromJson(json['nombreServicio'] ?? {})

    );
  }

  Map<String, dynamic> toJson(){
    return{
      '_id':id,
      'codigoVenta': codigoVenta,
      'nombrecliente': nombrecliente.toJson(),
      'fechacita': fechacita.toJson(),
      'nombreempleado': nombreempleado.toJson(),
      'nombreProducto':nombreProducto.toJson(),
      'nombreServicio' : nombreServicio.toJson()
    };
  }

}
