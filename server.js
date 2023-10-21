const express = require('express')
const session = require('express-session')
const path = require('path')
const mysql = require('mysql')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const app = express()
const { createHash } = require('crypto') //Encriptacion
const bodyParser = require('body-parser') //Para poder leer los datos de formularios

let userRole = null //Variable para el rol del usuario

app.use(session({ //Manejo de sesiones
    secret: 'secreto', // Clave secreta para firmar la sesión (debería ser una cadena segura)
    resave: false, // Evita que la sesión se guarde en el almacén en cada solicitud
    saveUninitialized: false, // Evita que se cree una sesión no inicializada en la solicitud
}))

app.use((req, res, next) => {
    if (req.session.usuario) {
        // Si el usuario ha iniciado sesión, obtén su rol desde la sesión
        userName = req.session.usuario.nombre //Asuminedo que la sesion tiene el nombre del usuario logeado
        userRole = req.session.usuario.tipo // Asumiendo que la sesión contiene el rol del usuario
    } else {
        // Si no ha iniciado sesión, establece un valor predeterminado (por ejemplo, "invitado")
        userRole = "invitado"
    }

    // Continúa con la ejecución del siguiente middleware
    next()
})

app.use(bodyParser.urlencoded({ extended: true }));

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
    res.locals.userRole = userRole //Variable local para tomar el rol del usuario
    res.render('index', {
        pageTitle: 'Rincon Paramo',
    })
})

//Ruta pagina conocenos
app.get('/conocenos', (req, res) => {
    res.locals.userRole = userRole; //Variable local para tomar el rol del usuario
    res.render('conocenos', {
        pageTitle: 'Sobre nosotros',
    })
})

//Ruta para perfil
app.get('/perfil', (req, res) => {
    res.locals.userRole = userRole
    if(req.session.usuario) { 
        const user = req.session.usuario//En caso de que se encuentre la sesion, manda al perfil de la persona
        res.render('perfil', {
            pageTitle: 'Mi perfil',
            user: user
            //usuario: req.session.usuario
        })
    } else { //En caso de que no se haya iniciado sesion se redirecciona a la pagina de login
        res.redirect('/login')
    }
})

// Ruta para la página de inicio de sesión (login.ejs)
app.get('/login', (req, res) => {
    res.locals.userRole = userRole; //Variable local para tomar el rol del usuario
    res.render('login', {
        pageTitle: 'Iniciar Sesión',
    })
})

// Ruta de inicio de sesión
app.post('/logear', (req, res) => {
    const correo = req.body.correo
    const contrasenia = req.body.contrasenia

    // Buscar el usuario por correo en la base de datos
    const sql = 'SELECT * FROM users WHERE correo = ?'
    connection.query(sql, [correo], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err)
            res.redirect('/login'); // Manejo de error
        } else if (results.length === 1) {
            const usuario = results[0]
            const hashContrasenia = createHash('sha256').update(contrasenia).digest('hex')

            //console.log("Usuario encontrado:", usuario)
            //console.log("Contraseña proporcionada:",hashContrasenia)
            //console.log("Contraseña encontrada en la base de datos", usuario.contrasenia)
            // Comparar la contraseña proporcionada con la almacenada
            if (hashContrasenia === usuario.contrasenia) {
                // Contraseña válida, crear una sesión para el usuario
                console.log("Se inicio sesion exitosamente!!!")
                req.session.usuario = usuario
                res.redirect('/') // Redirigir a pagina principal del usuario
            } else {
                console.log('Contraseña incorrecta:', contrasenia)
                res.redirect('/login') // Contraseña incorrecta
            }
        } else {
            console.log('Correo electrónico no encontrado:', correo)
            res.redirect('/login') // Correo electrónico no encontrado
        }
    })
})

//Ruta para la destruccion de la sesion actual
app.get("/cerrar", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar la sesión:', err);
        } else {
            // Redirige al usuario a una página de inicio de sesión o a la página principal
            res.redirect('/'); // Cambia '/login' a la ruta que desees
        }
    })
})

// Ruta para la página de creación de cuentas (creacion.ejs)
app.get('/registro', (req, res) => {
    res.locals.userRole = userRole; //Variable local para tomar el rol del usuario
    res.render('creacion', {
        pageTitle: 'Crear Cuenta',
    })
})

//Agregar usuario (registro)
app.post('/registrar', (req, res) => {
    const nombre = req.body.nombre
    const correo = req.body.correo
    const contrasenia = req.body.contrasenia
    const confirmar_contrasenia = req.body.confirmar_contrasenia
    const tipo = "cliente"
    if (!nombre || !correo || !contrasenia || !confirmar_contrasenia || !tipo) { // Validación de datos (puedes agregar más validaciones según tus necesidades)
        console.log("nombre", nombre, "correo", correo, "contrasenia", contrasenia, "confirmar_contrasenia", confirmar_contrasenia, "tipo", tipo)
        return res.status(400).send('Todos los campos son obligatorios.')
    }
    if (contrasenia !== confirmar_contrasenia) {
        return res.status(400).send('Las contraseñas no coinciden.')
    }
    try {  //Prueba de encriptacion
        const hash = createHash('sha256').update(contrasenia).digest('hex')
        const sql = 'INSERT INTO users (nombre, correo, tipo, contrasenia) VALUES (?, ?, ?, ?)'
        connection.query(sql, [nombre, correo, tipo, hash], (err, resultado) => { //Uso de "resultado" en lugar de "res" para evvitar colisiones
            if (err) {
                console.error('Error al registrar usuario:', err)
                return res.status(500).send('Error interno del servidor')
            }
            console.log("Usuario registrado exitosamente!!!")
            return res.redirect("/login") // Redirige al usuario a la página de inicio de sesión después del registro
        })
    } catch(err) {
        console.error('Error al encriptar la contraseña:', err)
        return res.status(500).send('Error interno del servidor')
    }
})

// Ruta para los productos
app.get('/productos', (req, res) => {
    res.locals.userRole = userRole //Variable local para tomar el rol del usuario
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
    res.locals.userRole = userRole //Variable local para tomar el rol del usuario
    if(req.session.usuario && (req.session.usuario.tipo == "editor" || req.session.usuario.tipo == "administrador")) { //Si el usuario ha iniciado sesion y tiene un rango de este tipo
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
    } else { //Si el usuario no ha iniciado sesion o no tiene el rango correspondiente
        res.status(403).send('Acceso denegado')
    }
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
                    console.log("Producto agregado exitosamente!!!")
                    res.redirect('/productos')
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

// Página de detalles del producto
app.get('/productos/:productoId', (req, res) => {
    res.locals.userRole = userRole; //Variable local para tomar el rol del usuario
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
            product
        })
    })
})

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en el puerto 3000!!!')
})
