import 'package:flutter/material.dart';
import 'package:mobile/screens/landing_screen.dart';
import 'package:mobile/screens/list_usuarios_screen.dart';
import 'package:mobile/screens/login_screen.dart';  
import 'package:mobile/screens/list_services_screen.dart';
import 'package:mobile/screens/list_tipo_servicios_screen.dart';
import 'package:mobile/screens/list_ventas.dart';

void main() {
  runApp(const Principal());
}

class Principal extends StatelessWidget {
  const Principal({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Gestión de Tipo de Servicios',
      theme: ThemeData(primarySwatch: Colors.blue),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/landing': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as String;
          return LandingScreen(token: args);  // Redirige a tu pantalla de bienvenida
        },
        '/tipoServicios': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as String;
          return TipoServicios(token: args);
        },
        '/servicios': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as String;
          return ListServicesScreen(token: args);
        },
        '/usuarios': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as String;
          return ListUsuariosScreen(token: args);  // Redirige correctamente a la lista de usuarios
        },
        '/ventas': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as String;
          return ListVentasScreen(token: args);  // Nueva ruta para la lista de ventas
        },
      },
    );
  }
}