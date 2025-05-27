import 'package:flutter/material.dart';
import 'package:mobile/models/servicio.dart';
import 'package:mobile/models/tipo_servicio.dart';
import 'package:mobile/services/api_servicio.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/services.dart';

class ListServicesScreen extends StatefulWidget {
  final String token;
  const ListServicesScreen({required this.token, super.key});

  @override
  State<ListServicesScreen> createState() => _ListServicesScreenState();
}

class _ListServicesScreenState extends State<ListServicesScreen> with SingleTickerProviderStateMixin {
  final ApiServicio apiServicio = ApiServicio();
  late Future<List<Servicio>> serviciosFuture;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    serviciosFuture = apiServicio.getServicios(widget.token);
    
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

  Future<void> _refreshServicios() async {
    setState(() {
      serviciosFuture = apiServicio.getServicios(widget.token);
    });
  }

  void _showServiceDialog({Servicio? servicio}) {
    final TextEditingController nombreController =
        TextEditingController(text: servicio?.nombreServicio ?? '');
    final TextEditingController descripcionController =
        TextEditingController(text: servicio?.descripcion ?? '');
    final TextEditingController precioController =
        TextEditingController(text: servicio?.precio.toString() ?? '');
    final TextEditingController tiempoController =
        TextEditingController(text: servicio?.tiempo.toString() ?? '');
    final TextEditingController imagenController =
        TextEditingController(text: servicio?.imagenUrl ?? '');

    showDialog(
      context: context,
      builder: (_) {
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
            servicio == null ? 'Agregar Servicio' : 'Editar Servicio',
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
                _buildTextField(nombreController, 'Nombre del Servicio', Icons.work),
                const SizedBox(height: 16),
                _buildTextField(descripcionController, 'Descripción', Icons.description),
                const SizedBox(height: 16),
                _buildTextField(precioController, 'Precio', Icons.attach_money, keyboardType: TextInputType.number),
                const SizedBox(height: 16),
                _buildTextField(tiempoController, 'Tiempo (min)', Icons.timer, keyboardType: TextInputType.number),
                const SizedBox(height: 16),
                _buildTextField(imagenController, 'URL de la Imagen', Icons.image),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancelar', 
                style: TextStyle(color: Colors.white70)
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                final newServicio = Servicio(
                  id: servicio?.id ?? '',
                  nombreServicio: nombreController.text,
                  descripcion: descripcionController.text,
                  precio: double.tryParse(precioController.text) ?? 0.0,
                  tiempo: int.tryParse(tiempoController.text) ?? 0,
                  nombreTs: servicio?.nombreTs ??
                      TipoServicio(id: '1', nombreTs: 'General', estado: true),
                  estado: true,
                  imagenUrl: imagenController.text,
                );

                try {
                  if (servicio == null) {
                    await apiServicio.addServicio(widget.token, newServicio);
                  } else {
                    await apiServicio.updateServicio(widget.token, newServicio);
                  }
                  _refreshServicios();
                  Navigator.of(context).pop();
                  AwesomeDialog(
                    context: context,
                    dialogType: DialogType.success,
                    animType: AnimType.bottomSlide,
                    title: 'Éxito',
                    desc: servicio == null ? 'Servicio agregado con éxito' : 'Servicio actualizado con éxito',
                    btnOkOnPress: () {},
                    btnOkColor: const Color(0xFFE0115F),
                  ).show();
                } catch (e) {
                  _showErrorDialog('Error: $e');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE0115F),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: Text(servicio == null ? 'Agregar' : 'Actualizar'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {TextInputType keyboardType = TextInputType.text}) {
    return TextField(
      controller: controller,
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
      keyboardType: keyboardType,
    );
  }

  Future<void> _deleteServicio(String id) async {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.warning,
      animType: AnimType.scale,
      title: '¿Estás seguro?',
      desc: 'Esta acción eliminará permanentemente el servicio.',
      btnCancelOnPress: () {},
      btnOkOnPress: () async {
        try {
          await apiServicio.deleteServicio(widget.token, id);
          AwesomeDialog(
            context: context,
            dialogType: DialogType.success,
            animType: AnimType.bottomSlide,
            title: 'Éxito',
            desc: 'Servicio eliminado con éxito',
            btnOkOnPress: () {},
            btnOkColor: const Color(0xFFE0115F),
          ).show();
          _refreshServicios();
        } catch (e) {
          _showErrorDialog('Error al eliminar: $e');
        }
      },
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
          'SERVICIOS',
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
              onPressed: () {
                setState(() {
                  serviciosFuture = apiServicio.getServicios(widget.token);
                });
              },
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
                child: FutureBuilder<List<Servicio>>(
                  future: serviciosFuture,
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
                              'Cargando servicios...',
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
                    if (snapshot.hasError) {
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
                    final servicios = snapshot.data!;
                    if (servicios.isEmpty) {
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
                                Icons.design_services,
                                size: 60,
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              'No hay servicios disponibles',
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
                      itemCount: servicios.length,
                      itemBuilder: (context, index) {
                        final servicio = servicios[index];
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
                              leading: _buildLeadingImageOrIcon(servicio.imagenUrl),
                              title: Text(
                                servicio.nombreServicio,
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
                                    servicio.descripcion,
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.7),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Precio: \$${servicio.precio.toStringAsFixed(2)} - Duración: ${servicio.tiempo} min',
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
                                      onPressed: () => _showServiceDialog(servicio: servicio),
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
                                      onPressed: () => _deleteServicio(servicio.id),
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
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showServiceDialog(),
        backgroundColor: const Color(0xFFE0115F),
        child: const Icon(Icons.add, color: Colors.white),
        elevation: 4,
      ),
    );
  }

  Widget _buildLeadingImageOrIcon(String? imageUrl) {
    if (imageUrl != null && imageUrl.isNotEmpty) {
      try {
        Uri.parse(imageUrl);
        return Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: const Color(0xFFD4AF37).withOpacity(0.5),
              width: 1,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(7),
            child: Image.network(
              imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                color: Colors.black,
                child: const Icon(
                  Icons.broken_image,
                  size: 30,
                  color: Color(0xFFD4AF37),
                ),
              ),
            ),
          ),
        );
      } catch (e) {
        return Container(
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
            Icons.design_services,
            size: 30,
            color: Color(0xFFD4AF37),
          ),
        );
      }
    }
    return Container(
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
        Icons.design_services,
        size: 30,
        color: Color(0xFFD4AF37),
      ),
    );
  }
}
