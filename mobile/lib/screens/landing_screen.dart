import 'package:flutter/material.dart';

class LandingScreen extends StatelessWidget {
  final String token;

  const LandingScreen({Key? key, required this.token}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF4CAF50), Color(0xFF2196F3)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              AppBar(
                title: const Text(
                  'Bienvenido',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24),
                ),
                centerTitle: true,
                backgroundColor: Colors.transparent,
                elevation: 0,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.logout, color: Colors.white),
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/');
                    },
                    tooltip: 'Cerrar sesión',
                  ),
                ],
              ),
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.dashboard,
                        size: 100,
                        color: Colors.white,
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        '¡Bienvenido a la aplicación!',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const Text(
                        'Esta Aplicación Fue creada Por:',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const Text(
                        'Sebastian Alvarez Restrepo',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white70,
                        ),
                      ),
                      const Text(
                        'Derechos Reservados',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white70,
                        ),
                      ),
                      
                      const SizedBox(height: 10),
                      const Text(
                        'Selecciona una opción para comenzar',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    _buildNavButton(
                      context,
                      icon: Icons.design_services,
                      label: 'Tipos de Servicio',
                      onPressed: () {
                        Navigator.pushNamed(context, '/tipoServicios', arguments: token);
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildNavButton(
                      context,
                      icon: Icons.home_repair_service,
                      label: 'Servicios',
                      onPressed: () {
                        Navigator.pushNamed(context, '/servicios', arguments: token);
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildNavButton(
                      context,
                      icon: Icons.people,
                      label: 'Usuarios',
                      onPressed: () {
                        Navigator.pushNamed(context, '/usuarios', arguments: token);
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavButton(BuildContext context,
      {required IconData icon, required String label, required VoidCallback onPressed}) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 24),
      label: Text(
        label,
        style: const TextStyle(fontSize: 16),
      ),
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: Colors.white.withOpacity(0.2),
        padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30),
        ),
        minimumSize: const Size(double.infinity, 60),
      ),
    );
  }
}

