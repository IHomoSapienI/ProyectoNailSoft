import 'package:mobile/models/cliente.dart';
import 'package:mobile/models/servicio.dart';
import 'package:mobile/models/empleado.dart';
class Cita{
 final String id;
 final Empleado nombreempleado; // Relación con Empleado
 final Cliente nombrecliente; // Relación con cliente
 final DateTime fechacita;
 final DateTime horacita;
 final DateTime duracionTotal;
 final bool estadocita;
 final Servicio nombreServicio; //Relación con Servicio

 Cita({
  required this.id,
  required this.nombrecliente,
  required this.nombreempleado,
  required this.fechacita,
  required this.horacita,
  required this.duracionTotal,
  required this.estadocita,
  required this.nombreServicio
 });

//Creamos una instancia de servicio desde in JSON
  factory Cita.fromJson(Map<String, dynamic> json) {
    return Cita(
      //Mapeamos todos los campos de el modelo
      id: json['_id'] ?? '',
      nombreempleado: Empleado.fromJson(json['nombreempleado'] ?? {}),
      nombrecliente: Cliente.fromJson(json['nombrecliente'] ?? {}),
      fechacita: json['fechacita'] != null
    ? DateTime.tryParse(json['fechacita']) ?? DateTime(1970, 1, 1)
    : DateTime(1970, 1, 1),

horacita: json['horacita'] != null
    ? DateTime.tryParse(json['horacita']) ?? DateTime(1970, 1, 1)
    : DateTime(1970, 1, 1),

duracionTotal: json['duracionTotal'] != null
    ? DateTime.tryParse(json['duracionTotal']) ?? DateTime(1970, 1, 1)
    : DateTime(1970, 1, 1),

      estadocita: json['estadocita'] ?? true,
      nombreServicio:Servicio.fromJson(json['nombreServicio'] ?? {})
    ); 
  }

  //Metodo par aconvertir un servicio a JSON
  Map<String, dynamic>toJson(){
    return {
      '_id': id,
      'nombreempleado': nombreempleado.toJson(),
      'nombrecliente': nombrecliente.toJson(),
      'fechacita': fechacita,
      'horacita':horacita,
      'duracionTotal':duracionTotal,
      'estadocita':estadocita,
      'nombreServicio': nombreServicio.toJson()
    };
  }
}
