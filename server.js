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
            console.log('Cerrado de sesion exitoso!!!')
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
app.post('/registro', (req, res) => {
    const nombre = req.body.nombre
    const correo = req.body.correo
    const contrasenia = req.body.contrasenia
    const confirmar_contrasenia = req.body.confirmar_contrasenia
    const tipo = "cliente"
    
    if (!nombre || !correo || !contrasenia || !confirmar_contrasenia || !tipo) { 
        return res.status(400).send('Todos los campos son obligatorios.')
    }

    if (contrasenia.length < 8 || contrasenia !== confirmar_contrasenia) {
        return res.status(400).send('La contraseña debe tener 8 caracteres (minimos) o las contraseñas no coinciden.')
    }

    try {  
        const hash = createHash('sha256').update(contrasenia).digest('hex')
        const sql = 'INSERT INTO users (nombre, correo, tipo, contrasenia) VALUES (?, ?, ?, ?)'
        
        connection.query(sql, [nombre, correo, tipo, hash], (err, resultado) => { 
            if (err) {
                console.error('Error al registrar usuario:', err)
                return res.status(500).send('Error interno del servidor')
            }
            console.log("Usuario registrado exitosamente!!!")
            return res.redirect("/login")
        });
    } catch(err) {
        console.error('Error al encriptar la contraseña:', err)
        return res.status(500).send('Error interno del servidor')
    }
})

//Metodo para modificar el perfil del usuario logeado
app.post('/perfil/modificar', (req, res) => {
    if (req.session.usuario) {
        const nuevoNombre = req.body.nombre // Obtén el nuevo nombre de usuario del formulario
        // Realiza la actualización del nombre de usuario en la base de datos
        const userId = req.session.usuario.id // Reemplaza con la propiedad correcta de tu sesión
        const sql = 'UPDATE users SET nombre = ? WHERE id = ?'
        connection.query(sql, [nuevoNombre, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar el nombre de usuario:', err)
                res.status(500).send('Error interno del servidor')
            } else {
                // Actualización exitosa, redirige al usuario a su perfil con el nuevo nombre
                console.log("Nombre de usuario actualizado exitosamente!!!")
                req.session.usuario.nombre = nuevoNombre // Actualiza el nombre en la sesión
                res.redirect('/perfil')
            }
        })
    } else {
        // El usuario no ha iniciado sesión, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
})

//Ruta para visualizar las direcciones del perfil logeado
app.get('/perfil/direcciones', (req, res) => {
    if (req.session.usuario) {
        res.locals.userRole = userRole
        const userId = req.session.usuario.id
        // Consulta la base de datos para obtener las direcciones del usuario con el ID proporcionado
        const sql = 'SELECT * FROM direcciones WHERE id_usuario = ?'
        connection.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Error al recuperar las direcciones del usuario:', err)
                res.status(500).send('Error interno del servidor')
                return
            }

            res.render('direcciones', {
                pageTitle: 'Direcciones',
                direcciones: results,
            })
        })
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no ha iniciado sesión
    }
})

// Ruta para mostrar el formulario de agregar dirección
app.get('/perfil/direcciones/agregar', (req, res) => {
    if (req.session.usuario) {
        res.render('agregarDireccion', {
            pageTitle: 'Agregar Dirección',
            userRole: req.session.usuario.tipo,
        })
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no ha iniciado sesión
    }
})

// Ruta para procesar la adición de una dirección
app.post('/perfil/direcciones/agregar', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const { calle, numero_exterior, ciudad, cp, colonia } = req.body

        // Inserta la nueva dirección en la base de datos
        const sql = 'INSERT INTO direcciones (id_usuario, calle, numero_exterior, ciudad, cp, colonia) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [userId, calle, numero_exterior, ciudad, cp, colonia], (err, result) => {
            if (err) {
                console.error('Error al agregar dirección:', err)
                res.status(500).send('Error interno del servidor')
                return
            }

            // Redirige al usuario de regreso a la página de direcciones después de agregar la dirección
            res.redirect('/perfil/direcciones')
        })
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no ha iniciado sesión
    }
})

// Ruta para modificar una dirección existente
app.get('/perfil/direcciones/modificar/:userID/:direccionId', (req, res) => {
    // Mostrar formulario de modificación
    res.locals.userRole = userRole
    const direccionId = req.params.direccionId

    // Consulta a la base de datos para obtener la dirección con el ID proporcionado
    const sql = 'SELECT * FROM direcciones WHERE id = ?'
    connection.query(sql, [direccionId], (err, direccion) => {
        if (err) {
            console.error('Error al obtener dirección:', err)
            res.status(500).send('Error interno del servidor')
        } else {
            res.render('modificarDireccion', {
                pageTitle: 'Modificar Dirección',
                direccion: direccion[0],
            })
        }
    })
})

