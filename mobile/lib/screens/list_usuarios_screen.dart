import 'package:flutter/material.dart';
import 'package:mobile/models/usuario.dart';
import 'package:mobile/services/api_usuario.dart';
import 'package:awesome_dialog/awesome_dialog.dart';

class ListUsuariosScreen extends StatefulWidget {
  final String token;
  const ListUsuariosScreen({Key? key, required this.token}) : super(key: key);

  @override
  State<ListUsuariosScreen> createState() => _ListUsuariosScreenState();
}

class _ListUsuariosScreenState extends State<ListUsuariosScreen> {
  final ApiUsuario apiUsuario = ApiUsuario();
  late Future<List<Usuario>> _usuariosFuture;

  @override
  void initState() {
    super.initState();
    _refreshUsuarios();
  }

  Future<void> _refreshUsuarios() async {
    setState(() {
      _usuariosFuture = apiUsuario.getUsuarios(widget.token);
    });
  }

  Future<void> _deleteUsuario(String id) async {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.warning,
      animType: AnimType.scale,
      title: '¿Estás seguro?',
      desc: 'Esta acción eliminará permanentemente el usuario.',
      btnCancelOnPress: () {},
      btnOkOnPress: () async {
        try {
          await apiUsuario.deleteUsuario(widget.token, id);
          _showSuccessDialog('Usuario eliminado con éxito');
          _refreshUsuarios();
        } catch (e) {
          _showErrorDialog('Error al eliminar: $e');
        }
      },
    ).show();
  }

  void _showSuccessDialog(String message) {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.success,
      animType: AnimType.bottomSlide,
      title: 'Éxito',
      desc: message,
      btnOkOnPress: () {},
    ).show();
  }

  void _showErrorDialog(String message) {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.error,
      animType: AnimType.bottomSlide,
      title: 'Error',
      desc: message,
      btnOkOnPress: () {},
      btnOkColor: Colors.red,
    ).show();
  }

  Future<void> _showUsuarioDialog({Usuario? usuario}) async {
    final isEditing = usuario != null;
    final nombreController = TextEditingController(text: usuario?.nombre ?? '');
    final emailController = TextEditingController(text: usuario?.email ?? '');
    final passwordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final rolController = TextEditingController(text: usuario?.rol ?? '');

    final result = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            isEditing ? 'Editar Usuario' : 'Agregar Usuario',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField(nombreController, 'Nombre', Icons.person),
                const SizedBox(height: 16),
                _buildTextField(emailController, 'Email', Icons.email),
                const SizedBox(height: 16),
                _buildTextField(passwordController, 'Contraseña', Icons.lock, isPassword: true),
                const SizedBox(height: 16),
                _buildTextField(confirmPasswordController, 'Confirmar Contraseña', Icons.lock, isPassword: true),
                const SizedBox(height: 16),
                _buildTextField(rolController, 'Rol', Icons.work),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Cancelar', style: TextStyle(color: Colors.red)),
              onPressed: () => Navigator.of(context).pop(false),
            ),
            ElevatedButton(
              child: Text(isEditing ? 'Actualizar' : 'Agregar'),
              onPressed: () async {
                if (passwordController.text != confirmPasswordController.text) {
                  _showErrorDialog('Las contraseñas no coinciden');
                  return;
                }
                final newUsuario = Usuario(
                  id: usuario?.id ?? '',
                  nombre: nombreController.text,
                  email: emailController.text,
                  password: passwordController.text,
                  confirmPassword: confirmPasswordController.text,
                  rol: rolController.text,
                );
                try {
                  if (isEditing) {
                    await apiUsuario.updateUsuario(widget.token, newUsuario);
                  } else {
                    await apiUsuario.addUsuario(widget.token, newUsuario);
                  }
                  Navigator.of(context).pop(true);
                } catch (e) {
                  _showErrorDialog('Error: $e');
                  Navigator.of(context).pop(false);
                }
              },
            ),
          ],
        );
      },
    );

    if (result == true) {
      _showSuccessDialog(isEditing ? 'Usuario actualizado con éxito' : 'Usuario agregado con éxito');
      _refreshUsuarios();
    }
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {bool isPassword = false}) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.blue),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Colors.blue, width: 2),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lista de Usuarios', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.blue.shade50, Colors.white],
                ),
              ),
              child: FutureBuilder<List<Usuario>>(
                future: _usuariosFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text("Error: ${snapshot.error}", style: const TextStyle(color: Colors.red)));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(child: Text('No hay usuarios disponibles.', style: TextStyle(fontSize: 18)));
                  }

                  final usuarios = snapshot.data!;
                  return ListView.builder(
                    itemCount: usuarios.length,
                    itemBuilder: (context, index) {
                      final usuario = usuarios[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                        elevation: 5,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.blue,
                            child: Text(
                              usuario.nombre.isNotEmpty ? usuario.nombre[0].toUpperCase() : '?',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          title: Text(usuario.nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(usuario.email),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, color: Colors.blue),
                                onPressed: () => _showUsuarioDialog(usuario: usuario),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _deleteUsuario(usuario.id),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
          Container(
            color: Colors.blue.shade100,
            padding: const EdgeInsets.all(10),
            child: const Text(
              '© Sebastian Alvarez Restrepo - Ficha 2821731 - Año 2024',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showUsuarioDialog(),
        child: const Icon(Icons.add),
        backgroundColor: Colors.blue,
      ),
    );
  }
}
