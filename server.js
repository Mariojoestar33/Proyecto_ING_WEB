const express = require('express')
const app = express()
const path = require('path')
const mysql = require('mysql')

//Base de datos configuracion y acceso

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rincon'
}

const connection = mysql.createConnection(dbConfig)

connection.connect((err) => { //Funcion de coneccion a la base de datos
  if (err) {
    console.error('Error de conexión a la base de datos:', err)
    return
  }
  console.log('Conexión a la base de datos MySQL establecida...')
})

module.exports = connection
//Fin de bd

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs')

// Establecer la ubicación de las plantillas EJS
app.set('views', path.join(__dirname, 'views'))

// Middleware para servir archivos estáticos (como CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')))

// Ruta para la página de inicio (index.ejs)
app.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'Rincon Paramo',
  })
})

// Ruta para la página de inicio de sesión (login.ejs)
app.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'Iniciar Sesión',
  })
})

// Ruta para la página de creación de cuentas (creacion.ejs)
app.get('/creacion', (req, res) => {
  res.render('creacion', {
    pageTitle: 'Crear Cuenta',
  })
})

//Ruta para los productos
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al recuperar los productos:', err)
      res.status(500).send('Error interno del servidor')
      return
    }
    res.render('productos', {
      pageTitle: 'Productos',
      products: results, 
    })
  })
})

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000!!!')
})