//Ruta para modificar la direccion
app.post('/perfil/direcciones/modificar/:userID/:direccionId', (req, res) => {
    // Manejar la modificación de la dirección y actualizar la base de datos
    const direccionId = req.params.direccionId
    const nuevaCalle = req.body.calle
    const nuevoNumeroExterior = req.body.numero_exterior
    const nuevaColonia = req.body.colonia
    const nuevaCiudad = req.body.ciudad
    const nuevoCP = req.body.cp

    // Realizar una consulta SQL para actualizar los datos en la base de datos
    const sql = 'UPDATE direcciones SET calle = ?, numero_exterior = ?, colonia = ?, ciudad = ?, cp = ? WHERE id = ?'
    connection.query(sql, [nuevaCalle, nuevoNumeroExterior, nuevaColonia, nuevaCiudad, nuevoCP, direccionId], (err, result) => {
        if (err) {
            console.error('Error al actualizar dirección:', err)
            res.status(500).send('Error interno del servidor')
        } else {
            res.redirect('/perfil/direcciones')
        }
    })
})

//Ruta para eliminar la direccion seleccionada
app.post('/perfil/direcciones/eliminar', (req, res) => {
    // Obtén el ID de la dirección a eliminar desde el formulario
    const direccionId = req.body.direccionId

    // Realiza una consulta SQL para eliminar la dirección con el ID proporcionado
    const sql = 'DELETE FROM direcciones WHERE id = ?'
    connection.query(sql, [direccionId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la dirección:', err)
            res.status(500).send('Error interno del servidor')
        } else {
            // Redirige al usuario de vuelta a la página de direcciones después de eliminar
            res.redirect('/perfil/direcciones')
        }
    })
})

//Ruta para modificar contraseña render
app.get('/perfil/modificar/contrasenia', (req, res) => {
    if (req.session.usuario) { // Asegúrate de que el usuario esté autenticado
        res.locals.userRole = userRole
        const user = req.session.usuario
        res.render('modificarContrasenia', {
            pageTitle: 'Cambiar Contraseña',
            user: user,
            userRole: userRole
        })
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no está autenticado
    }
})

// Ruta POST para procesar la modificación segura de la contraseña
app.post('/perfil/modificar/contrasenia', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const newPassword = req.body.password
        const confirmPassword = req.body.confirmPassword

        // Validación de las contraseñas
        if (!newPassword || newPassword.length < 8) {
            console.log('No se realizo el cambio de contraseña...')
            user = req.session.usuario
            userRole = req.session.usuario.tipo
            return res.render('modificarContrasenia', {
                pageTitle: 'La nueva contraseña debe tener al menos 8 caracteres.',
                userRole: userRole
            })
        }

        if (newPassword !== confirmPassword) {
            return res.render('modificarContrasenia', {
                pageTitle: 'Modificar Contraseña',
                user: req.session.usuario,
                error: 'Las contraseñas no coinciden.'
            })
        }
        // Genera un hash de la nueva contraseña con SHA-256
        const hash = createHash('sha256').update(newPassword).digest('hex')
        // Actualiza la contraseña (hash) en la base de datos
        const sql = 'UPDATE users SET contrasenia = ? WHERE id = ?'
        connection.query(sql, [hash, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err)
                res.status(500).send('Error interno del servidor')
            } else {
                console.log("Contraseña actualizada exitosamente!!!")
                res.redirect('/perfil')
            }
        })
    } else {
        res.redirect('/login')
    }
})

// Ruta para mostrar la página de compras
app.get('/perfil/compras', (req, res) => {
    if (req.session.usuario) {
        //const userRole = req.session.usuario.tipo
        res.locals.userRole = userRole
        const userId = req.session.usuario.id
        // Realiza una consulta para obtener las compras del usuario
        const sql = 'SELECT * FROM compras WHERE id_usuario = ?'
        connection.query(sql, [userId], (err, compras) => {
            if (err) {
                console.error('Error al obtener compras:', err)
                return res.status(500).send('Error interno del servidor')
            }

            res.render('compras', {
                pageTitle: 'Compras Realizadas',
                compras: compras,
            })
        })
    } else {
        res.redirect('/login')
    }
})

// Ruta POST para mostrar los productos comprados de una compra específica
app.post('/perfil/compras/mostrarProductos', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const compraId = req.body.compraId

        // Realiza una consulta para obtener los productos comprados en la compra especificada
        const sql = 'SELECT p.nombre, pc.cantidad_comprada FROM productos_compras pc JOIN productos p ON pc.id_producto = p.id WHERE pc.id_compra = ?'
        connection.query(sql, [compraId], (err, productosComprados) => {
            if (err) {
                console.error('Error al obtener productos comprados:', err)
                return res.status(500).send('Error interno del servidor')
            }

            res.json({ productos: productosComprados })
        });
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

// Ruta GET para mostrar el carrito de compras
app.get('/carrito', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id;

        // Realiza una consulta para obtener los productos en el carrito del usuario
        const sql = `
        SELECT p.id, p.nombre, p.descripcion, p.precio, pc.cantidad_comprada
        FROM productos_compras pc
        JOIN productos p ON pc.id_producto = p.id
        WHERE pc.id_usuario = ?;`

        connection.query(sql, [userId], (err, productosEnCarrito) => {
            if (err) {
                console.error('Error al obtener productos en el carrito:', err);
                return res.status(500).send('Error interno del servidor');
            }

            // Renderiza la página del carrito y pasa los productos al template
            res.render('carrito', {
                productos: productosEnCarrito
            });
        });
    } else {
        res.status(403).send('Acceso no autorizado');
    }
});

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
