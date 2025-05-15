import 'package:flutter/material.dart';
import 'package:mobile/models/tipo_servicio.dart';
import 'package:mobile/services/api_tipo_servicio.dart';
import 'package:awesome_dialog/awesome_dialog.dart';

class TipoServicios extends StatefulWidget {
  final String token;
  const TipoServicios({Key? key, required this.token}) : super(key: key);

  @override
  State<TipoServicios> createState() => _TipoServiciosState();
}

class _TipoServiciosState extends State<TipoServicios> {
  final ApiTipoServicio apiTipoServicio = ApiTipoServicio();
  final TextEditingController _nombreTsController = TextEditingController();
  bool _selectedEstado = true;

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

  void _showServiceModal({required String title, required VoidCallback onConfirm, String? initialNombre, bool? initialEstado}) {
    _nombreTsController.text = initialNombre ?? '';
    _selectedEstado = initialEstado ?? true;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nombreTsController,
                decoration: InputDecoration(
                  labelText: 'Tipo Servicio',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Colors.blue, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<bool>(
                value: _selectedEstado,
                items: const [
                  DropdownMenuItem(value: true, child: Text('Activo')),
                  DropdownMenuItem(value: false, child: Text('Inactivo')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedEstado = value!;
                  });
                },
                decoration: InputDecoration(
                  labelText: 'Estado',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Colors.blue, width: 2),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar', style: TextStyle(color: Colors.red)),
            ),
            ElevatedButton.icon(
              onPressed: () {
                onConfirm();
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.save),
              label: const Text('Guardar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final String token = ModalRoute.of(context)!.settings.arguments as String;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tipos de Servicios',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: Colors.blue,
        actions: [
          IconButton(
            onPressed: () => _navigateToServicios(token),
            icon: const Icon(Icons.list),
            tooltip: 'Ir a Servicios',
          ),
        ],
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
              child: FutureBuilder<List<TipoServicio>>(
                future: apiTipoServicio.getTipoServicios(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Text(
                        "Error: ${snapshot.error}",
                        style: const TextStyle(color: Colors.red, fontSize: 16),
                      ),
                    );
                  }
                  final tipoServicios = snapshot.data!;
                  if (tipoServicios.isEmpty) {
                    return const Center(
                      child: Text(
                        'No hay tipos de servicios disponibles.',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                      ),
                    );
                  }
                  return ListView.builder(
                    itemCount: tipoServicios.length,
                    itemBuilder: (context, index) {
                      final tipoServicio = tipoServicios[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                        elevation: 5,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.blue,
                            child: Icon(
                              Icons.category,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(
                            tipoServicio.nombreTs,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          subtitle: Text(
                            'Estado: ${tipoServicio.estado ? "Activo" : "Inactivo"}',
                            style: TextStyle(
                              color: tipoServicio.estado ? Colors.green : Colors.red,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
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
                                icon: const Icon(Icons.edit, color: Colors.blue),
                                tooltip: 'Editar',
                              ),
                              IconButton(
                                onPressed: () => _deleteTipoServicio(tipoServicio.id),
                                icon: const Icon(Icons.delete_outline, color: Colors.red),
                                tooltip: 'Eliminar',
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
        onPressed: () {
          _showServiceModal(
            title: 'Registrar Tipo Servicio',
            onConfirm: () {
              _registerTipoServicio(_nombreTsController.text, _selectedEstado);
            },
          );
        },
        child: const Icon(Icons.add),
        tooltip: 'Añadir Tipo Servicio',
        backgroundColor: Colors.blue,
      ),
    );
  }
}
