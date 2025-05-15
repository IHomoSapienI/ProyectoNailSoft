import 'package:flutter/material.dart';
import 'package:mobile/models/servicio.dart';
import 'package:mobile/models/tipo_servicio.dart';
import 'package:mobile/services/api_servicio.dart';
import 'package:awesome_dialog/awesome_dialog.dart';

class ListServicesScreen extends StatefulWidget {
  final String token;
  const ListServicesScreen({required this.token, super.key});

  @override
  State<ListServicesScreen> createState() => _ListServicesScreenState();
}

class _ListServicesScreenState extends State<ListServicesScreen> {
  final ApiServicio apiServicio = ApiServicio();
  late Future<List<Servicio>> serviciosFuture;

  @override
  void initState() {
    super.initState();
    serviciosFuture = apiServicio.getServicios(widget.token);
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
          title: Text(
            servicio == null ? 'Agregar Servicio' : 'Editar Servicio',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,children: [
                _buildTextField(nombreController, 'Nombre del Servicio', Icons.work),
                const SizedBox(height: 10),
                _buildTextField(descripcionController, 'Descripción', Icons.description),
                const SizedBox(height: 10),
                _buildTextField(precioController, 'Precio', Icons.attach_money, keyboardType: TextInputType.number),
                const SizedBox(height: 10),
                _buildTextField(tiempoController, 'Tiempo (min)', Icons.timer, keyboardType: TextInputType.number),
                const SizedBox(height: 10),
                _buildTextField(imagenController, 'URL de la Imagen', Icons.image),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar', style: TextStyle(color: Colors.red)),
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
                  ).show();
                } catch (e) {
                  _showErrorDialog('Error: $e');
                }
              },
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
          ).show();
          _refreshServicios();
        } catch (e) {
          _showErrorDialog('Error al eliminar: $e');
        }
      },
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


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Servicios', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.blue,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.blue.shade50, Colors.white],
          ),
        ),
        child: FutureBuilder<List<Servicio>>(
          future: serviciosFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(
                child: Text('Error: ${snapshot.error}',
                    style: const TextStyle(color: Colors.red)),
              );
            }
            final servicios = snapshot.data!;
            if (servicios.isEmpty) {
              return const Center(
                child: Text('No hay servicios disponibles.', style: TextStyle(fontSize: 18)),
              );
            }
            return ListView.builder(
              itemCount: servicios.length,
              itemBuilder: (context, index) {
                final servicio = servicios[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  elevation: 5,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  child: ListTile(
                    leading: _buildLeadingImageOrIcon(servicio.imagenUrl),
                    title: Text(servicio.nombreServicio,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(servicio.descripcion),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () => _showServiceDialog(servicio: servicio),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _deleteServicio(servicio.id),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showServiceDialog(),
        child: const Icon(Icons.add),
        backgroundColor: Colors.blue,
        tooltip: 'Agregar Servicio',
      ),
    );
  }

  Widget _buildLeadingImageOrIcon(String? imageUrl) {
    if (imageUrl != null && imageUrl.isNotEmpty) {
      try {
        Uri.parse(imageUrl);
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            imageUrl,
            width: 50,
            height: 50,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => const Icon(
              Icons.broken_image,
              size: 50,
              color: Colors.grey,
            ),
          ),
        );
      } catch (e) {
        return const Icon(Icons.broken_image, size: 50, color: Colors.grey);
      }
    }
    return const Icon(Icons.design_services, size: 50, color: Colors.blue);
  }
}

