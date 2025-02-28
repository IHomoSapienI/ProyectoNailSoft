class Usuario {
  final String id;
  final String nombre;
  final String email;
  final String password;
  final String confirmPassword;  // Agregar el campo confirmPassword
  final String rol;
  bool estado;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    required this.password,
    required this.confirmPassword, // Incluir en el constructor
    required this.rol,
    this.estado = true,
  });

  // Método factory para crear el objeto desde JSON
  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['_id'] ?? '',
      nombre: json['nombre'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      confirmPassword: json['confirmPassword'] ?? '',  // Asegúrate de que esté en la respuesta
      rol: json['rol'] ?? '',
      estado: json['estado'] ?? true,
    );
  }

  // Método para convertir el objeto Usuario a JSON
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'nombre': nombre,
      'email': email,
      'password': password,
      'confirmPassword': confirmPassword,  // Agregar el campo
      'rol': rol,
      'estado': estado,
    };
  }
}
