const express = require('express');
const app = express();
const path = require('path');

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Establecer la ubicación de las plantillas EJS
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos (como CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página de inicio (index.ejs)
app.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'Rincon Paramo',
  });
});

// Ruta para la página de inicio de sesión (login.ejs)
app.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'Iniciar Sesión',
  });
});

// Ruta para la página de creación de cuentas (creacion.ejs)
app.get('/creacion', (req, res) => {
  res.render('creacion', {
    pageTitle: 'Crear Cuenta',
  });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});