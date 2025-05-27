import 'package:flutter/material.dart';
import 'package:mobile/models/usuario.dart';
import 'package:mobile/services/api_usuario.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/services.dart';

class ListUsuariosScreen extends StatefulWidget {
  final String token;
  const ListUsuariosScreen({Key? key, required this.token}) : super(key: key);

  @override
  State<ListUsuariosScreen> createState() => _ListUsuariosScreenState();
}

class _ListUsuariosScreenState extends State<ListUsuariosScreen> with SingleTickerProviderStateMixin {
  final ApiUsuario apiUsuario = ApiUsuario();
  late Future<List<Usuario>> _usuariosFuture;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;
  String _errorMessage = '';
  List<Usuario> _usuarios = [];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeIn,
      ),
    );
    _animationController.forward();
    
    // Set system UI overlay style
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
    
    // Inicializar el Future después de configurar las animaciones
    _loadUsuarios();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadUsuarios() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      print('Iniciando carga de usuarios con token: ${widget.token}');
      final usuarios = await apiUsuario.getUsuarios(widget.token);
      print('Usuarios cargados: ${usuarios.length}');
      
      setState(() {
        _usuarios = usuarios;
        _usuariosFuture = Future.value(usuarios);
        _isLoading = false;
      });
    } catch (e) {
      print('Error al cargar usuarios: $e');
      setState(() {
        _errorMessage = e.toString();
        _usuarios = [];
        _usuariosFuture = Future.value([]);
        _isLoading = false;
      });
    }
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
          _loadUsuarios();
        } catch (e) {
          _showErrorDialog('Error al eliminar: $e');
        }
      },
      btnOkColor: const Color(0xFFE0115F),
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
      btnOkColor: const Color(0xFFE0115F),
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
      btnOkColor: const Color(0xFFE0115F),
    ).show();
  }

  Future<void> _showUsuarioDialog({Usuario? usuario}) async {
    final isEditing = usuario != null;
    final nombreController = TextEditingController(text: usuario?.nombre ?? '');
    final emailController = TextEditingController(text: usuario?.email ?? '');
    final passwordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final rolController = TextEditingController(text: usuario?.rolNombre ?? '');

    final result = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.black.withOpacity(0.9),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
            side: BorderSide(
              color: const Color(0xFFD4AF37).withOpacity(0.5),
              width: 1,
            ),
          ),
          title: Text(
            isEditing ? 'Editar Usuario' : 'Agregar Usuario',
            style: const TextStyle(
              fontWeight: FontWeight.bold, 
              color: Color(0xFFD4AF37),
              fontSize: 20,
            ),
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
              child: const Text('Cancelar', style: TextStyle(color: Colors.white70)),
              onPressed: () => Navigator.of(context).pop(false),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE0115F),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: Text(isEditing ? 'Actualizar' : 'Agregar'),
              onPressed: () async {
                if (passwordController.text != confirmPasswordController.text) {
                  _showErrorDialog('Las contraseñas no coinciden');
                  return;
                }
                
                // Crear un mapa para el rol
                dynamic rolData;
                if (usuario != null && usuario.rol is Map) {
                  // Mantener el ID del rol si estamos editando
                  rolData = usuario.rol;
                  if (rolData.containsKey('nombreRol')) {
                    rolData['nombreRol'] = rolController.text;
                  }
                } else {
                  rolData = {'nombreRol': rolController.text};
                }
                
                final newUsuario = Usuario(
                  id: usuario?.id ?? '',
                  nombre: nombreController.text,
                  email: emailController.text,
                  password: passwordController.text,
                  confirmPassword: confirmPasswordController.text,
                  rol: rolData,
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
      _loadUsuarios();
    }
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {bool isPassword = false}) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
        prefixIcon: Icon(icon, color: const Color(0xFFD4AF37)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFD4AF37), width: 2),
        ),
        filled: true,
        fillColor: Colors.white.withOpacity(0.1),
      ),
    );
  }

  Widget _buildCornerDecoration() {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(width: 2, color: const Color(0xFFD4AF37).withOpacity(0.7)),
          left: BorderSide(width: 2, color: const Color(0xFFD4AF37).withOpacity(0.7)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text(
          'USUARIOS',
          style: TextStyle(
            fontWeight: FontWeight.bold, 
            fontSize: 22,
            letterSpacing: 2,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.only(left: 8),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFFD4AF37).withOpacity(0.7),
              width: 1,
            ),
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Color(0xFFD4AF37)),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFD4AF37).withOpacity(0.7),
                width: 1,
              ),
            ),
            child: IconButton(
              icon: const Icon(Icons.refresh, color: Color(0xFFD4AF37)),
              onPressed: _loadUsuarios,
            ),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          color: Colors.black,
        ),
        child: Stack(
          children: [
            // Background pattern
            Positioned.fill(
              child: Opacity(
                opacity: 0.05,
                child: Image.asset(
                  'images/logo1.png',
                  repeat: ImageRepeat.repeat,
                  color: const Color(0xFFD4AF37), // Gold color
                ),
              ),
            ),
            
            // Decorative corner elements
            Positioned(
              top: 20,
              left: 20,
              child: _buildCornerDecoration(),
            ),
            Positioned(
              top: 20,
              right: 20,
              child: Transform.rotate(
                angle: 1.57, // 90 degrees
                child: _buildCornerDecoration(),
              ),
            ),
            Positioned(
              bottom: 20,
              right: 20,
              child: Transform.rotate(
                angle: 3.14, // 180 degrees
                child: _buildCornerDecoration(),
              ),
            ),
            Positioned(
              bottom: 20,
              left: 20,
              child: Transform.rotate(
                angle: 4.71, // 270 degrees
                child: _buildCornerDecoration(),
              ),
            ),
            
            // Main content
            SafeArea(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  children: [
                    Expanded(
                      child: _isLoading 
                      ? _buildLoadingIndicator()
                      : _errorMessage.isNotEmpty 
                        ? _buildErrorView()
                        : _buildUserList(),
                    ),
                    Container(
                      color: Colors.black.withOpacity(0.7),
                      padding: const EdgeInsets.all(10),
                      child: const Text(
                        '© Sebastian Alvarez Restrepo - Ficha 2821731 - Año 2024',
                        style: TextStyle(
                          fontSize: 12, 
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFD4AF37),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showUsuarioDialog(),
        backgroundColor: const Color(0xFFE0115F),
        child: const Icon(Icons.add, color: Colors.white),
        elevation: 4,
      ),
    );
  }
  
  Widget _buildUserList() {
    if (_usuarios.isEmpty) {
      return _buildEmptyView();
    }
    
    return ListView.builder(
      padding: const EdgeInsets.only(top: 16, bottom: 80),
      itemCount: _usuarios.length,
      itemBuilder: (context, index) {
        final usuario = _usuarios[index];
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFD4AF37).withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Card(
            elevation: 0,
            color: Colors.black.withOpacity(0.7),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                color: const Color(0xFFD4AF37).withOpacity(0.3),
                width: 1,
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFD4AF37).withOpacity(0.5),
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    usuario.nombre.isNotEmpty ? usuario.nombre[0].toUpperCase() : '?',
                    style: const TextStyle(
                      color: Color(0xFFD4AF37),
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                    ),
                  ),
                ),
              ),
              title: Text(
                usuario.nombre,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(
                    usuario.email,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Rol: ${usuario.rolNombre}',
                    style: const TextStyle(
                      color: Color(0xFFD4AF37),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFD4AF37).withOpacity(0.5),
                        width: 1,
                      ),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.edit, color: Color(0xFFD4AF37), size: 20),
                      onPressed: () => _showUsuarioDialog(usuario: usuario),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFE0115F).withOpacity(0.5),
                        width: 1,
                      ),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.delete, color: Color(0xFFE0115F), size: 20),
                      onPressed: () => _deleteUsuario(usuario.id),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFD4AF37).withOpacity(0.5),
                width: 2,
              ),
            ),
            child: const CircularProgressIndicator(
              color: Color(0xFFD4AF37),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Cargando usuarios...',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildErrorView({String? error}) {
    final errorMsg = error ?? _errorMessage;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFE0115F).withOpacity(0.5),
                width: 2,
              ),
            ),
            child: const Icon(
              Icons.error_outline,
              size: 60,
              color: Color(0xFFE0115F),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Ha ocurrido un error',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              'Error: $errorMsg',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _loadUsuarios,
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white,
              backgroundColor: const Color(0xFFE0115F),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFD4AF37).withOpacity(0.5),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.people,
              size: 60,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No hay usuarios disponibles',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _loadUsuarios,
            icon: const Icon(Icons.refresh),
            label: const Text('Actualizar'),
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white,
              backgroundColor: const Color(0xFFE0115F),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
