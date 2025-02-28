import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/models/usuario.dart'; // Asegúrate de que el modelo Usuario esté creado correctamente.

class ApiUsuario {
  static const String baseUrl = "https://gitbf.onrender.com/api/usuarios";

  // Método para obtener los usuarios (GET)
  Future<List<Usuario>> getUsuarios(String token) async {
    final response = await http.get(
      Uri.parse(baseUrl),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      print('Respuesta del servidor: ${response.body}');
      final Map<String, dynamic> jsonData = jsonDecode(response.body);
      final List<dynamic> usuariosData = jsonData['usuarios']; 
      return usuariosData.map((item) => Usuario.fromJson(item)).toList();
    } else {
      throw Exception('Problema al cargar los datos de los usuarios!');
    }
  }

  // Método para agregar un usuario (POST)
  Future<void> addUsuario(String token, Usuario usuario) async {
    print("Cuerpo de la solicitud para agregar usuario: ${jsonEncode(usuario.toJson())}");  // Depuración

    final response = await http.post(
      Uri.parse(baseUrl),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(usuario.toJson()), // Asegúrate de que confirmPassword esté aquí también
    );

    if (response.statusCode != 201) {
      print('Respuesta del servidor (POST): ${response.body}');  // Depuración
      throw Exception('Problema al agregar el usuario!');
    }
  }

  // Método para actualizar un usuario (PUT)
  Future<void> updateUsuario(String token, Usuario usuario) async {
    print("Cuerpo de la solicitud para actualizar usuario: ${jsonEncode(usuario.toJson())}");  // Depuración

    final response = await http.put(
      Uri.parse('$baseUrl/${usuario.id}'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(usuario.toJson()),  // Asegúrate de que confirmPassword esté aquí también
    );

    if (response.statusCode != 200) {
      print('Respuesta del servidor (PUT): ${response.body}');  // Depuración
      throw Exception('Problema al actualizar el usuario!');
    }
  }

  // Método para eliminar un usuario (DELETE)
  Future<void> deleteUsuario(String token, String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/$id'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Problema al eliminar el usuario!');
    }
  }
}
