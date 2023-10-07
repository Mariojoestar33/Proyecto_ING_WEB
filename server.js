/*const express = require('express')
const app = express()
const path = require('path')
const mysql = require('mysql')
const multer = require('multer')
const sharp = require('sharp') 
const fs = require('fs');

const uploadDirectory = 'public/images' //Directorio donde las imagenes son guardadas

//Configuracion de multer para carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname); // Puedes ajustar el nombre del archivo según tus preferencias
  },
});

const upload = multer({ storage });

// Configurar una ruta para manejar la carga de imágenes
app.post('/productos/agregar', upload.single('imagen'), (req, res, next) => {
  // Obtener la ruta del archivo cargado
  const imagePath = req.file.path;
  // Redimensionar la imagen a 1200x1200 px con sharp
  sharp(imagePath)
      .resize(1200, 1200)
      .toFile(`${imagePath}-resized`, (err, info) => {
          if (err) {
              console.error('Error al redimensionar la imagen:', err)
              res.status(500).send('Error al procesar la imagen')
              return;
          }
          // Eliminar la imagen original
          fs.unlinkSync(imagePath);
          // Renombrar la imagen redimensionada al nombre deseado
          fs.renameSync(`${imagePath}-resized`, imagePath);
          // Ahora puedes utilizar 'imagePath' para guardar la dirección de la imagen en la base de datos
          // Inserta 'imagePath' en la base de datos y realiza otras operaciones necesarias
      })
})

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
app.use(express.static(path.join(__dirname, '/public')))

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
app.get('/registro', (req, res) => {
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

//CRUD de productos
app.post('/productos/nuevo', (req, res) => {
  const { nombre, precio, stock, categoria, nueva_categoria, marca, nueva_marca } = req.body

  // Inserta el producto en la base de datos
  const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca], (err, result) => {
      if (err) {
          console.error('Error al agregar el producto:', err)
          res.status(500).send('Error interno del servidor')
          return;
      }
      res.redirect('/productos')
  })
})

//
app.get('/productos/agregar', (req, res) => {
  // Recupera las categorías existentes desde la base de datos
  const sqlCategorias = 'SELECT DISTINCT categoria FROM productos'
  connection.query(sqlCategorias, (err, categorias) => {
      if (err) {
          console.error('Error al recuperar categorías:', err)
          res.status(500).send('Error interno del servidor')
          return
      }
      // Recupera las marcas existentes desde la base de datos
      const sqlMarcas = 'SELECT DISTINCT marca FROM productos';
      connection.query(sqlMarcas, (err, marcas) => {
          if (err) {
              console.error('Error al recuperar marcas:', err)
              res.status(500).send('Error interno del servidor')
              return
          }
          // Renderiza el formulario de agregar producto con las categorías y marcas existentes
          res.render('aproducts', {
              pageTitle: 'Agregar Producto',
              categorias: categorias,
              marcas: marcas,
          })
      })
  })
})



// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000!!!')
})
*/

const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

//Base de datos configuración y acceso
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rincon'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos MySQL establecida...');
});

module.exports = connection;
//Fin de bd

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Establecer la ubicación de las plantillas EJS
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos (como CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar multer para manejar la carga de archivos
const uploadDirectory = 'public/images';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Puedes ajustar el nombre del archivo según tus preferencias
    },
});

const upload = multer({ storage });

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

// Ruta para los productos
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al recuperar los productos:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.render('productos', {
            pageTitle: 'Productos',
            products: results,
        });
    });
});

// Ruta para agregar productos (GET)
app.get('/productos/agregar', (req, res) => {
    // Recupera las categorías existentes desde la base de datos
    const sqlCategorias = 'SELECT DISTINCT categoria FROM productos';
    connection.query(sqlCategorias, (err, categorias) => {
        if (err) {
            console.error('Error al recuperar categorías:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Recupera las marcas existentes desde la base de datos
        const sqlMarcas = 'SELECT DISTINCT marca FROM productos';
        connection.query(sqlMarcas, (err, marcas) => {
            if (err) {
                console.error('Error al recuperar marcas:', err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            // Renderiza el formulario de agregar producto con las categorías y marcas existentes
            res.render('aproducts', {
                pageTitle: 'Agregar Producto',
                categorias: categorias,
                marcas: marcas,
            });
        });
    });
});

// Ruta para agregar productos (POST)
app.post('/productos/agregar', upload.single('imagen'), (req, res) => {
    const { nombre, precio, stock, categoria, nueva_categoria, marca, nueva_marca, descripcion } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Redimensionar la imagen a 1200x1200 px con sharp
    if (imagePath) {
        sharp(imagePath)
            .resize(1200, 1200)
            .toFile(`${imagePath}-resized`, (err, info) => {
                if (err) {
                    console.error('Error al redimensionar la imagen:', err);
                    res.status(500).send('Error al procesar la imagen');
                    return;
                }

                // Eliminar la imagen original si existe
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                // Renombrar la imagen redimensionada al nombre deseado
                fs.renameSync(`${imagePath}-resized`, imagePath);

                // Guarda la dirección de la imagen en la base de datos (como imagePath)
                const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
                connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca, descripcion, imagePath], (err, result) => {
                    if (err) {
                        console.error('Error al agregar el producto:', err);
                        res.status(500).send('Error interno del servidor');
                        return;
                    }
                    res.redirect('/productos');
                });
            });
    } else {
        // Si no se cargó una imagen, guarda la dirección de la imagen como nula en la base de datos
        const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, NULL)';
        connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca, descripcion], (err, result) => {
            if (err) {
                console.error('Error al agregar el producto:', err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            res.redirect('/productos');
        });
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en el puerto 3000!!!');
});
