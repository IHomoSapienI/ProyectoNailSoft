class Empleado {
  final String id;
  final String nombreempleado;
  final String apellidoempleado;
  final String correoempleado;
  final String telefonoempleado;
  final bool estadoempleado;

  Empleado({
    required this.id,
    required this.nombreempleado,
    required this.apellidoempleado,
    required this.correoempleado,
    required this.telefonoempleado,
    required this.estadoempleado
  });

  factory Empleado.fromJson(Map<String, dynamic> json) {
    return Empleado(
      id: json['_id'] ?? '',
      nombreempleado: json['nombreempleado'] ?? '',
      apellidoempleado: json['apellidoempleado'] ?? '',
      correoempleado: json['correoempleado']?? '',
      telefonoempleado: json['telefonoempleado'] ?? '',
      estadoempleado : json['estadoempleado'] ?? ''
    );
  }

  Map<String, dynamic> toJson(){
    return {
      '_id': id,
      'nombreempleado':nombreempleado,
      'apellidoempleado':apellidoempleado,
      'correoempleado':correoempleado,
      'telefonoempleado':telefonoempleado,
      'estadoempleado':estadoempleado
    };
  }
}