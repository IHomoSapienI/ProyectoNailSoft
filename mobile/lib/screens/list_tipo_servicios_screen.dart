import 'package:flutter/material.dart';
import 'package:mobile/models/tipo_servicio.dart';
import 'package:mobile/services/api_tipo_servicio.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/services.dart';

class TipoServicios extends StatefulWidget {
  final String token;
  const TipoServicios({Key? key, required this.token}) : super(key: key);

  @override
  State<TipoServicios> createState() => _TipoServiciosState();
}

class _TipoServiciosState extends State<TipoServicios> with SingleTickerProviderStateMixin {
  final ApiTipoServicio apiTipoServicio = ApiTipoServicio();
  final TextEditingController _nombreTsController = TextEditingController();
  bool _selectedEstado = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

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
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _registerTipoServicio(String nombreTs, bool estado) async {
    try {
      await apiTipoServicio.createTipoServicio(nombreTs, estado);
      setState(() {});
      _showSuccessDialog('Tipo de servicio registrado con éxito');
    } catch (e) {
      _showErrorDialog('Error al registrar: $e');
    }
  }

  Future<void> _editTipoServicio(String id, String nombreTs, bool estado) async {
    try {
      await apiTipoServicio.updateTipoServicio(id, nombreTs, estado);
      setState(() {});
      _showSuccessDialog('Tipo de servicio actualizado con éxito');
    } catch (e) {
      _showErrorDialog('Error al actualizar: $e');
    }
  }

  Future<void> _deleteTipoServicio(String id) async {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.warning,
      animType: AnimType.scale,
      title: '¿Estás seguro?',
      desc: 'Esta acción eliminará permanentemente el tipo de servicio.',
      btnCancelOnPress: () {},
      btnOkOnPress: () async {
        try {
          await apiTipoServicio.deleteTipoServicio(id);
          setState(() {});
          _showSuccessDialog('Tipo de servicio eliminado con éxito');
        } catch (e) {
          _showErrorDialog('Error al eliminar: $e');
        }
      },
      btnOkColor: const Color(0xFFE0115F),
    ).show();
  }

  void _navigateToServicios(String token) {
    Navigator.pushNamed(context, '/servicios', arguments: token);
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

  void _showServiceModal({required String title, required VoidCallback onConfirm, String? initialNombre, bool? initialEstado}) {
    _nombreTsController.text = initialNombre ?? '';
    _selectedEstado = initialEstado ?? true;

    showDialog(
      context: context,
      builder: (context) {
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
            title, 
            style: const TextStyle(
              fontWeight: FontWeight.bold, 
              color: Color(0xFFD4AF37),
              fontSize: 20,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nombreTsController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Tipo Servicio',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
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
                  prefixIcon: const Icon(Icons.category, color: Color(0xFFD4AF37)),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<bool>(
                value: _selectedEstado,
                dropdownColor: Colors.black.withOpacity(0.9),
                style: const TextStyle(color: Colors.white),
                items: [
                  DropdownMenuItem(
                    value: true, 
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 20),
                        const SizedBox(width: 8),
                        const Text('Activo'),
                      ],
                    ),
                  ),
                  DropdownMenuItem(
                    value: false, 
                    child: Row(
                      children: [
                        const Icon(Icons.cancel, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        const Text('Inactivo'),
                      ],
                    ),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedEstado = value!;
                  });
                },
                decoration: InputDecoration(
                  labelText: 'Estado',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
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
                  prefixIcon: const Icon(Icons.toggle_on_outlined, color: Color(0xFFD4AF37)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar', style: TextStyle(color: Colors.white70)),
            ),
            ElevatedButton.icon(
              onPressed: () {
                onConfirm();
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.save),
              label: const Text('Guardar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE0115F),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
            ),
          ],
        );
      },
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
    final String token = ModalRoute.of(context)!.settings.arguments as String;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text(
          'TIPOS DE SERVICIOS',
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
              icon: const Icon(Icons.list, color: Color(0xFFD4AF37)),
              onPressed: () => _navigateToServicios(token),
              tooltip: 'Ir a Servicios',
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
                      child: FutureBuilder<List<TipoServicio>>(
                        future: apiTipoServicio.getTipoServicios(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState == ConnectionState.waiting) {
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
                                    'Cargando tipos de servicios...',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          } else if (snapshot.hasError) {
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
                                      'Error: ${snapshot.error}',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.white.withOpacity(0.7),
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                          final tipoServicios = snapshot.data!;
                          if (tipoServicios.isEmpty) {
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
                                      Icons.category,
                                      size: 60,
                                      color: Colors.white.withOpacity(0.5),
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                  const Text(
                                    'No hay tipos de servicios disponibles',
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
                          return ListView.builder(
                            padding: const EdgeInsets.only(top: 16, bottom: 80),
                            itemCount: tipoServicios.length,
                            itemBuilder: (context, index) {
                              final tipoServicio = tipoServicios[index];
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
                                      child: const Icon(
                                        Icons.category,
                                        size: 30,
                                        color: Color(0xFFD4AF37),
                                      ),
                                    ),
                                    title: Text(
                                      tipoServicio.nombreTs,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Colors.white,
                                      ),
                                    ),
                                    subtitle: Row(
                                      children: [
                                        Icon(
                                          tipoServicio.estado ? Icons.check_circle : Icons.cancel,
                                          color: tipoServicio.estado ? Colors.green : Colors.red,
                                          size: 16,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Estado: ${tipoServicio.estado ? "Activo" : "Inactivo"}',
                                          style: TextStyle(
                                            color: tipoServicio.estado ? Colors.green : Colors.red,
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
                                            onPressed: () {
                                              _showServiceModal(
                                                title: 'Editar Tipo Servicio',
                                                initialNombre: tipoServicio.nombreTs,
                                                initialEstado: tipoServicio.estado,
                                                onConfirm: () {
                                                  _editTipoServicio(
                                                    tipoServicio.id,
                                                    _nombreTsController.text,
                                                    _selectedEstado,
                                                  );
                                                },
                                              );
                                            },
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
                                            onPressed: () => _deleteTipoServicio(tipoServicio.id),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
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
        onPressed: () {
          _showServiceModal(
            title: 'Registrar Tipo Servicio',
            onConfirm: () {
              _registerTipoServicio(_nombreTsController.text, _selectedEstado);
            },
          );
        },
        backgroundColor: const Color(0xFFE0115F),
        child: const Icon(Icons.add, color: Colors.white),
        elevation: 4,
      ),
    );
  }
}
