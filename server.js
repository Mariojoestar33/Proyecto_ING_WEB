const express = require('express')
const session = require('express-session')
const path = require('path')
const mysql = require('mysql')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const app = express()

// Base de datos configuración y acceso
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rincon'
}

const connection = mysql.createConnection(dbConfig)

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err)
        return
    }
    console.log('Conexión a la base de datos MySQL establecida...')
})

module.exports = connection
// Fin de bd

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs')

// Establecer la ubicación de las plantillas EJS
app.set('views', path.join(__dirname, 'views'))

// Middleware para servir archivos estáticos (como CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')))

// Configurar multer para manejar la carga de archivos
const uploadDirectory = 'public/images'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) // Usa el nombre original del archivo
    },
})

const upload = multer({ storage })

// Ruta para la página de inicio (index.ejs)
app.get('/', (req, res) => {
    res.render('index', {
        pageTitle: 'Rincon Paramo',
    })
})

//Ruta pagina conocenos
app.get('/conocenos', (req, res) => {
    res.render('conocenos', {
        pageTitle: 'Sobre nosotros',
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

// Ruta para los productos
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos'
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

// Ruta para agregar productos (GET)
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
        const sqlMarcas = 'SELECT DISTINCT marca FROM productos'
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

// Ruta para agregar productos (POST)
app.post('/productos/agregar', upload.single('imagen'), (req, res) => {
    const { nombre, precio, stock, categoria, nueva_categoria, marca, nueva_marca, descripcion } = req.body
    const imagePath = req.file ? req.file.path : null

    // Redimensionar la imagen a 1200x1200 px con sharp
    if (imagePath) {
        sharp(imagePath)
            .resize(1200, 1200)
            .toFile(`${imagePath}-resized`, (err, info) => {
                if (err) {
                    console.error('Error al redimensionar la imagen:', err)
                    res.status(500).send('Error al procesar la imagen')
                    return;
                }

                // Elimina la imagen original si existe
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                // Construye la nueva ruta de la imagen basada en la categoría y el nombre del producto
                const categoriaProducto = categoria || nueva_categoria;
                const nombreProducto = nombre.toLowerCase().replace(/\s+/g, '-'); // Convierte espacios en guiones
                const nuevaRutaImagen = `public/images/${categoriaProducto}/${nombreProducto}.jpg`

                // Renombra y mueve la imagen redimensionada al nuevo directorio
                fs.renameSync(`${imagePath}-resized`, nuevaRutaImagen)

                // Modifica la ruta para que sea relativa
                const rutaRelativaImagen = nuevaRutaImagen.replace(/^public\//, '')

                // Guarda la dirección de la imagen en la base de datos (como rutaRelativaImagen)
                const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)'
                connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca, descripcion, rutaRelativaImagen], (err, result) => {
                    if (err) {
                        console.error('Error al agregar el producto:', err)
                        res.status(500).send('Error interno del servidor')
                        return;
                    }
                    //res.redirect('/productos');
                    res.redirect('/productos?registroExitoso=true')
                })
            })
    } else {
        // Si no se cargó una imagen, guarda la dirección de la imagen como nula en la base de datos
        const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, NULL)'
        connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca, descripcion], (err, result) => {
            if (err) {
                console.error('Error al agregar el producto:', err)
                res.status(500).send('Error interno del servidor')
                return
            }
            res.redirect('/productos?registroExitoso=true')
        })
    }
})

//Paginas individuales de productos
// Página de detalles del producto
app.get('/productos/:productoId', (req, res) => {
    const productoId = req.params.productoId
    // Consulta la base de datos para obtener la información del producto con el ID proporcionado
    connection.query('SELECT * FROM productos WHERE id = ?', [productoId], (err, results) => {
        if (err) {
            console.error('Error al recuperar los detalles del producto:', err)
            res.status(500).send('Error interno del servidor')
            return
        }
        if (results.length === 0) {
            res.status(404).send('Producto no encontrado')
            return
        }
        const product = results[0]
        res.render('producto', {
            pageTitle: product.nombre,
            product,
            user: req.user, // Pasa la información del usuario a la plantilla
        })
    })
})

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en el puerto 3000!!!')
})
