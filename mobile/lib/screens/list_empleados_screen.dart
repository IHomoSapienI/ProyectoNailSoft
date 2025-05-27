import 'package:flutter/material.dart';
import 'package:mobile/models/empleado.dart';
import 'package:mobile/services/api_empleado.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/services.dart';

class ListEmpleadosScreen extends StatefulWidget {
  final String token;
  const ListEmpleadosScreen({Key? key, required this.token}) : super(key: key);

  @override
  State<ListEmpleadosScreen> createState() => _ListEmpleadosScreenState();
}

class _ListEmpleadosScreenState extends State<ListEmpleadosScreen> with SingleTickerProviderStateMixin {
  final ApiEmpleado apiEmpleado = ApiEmpleado();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;
  String _errorMessage = '';
  List<Empleado> _empleados = [];

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
    _loadEmpleados();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadEmpleados() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      print('Iniciando carga de empleados con token: ${widget.token}');
      final empleados = await apiEmpleado.getEmpleados(widget.token);
      print('Empleados cargados: ${empleados.length}');
      
      setState(() {
        _empleados = empleados;
        _isLoading = false;
      });
    } catch (e) {
      print('Error al cargar empleados: $e');
      setState(() {
        _errorMessage = e.toString();
        _empleados = [];
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteEmpleado(String id) async {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.warning,
      animType: AnimType.scale,
      title: '¿Estás seguro?',
      desc: 'Esta acción eliminará permanentemente el empleado.',
      btnCancelOnPress: () {},
      btnOkOnPress: () async {
        try {
          await apiEmpleado.deleteEmpleado(widget.token, id);
          _showSuccessDialog('Empleado eliminado con éxito');
          _loadEmpleados();
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

  Future<void> _showEmpleadoDialog({Empleado? empleado}) async {
    final isEditing = empleado != null;
    final nombreController = TextEditingController(text: empleado?.nombreempleado ?? '');
    final apellidoController = TextEditingController(text: empleado?.apellidoempleado ?? '');
    final correoController = TextEditingController(text: empleado?.correoempleado ?? '');
    final telefonoController = TextEditingController(text: empleado?.telefonoempleado ?? '');
    bool estadoValue = empleado?.estadoempleado ?? true;

    final result = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
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
                isEditing ? 'Editar Empleado' : 'Agregar Empleado',
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
                    _buildTextField(apellidoController, 'Apellido', Icons.person_outline),
                    const SizedBox(height: 16),
                    _buildTextField(correoController, 'Correo Electrónico', Icons.email, keyboardType: TextInputType.emailAddress),
                    const SizedBox(height: 16),
                    _buildTextField(telefonoController, 'Teléfono', Icons.phone, keyboardType: TextInputType.phone),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text(
                        'Estado',
                        style: TextStyle(color: Colors.white),
                      ),
                      subtitle: Text(
                        estadoValue ? 'Activo' : 'Inactivo',
                        style: TextStyle(
                          color: estadoValue ? Colors.green : Colors.red,
                        ),
                      ),
                      value: estadoValue,
                      onChanged: (value) {
                        setState(() {
                          estadoValue = value;
                        });
                      },
                      activeColor: const Color(0xFFE0115F),
                      activeTrackColor: const Color(0xFFE0115F).withOpacity(0.5),
                      inactiveThumbColor: Colors.grey,
                      inactiveTrackColor: Colors.grey.withOpacity(0.5),
                    ),
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
                    if (nombreController.text.isEmpty || apellidoController.text.isEmpty || 
                        correoController.text.isEmpty || telefonoController.text.isEmpty) {
                      _showErrorDialog('Todos los campos son obligatorios');
                      return;
                    }
                    
                    final newEmpleado = Empleado(
                      id: empleado?.id ?? '',
                      nombreempleado: nombreController.text,
                      apellidoempleado: apellidoController.text,
                      correoempleado: correoController.text,
                      telefonoempleado: telefonoController.text,
                      estadoempleado: estadoValue,
                    );
                    
                    try {
                      if (isEditing) {
                        await apiEmpleado.updateEmpleado(widget.token, newEmpleado);
                      } else {
                        await apiEmpleado.addEmpleado(widget.token, newEmpleado);
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
          }
        );
      },
    );

    if (result == true) {
      _showSuccessDialog(isEditing ? 'Empleado actualizado con éxito' : 'Empleado agregado con éxito');
      _loadEmpleados();
    }
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {TextInputType keyboardType = TextInputType.text}) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      keyboardType: keyboardType,
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
          'EMPLEADOS',
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
              onPressed: _loadEmpleados,
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
                        : _buildEmpleadosList(),
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
        onPressed: () => _showEmpleadoDialog(),
        backgroundColor: const Color(0xFFE0115F),
        child: const Icon(Icons.add, color: Colors.white),
        elevation: 4,
      ),
    );
  }
  
  Widget _buildEmpleadosList() {
    if (_empleados.isEmpty) {
      return _buildEmptyView();
    }
    
    return ListView.builder(
      padding: const EdgeInsets.only(top: 16, bottom: 80),
      itemCount: _empleados.length,
      itemBuilder: (context, index) {
        final empleado = _empleados[index];
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
                    empleado.nombreempleado.isNotEmpty ? empleado.nombreempleado[0].toUpperCase() : '?',
                    style: const TextStyle(
                      color: Color(0xFFD4AF37),
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                    ),
                  ),
                ),
              ),
              title: Text(
                '${empleado.nombreempleado} ${empleado.apellidoempleado}',
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
                  Row(
                    children: [
                      const Icon(Icons.email, size: 14, color: Color(0xFFD4AF37)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          empleado.correoempleado,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.phone, size: 14, color: Color(0xFFD4AF37)),
                      const SizedBox(width: 4),
                      Text(
                        empleado.telefonoempleado,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        empleado.estadoempleado ? Icons.check_circle : Icons.cancel,
                        size: 14,
                        color: empleado.estadoempleado ? Colors.green : Colors.red,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        empleado.estadoempleado ? 'Activo' : 'Inactivo',
                        style: TextStyle(
                          color: empleado.estadoempleado ? Colors.green : Colors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
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
                      onPressed: () => _showEmpleadoDialog(empleado: empleado),
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
                      onPressed: () => _deleteEmpleado(empleado.id),
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
            'Cargando empleados...',
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
            onPressed: _loadEmpleados,
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
            'No hay empleados disponibles',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _loadEmpleados,
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
