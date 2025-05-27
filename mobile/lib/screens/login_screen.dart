import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/services.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
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
      statusBarIconBrightness: Brightness.dark,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> login() async {
    setState(() {
      _isLoading = true;
    });

    const String url = 'https://gitbf.onrender.com/api/auth/login';
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': _emailController.text,
          'password': _passwordController.text,
        }),
      );

      setState(() {
        _isLoading = false;
      });

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final token = data['token'];
        print('Token: $token');
        AwesomeDialog(
          context: context,
          dialogType: DialogType.success,
          animType: AnimType.bottomSlide,
          title: 'Éxito',
          titleTextStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 22,
            color: Color(0xFF1A1A1A),
          ),
          desc: 'Inicio de sesión exitoso',
          descTextStyle: const TextStyle(fontSize: 16),
          btnOkColor: const Color(0xFFE0115F),
          btnOkOnPress: () {
            Navigator.pushReplacementNamed(context, '/landing', arguments: token);
          },
        ).show();
      } else {
        _showErrorDialog('Error de inicio de sesión', 'Credenciales inválidas');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showErrorDialog('Error de conexión', 'No se pudo conectar al servidor');
    }
  }

  void _showErrorDialog(String title, String message) {
    AwesomeDialog(
      context: context,
      dialogType: DialogType.error,
      animType: AnimType.bottomSlide,
      title: title,
      titleTextStyle: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 22,
        color: Color(0xFF1A1A1A),
      ),
      desc: message,
      descTextStyle: const TextStyle(fontSize: 16),
      btnOkOnPress: () {},
      btnOkColor: const Color(0xFFE0115F),
    ).show();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          color: Colors.black,
        ),
        child: SafeArea(
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
              
              // Main content
              FadeTransition(
                opacity: _fadeAnimation,
                child: Center(
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Logo with gold border
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFFD4AF37), // Gold
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFD4AF37).withOpacity(0.3),
                                  blurRadius: 20,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: CircleAvatar(
                              radius: 60,
                              backgroundColor: Colors.white,
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Image.asset(
                                  'images/logo1.png',
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Elegant title
                          const Text(
                            "BIENVENIDA ESTEFANIA",
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                              color: Colors.white,
                            ),
                          ),
                          
                          const SizedBox(height: 8),
                          
                          // Subtitle with gold color
                          const Text(
                            "Inicia sesión para continuar",
                            style: TextStyle(
                              fontSize: 16,
                              color: Color(0xFFD4AF37), // Gold
                              letterSpacing: 1,
                            ),
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Email field with custom design
                          Theme(
                            data: Theme.of(context).copyWith(
                              inputDecorationTheme: InputDecorationTheme(
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.08),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 20,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(30),
                                  borderSide: BorderSide.none,
                                ),
                                hintStyle: const TextStyle(color: Colors.white70),
                                prefixIconColor: const Color(0xFFD4AF37), // Gold
                              ),
                            ),
                            child: TextFormField(
                              controller: _emailController,
                              style: const TextStyle(color: Colors.white),
                              decoration: const InputDecoration(
                                hintText: 'Correo electrónico',
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              keyboardType: TextInputType.emailAddress,
                            ),
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Password field with custom design
                          Theme(
                            data: Theme.of(context).copyWith(
                              inputDecorationTheme: InputDecorationTheme(
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.08),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 20,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(30),
                                  borderSide: BorderSide.none,
                                ),
                                hintStyle: const TextStyle(color: Colors.white70),
                                prefixIconColor: const Color(0xFFD4AF37), // Gold
                                suffixIconColor: Colors.white70,
                              ),
                            ),
                            child: TextFormField(
                              controller: _passwordController,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Contraseña',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                              ),
                              obscureText: _obscurePassword,
                            ),
                          ),
                          
                          const SizedBox(height: 12),
                          
                          // Forgot password with gold color
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () {
                                // Implementar lógica para recuperar contraseña
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFFD4AF37), // Gold
                              ),
                              child: const Text(
                                '¿Olvidaste tu contraseña?',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 30),
                          
                          // Luxury login button with gradient
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : login,
                              style: ElevatedButton.styleFrom(
                                foregroundColor: Colors.white,
                                backgroundColor: const Color(0xFFE0115F), // Hot pink
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                elevation: 8,
                                shadowColor: const Color(0xFFE0115F).withOpacity(0.5),
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Text(
                                      'INICIAR SESIÓN',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1.5,
                                      ),
                                    ),
                            ),
                          ),
                          
                          const SizedBox(height: 50),
                          
                          // Elegant footer with gold accent
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                height: 1,
                                width: 60,
                                color: const Color(0xFFD4AF37).withOpacity(0.5), // Gold
                              ),
                              const SizedBox(width: 10),
                              const Text(
                                '© 2024 Sebastián Álvarez',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Container(
                                height: 1,
                                width: 60,
                                color: const Color(0xFFD4AF37).withOpacity(0.5), // Gold
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
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
            ],
          ),
        ),
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
}
