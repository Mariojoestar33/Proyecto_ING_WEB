const express = require('express')
const session = require('express-session')
const path = require('path')
const mysql = require('mysql')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const crypto = require('crypto') //Encriptacion
const { createHash } = require('crypto') //Encriptacion
const bodyParser = require('body-parser') //Para poder leer los datos de formularios
const paypal = require('paypal-rest-sdk') //Paypal

let i = 1

const app = express()

require("dotenv").config() //Se añade el archivo de configuracion de datos para privacidad

paypal.configure({
    'mode': process.env.MODE_PAYPAL,
    'client_id': process.env.CLIENT_ID_PAYPAL,
    'client_secret': process.env.CLIENT_SECRET_PAYPAL,
})

let userRole = null //Variable para el rol del usuario

app.set('trust proxy', 1)

app.use(session( { //Manejo de sesiones
    secret: process.env.SECRET_SESSION, // Clave secreta para firmar la sesión.
    resave: false, // Evita que la sesión se guarde en el almacén en cada solicitud.
    saveUninitialized: false, // Evita que se cree una sesión no inicializada en la solicitud.
}))

app.use((req, res, next) => {
    if (req.session.usuario) {
        userName = req.session.usuario.nombre
        userRole = req.session.usuario.tipo
    } else {  // Si no ha iniciado sesión se establece un predeterminado
        userRole = "invitado"
    }
    next() // Continúa con la ejecución del siguiente middleware
})

app.use(bodyParser.urlencoded({ extended: true }))

const dbConfig = { // Base de datos configuración y acceso
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}

const connection = mysql.createConnection(dbConfig)

connection.connect((err) => { //Se intenta la conexion a la base de datos
    if (err) {
        console.error('Error de conexión a la base de datos:', err)
        return
    }
    console.log('Conexión a la base de datos MySQL establecida...')
})

module.exports = connection

app.set('view engine', 'ejs')// Configurar EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views'))// Establecer la ubicación de las plantillas EJS
app.use(express.static(path.join(__dirname, 'public'))) // Middleware para servir archivos estáticos (como CSS, imágenes, etc.)
const uploadDirectory = 'public/images'// Configurar multer para manejar la carga de archivos

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    // Verifica que la extensión del archivo sea jpg o png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no admitido. Solo se permiten archivos jpg o png.'), false);
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter})

// Ruta para la página de inicio (index.ejs)
app.get('/', (req, res) => {
    res.locals.userRole = userRole
    res.render('index', {
        pageTitle: 'Rincon Paramo',
    })
})

//Ruta pagina conocenos
app.get('/conocenos', (req, res) => {
    res.locals.userRole = userRole
    res.render('conocenos', {
        pageTitle: 'Sobre nosotros',
    })
})

// Ruta para la página de inicio de sesión (login.ejs)
app.get('/login', (req, res) => {
    res.locals.userRole = userRole
    res.render('login', {
        pageTitle: 'Iniciar Sesión',
        error: null,
    })
})

// Ruta de inicio de sesión //Agregar token para evitar ataques de fuerza bruta
app.post('/login', (req, res) => {
    const correo = req.body.correo
    const contrasenia = req.body.contrasenia
    res.locals.userRole = userRole
    const sql = 'SELECT * FROM users WHERE correo = ?'
    connection.query(sql, [correo], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err)
            res.redirect('/login')
        } else if (results.length === 1) {
            const usuario = results[0]
            const salt = usuario.salt
            const conPass = contrasenia + salt
            const hashContrasenia = createHash('sha256').update(conPass).digest('hex')
            if (hashContrasenia === usuario.contrasenia) { // Contraseña válida, crear una sesión para el usuario
                console.log("Se inicio sesion exitosamente!!!")
                req.session.usuario = usuario
                res.redirect('/')
            } else {
                console.log('Contraseña incorrecta:', contrasenia)
                res.locals.error = 'Contraseña incorrecta';
                res.render('login', { 
                    pageTitle: 'Contraseña incorrecta',
                    error: 'Contraseña incorrecta',
                    userRole: userRole 
                })
            }
        } else {
            console.log('Correo electrónico no encontrado:', correo);
            res.locals.error = 'Correo electrónico no encontrado';
            res.render('login', { 
                pageTitle: 'Correo no encontrado',
                error: 'Correo no encontrado',
                userRole: userRole,
             })
        }
    })
})

//Ruta para la destruccion de la sesion actual
app.get("/cerrar", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar la sesión:', err);
        } else {
            console.log('Cerrado de sesion exitoso!!!')
            res.redirect('/')
        }
    })
})

// Ruta para la página de creación de cuentas (creacion.ejs)
app.get('/registro', (req, res) => {
    res.locals.userRole = userRole; //Variable local para tomar el rol del usuario
    res.render('creacion', {
        pageTitle: 'Crear Cuenta',
        userRole: userRole,
    })
})

//Agregar usuario (registro) 
app.post('/registro', (req, res) => {
    if(req.session.usuario && (req.session.usuario.tipo == "administrador")) {
        const nombre = req.body.nombre
        const correo = req.body.correo
        const contrasenia = req.body.contrasenia
        const confirmar_contrasenia = req.body.confirmar_contrasenia
        const tipo = req.body.tipo
        if (!nombre || !correo || !contrasenia || !confirmar_contrasenia) { 
            return res.status(400).send('Todos los campos son obligatorios.')
        }
        if (contrasenia.length < 8 || contrasenia !== confirmar_contrasenia) {
            return res.status(400).send('La contraseña debe tener 8 caracteres (minimos) o las contraseñas no coinciden.')
        }
        try {  
            const salt = crypto.randomBytes(16).toString('hex')
            const conPass = contrasenia + salt
            const hash = createHash('sha256').update(conPass).digest('hex')
            const sql = 'INSERT INTO users (nombre, correo, tipo, contrasenia, salt) VALUES (?, ?, ?, ?, ?)'
            
            connection.query(sql, [nombre, correo, tipo, hash, salt], (err, resultado) => { 
                if (err) {
                    console.error('Error al registrar usuario:', err)
                    return res.status(500).send('Error interno del servidor')
                }
                console.log("Usuario registrado exitosamente!!!")
                return res.redirect("/login")
            })
        } catch(err) {
            console.error('Error al encriptar la contraseña:', err)
            return res.status(500).send('Error interno del servidor')
        }
    } else {
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
            const salt = crypto.randomBytes(16).toString('hex')
            const conPass = contrasenia + salt
            const hash = createHash('sha256').update(conPass).digest('hex')
            const sql = 'INSERT INTO users (nombre, correo, tipo, contrasenia, salt) VALUES (?, ?, ?, ?, ?)'
            
            connection.query(sql, [nombre, correo, tipo, hash, salt], (err, resultado) => { 
                if (err) {
                    console.error('Error al registrar usuario:', err)
                    return res.status(500).send('Error interno del servidor')
                }
                console.log("Usuario registrado exitosamente!!!")
                return res.redirect("/login")
            })
        } catch(err) {
            console.error('Error al encriptar la contraseña:', err)
            return res.status(500).send('Error interno del servidor')
        }
    }    
})

//Ruta para perfil
app.get('/perfil', (req, res) => {
    res.locals.userRole = userRole
    if(req.session.usuario) { 
        const user = req.session.usuario //En caso de que se encuentre la sesion, manda al perfil de la persona
        res.render('perfil', {
            pageTitle: `Perfil de ${user.nombre}`,
            user: user
            //usuario: req.session.usuario
        })
    } else { //En caso de que no se haya iniciado sesion se redirecciona a la pagina de login
        res.redirect('/login')
    }
})

//Metodo para modificar el perfil del usuario logeado
app.post('/perfil/modificar', (req, res) => {
    if (req.session.usuario) {
        const nuevoNombre = req.body.nombre
        // Verifica que el nuevoNombre no esté vacío y no contenga números
        if (nuevoNombre && !/\d/.test(nuevoNombre)) {
            const userId = req.session.usuario.id
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
            // El nuevo nombre está vacío o contiene números, muestra un mensaje de error
            res.status(400).send('El nombre no es válido. Asegúrate de que no esté vacío y no contenga números.')
        }
    } else {
        // El usuario no ha iniciado sesión, redirige a la página de inicio de sesión
        res.redirect('/login')
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

        // Validar que ninguno de los campos esté vacío
        if (!calle || !numero_exterior || !ciudad || !cp || !colonia) {
            res.status(400).send('Todos los campos son obligatorios')
            return
        }

        // Inserta la nueva dirección en la base de datos
        const sql = 'INSERT INTO direcciones (id_usuario, calle, numero_exterior, ciudad, cp, colonia) VALUES (?, ?, ?, ?, ?, ?)'
        connection.query(sql, [userId, calle, numero_exterior, ciudad, cp, colonia], (err, result) => {
            if (err) {
                console.error('Error al agregar dirección:', err)
                res.status(500).send('Error interno del servidor')
                return
            }
            // Redirige al usuario de regreso a la página de direcciones después de agregar la dirección
            console.log("Direccion agregada exitosamente!!!")
            res.redirect('/perfil/direcciones')
        })
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no ha iniciado sesión
    }
})

// Ruta para modificar una dirección existente
app.get('/perfil/direcciones/modificar/:userID/:direccionId', (req, res) => {
    if(req.session.usuario) { // Asegurarse que este la sesion iniciada para poder hacer modificaciones dentro
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
    } else {
        res.redirect('/login') // Redirige al usuario a la página de inicio de sesión si no ha iniciado sesión
    }
})

// Ruta para modificar la dirección
app.post('/perfil/direcciones/modificar/:userID/:direccionId', (req, res) => {
    // Manejar la modificación de la dirección y actualizar la base de datos
    const direccionId = req.params.direccionId
    const nuevaCalle = req.body.calle
    const nuevoNumeroExterior = req.body.numero_exterior
    const nuevaColonia = req.body.colonia
    const nuevaCiudad = req.body.ciudad
    const nuevoCP = req.body.cp

    // Validar que ninguno de los campos esté vacío
    if (!nuevaCalle || !nuevoNumeroExterior || !nuevaColonia || !nuevaCiudad || !nuevoCP) {
        res.status(400).send('Todos los campos son obligatorios')
        return
    }

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
    const direccionId = req.body.direccionId
    const sql = 'DELETE FROM direcciones WHERE id = ?'
    connection.query(sql, [direccionId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la dirección:', err)
            res.status(500).send('Error interno del servidor')
        } else {
            console.log("Direccion borrada exitosamente!!!")
            res.redirect('/perfil/direcciones')
        }
    })
})

//Ruta para modificar contraseña render
app.get('/perfil/modificar/contrasenia', (req, res) => {
    if (req.session.usuario) {
        res.locals.userRole = userRole
        const user = req.session.usuario
        res.render('modificarContrasenia', {
            pageTitle: 'Cambiar Contraseña',
            user: user,
            userRole: userRole
        })
    } else {
        res.redirect('/login')
    }
})

// Ruta POST para procesar la modificación segura de la contraseña
app.post('/perfil/modificar/contrasenia', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const newPassword = req.body.password
        const confirmPassword = req.body.confirmPassword
        // Validación de las contraseñas
        if (!newPassword || newPassword.length < 8) { //Primera validacion
            console.log('No se realizo el cambio de contraseña...')
            user = req.session.usuario
            userRole = req.session.usuario.tipo
            return res.render('modificarContrasenia', {
                pageTitle: 'La nueva contraseña debe tener al menos 8 caracteres.',
                userRole: userRole
            })
        }
        if (newPassword !== confirmPassword) { //Segunda validacion
            return res.render('modificarContrasenia', {
                pageTitle: 'Modificar Contraseña',
                user: req.session.usuario,
                error: 'Las contraseñas no coinciden.'
            })
        }
        const salt = crypto.randomBytes(16).toString('hex')
        const conPass = newPassword + salt
        const hash = createHash('sha256').update(conPass).digest('hex')
        const sql = 'UPDATE users SET contrasenia = ?, salt = ? WHERE id = ?'
        connection.query(sql, [hash, salt, userId], (err, result) => {
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
        const userRole = req.session.usuario.tipo
        const userId = req.session.usuario.id
        const sql = `
        SELECT c.id AS compra_id, c.fecha_compra, p.id AS producto_id, p.nombre, p.precio, dc.cantidad_comprada, c.total, c.id_direccion, d.calle, d.cp, d.ciudad, d.colonia, d.numero_exterior
        FROM compras c
        JOIN detalles_compra dc ON c.id = dc.id_compra
        JOIN productos p ON dc.id_producto = p.id
        JOIN direcciones d ON c.id_direccion = d.id
        WHERE c.id_usuario = ?;
        `
        connection.query(sql, [userId], (err, compras) => {
            if (err) {
                console.error('Error al obtener compras:', err)
                return res.status(500).send('Error interno del servidor')
            }
            // Organiza los datos en una estructura
            const comprasConProductos = []
            let compraActual = null
            for (const row of compras) { //Organiza las comrpas registradas del usuario
                if (!compraActual || compraActual.compra_id !== row.compra_id) {
                    compraActual = {
                        compra_id: row.compra_id,
                        fecha_compra: row.fecha_compra,
                        total: row.total,
                        id_direccion: row.id_direccion,
                        calle: row.calle,
                        numero_exterior: row.numero_exterior,
                        cp: row.cp,
                        ciudad: row.ciudad,
                        colonia: row.colonia,
                        productos: [],
                    }
                    comprasConProductos.push(compraActual)
                }
                compraActual.productos.push({
                    producto_id: row.producto_id,
                    nombre: row.nombre,
                    precio: row.precio,
                    cantidad: row.cantidad_comprada,
                })
            }
            res.render('compras', {
                pageTitle: 'Compras Realizadas',
                compras: comprasConProductos,
                userRole: userRole
            })
            //res.json(compras)
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
        const sql = 'SELECT p.nombre, pc.cantidad_comprada FROM productos_compras pc JOIN productos p ON pc.id_producto = p.id WHERE pc.id_compra = ?'
        connection.query(sql, [compraId], (err, productosComprados) => {
            if (err) {
                console.error('Error al obtener productos comprados:', err)
                return res.status(500).send('Error interno del servidor')
            }
            res.json({ productos: productosComprados })
        })
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

// Ruta para mostrar el carrito de compras
app.get('/carrito', (req, res) => {
    if (req.session.usuario) {
        res.locals.userRole = userRole
        const userId = req.session.usuario.id
        const sql = `SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.stock, c.cantidad
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id
        WHERE c.id_usuario = ?;`
        connection.query(sql, [userId], (err, productosEnCarrito) => {
            if (err) {
                console.error('Error al obtener productos en el carrito:', err)
                return res.status(500).send('Error interno del servidor')
            }
            res.render('carrito', {
                pageTitle: 'Carrito de Compras',
                carrito: productosEnCarrito
            })
        })
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

//Ruta para agregar al carrito de compras
app.post('/agregarAlCarrito', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const productId = req.body.productId
        const cantidadSolicitada = parseInt(req.body.cantidad, 10)
        // Obtener el stock disponible del producto
        const obtenerStockQuery = 'SELECT stock FROM productos WHERE id = ?'
        connection.query(obtenerStockQuery, [productId], (stockErr, stockResults) => {
            if (stockErr) {
                console.error('Error al obtener el stock del producto:', stockErr)
                return res.status(500).send('Error interno del servidor')
            }
            if (stockResults.length > 0) {
                const stockDisponible = stockResults[0].stock
                // Verificar si la cantidad solicitada supera el stock disponible
                if (cantidadSolicitada > stockDisponible) {
                    return res.status(400).send('La cantidad solicitada supera el stock disponible')
                }
                // Verificar si el producto ya está en el carrito del usuario
                const checkIfExistsQuery = 'SELECT id, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?'
                connection.query(checkIfExistsQuery, [userId, productId], (checkErr, results) => {
                    if (checkErr) {
                        console.error('Error al verificar el producto en el carrito:', checkErr)
                        return res.status(500).send('Error interno del servidor')
                    }

                    if (results.length > 0) {
                        // El producto ya está en el carrito, actualizar la cantidad
                        const existingCartItem = results[0]
                        const updatedCantidad = Math.min(stockDisponible, parseInt(existingCartItem.cantidad, 10) + cantidadSolicitada)

                        const updateQuery = 'UPDATE carrito SET cantidad = ? WHERE id = ?'
                        connection.query(updateQuery, [updatedCantidad, existingCartItem.id], (updateErr) => {
                            if (updateErr) {
                                console.error('Error al actualizar la cantidad en el carrito:', updateErr)
                                return res.status(500).send('Error interno del servidor')
                            }
                            console.log('Cantidad actualizada exitosamente en el carrito!!!')
                            res.redirect('/carrito')
                        })
                    } else {
                        // El producto no está en el carrito, insertar un nuevo registro
                        const insertQuery = 'INSERT INTO carrito (id_usuario, id_producto, cantidad, fecha_creacion) VALUES (?, ?, ?, NOW())'
                        connection.query(insertQuery, [userId, productId, cantidadSolicitada], (insertErr) => {
                            if (insertErr) {
                                console.error('Error al agregar el producto al carrito:', insertErr)
                                return res.status(500).send('Error interno del servidor')
                            }
                            console.log('Producto agregado al carrito exitosamente!!!')
                            res.redirect('/carrito')
                        })
                    }
                })
            } else {
                res.status(404).send('Producto no encontrado')
            }
        })
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

//Ruta para actualizar la cantidad de productos en el carrito
app.post('/actualizarCantidadEnCarrito/:id', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const productoId = req.params.id
        const nuevaCantidad = req.body.cantidad
        const sql = 'UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?'
        connection.query(sql, [nuevaCantidad, userId, productoId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la cantidad en el carrito:', err)
                return res.status(500).send('Error interno del servidor')
            }
            res.redirect('/carrito')
        })
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

//Ruta para eliminar el producto del carrito
app.post('/eliminarDelCarrito/:id', (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id
        const productoId = req.params.id
        const sql = 'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?'
        connection.query(sql, [userId, productoId], (err, result) => {
            if (err) {
                console.error('Error al eliminar el producto del carrito:', err)
                return res.status(500).send('Error interno del servidor')
            }
            res.redirect('/carrito')
        })
    } else {
        res.status(403).send('Acceso no autorizado')
    }
})

// Ruta para los productos
app.get('/productos', (req, res) => {
    res.locals.userRole = userRole
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

// Ruta para los productos
app.get('/productosAdmin', (req, res) => {
    res.locals.userRole = userRole
    if(req.session.usuario && (req.session.usuario.tipo == "editor" || req.session.usuario.tipo == "administrador")) {
        const sql = 'SELECT * FROM productos'
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error al recuperar los productos:', err)
                res.status(500).send('Error interno del servidor')
                return
            }
            res.render('productosAdmin', {
                pageTitle: 'Productos Administrador',
                products: results,
            })
        })
    } else {
        console.error("No cuentas con permisos!!!")
        res.status(403).send('Acceso denegado');
    }
})

// Ruta para mostrar el formulario de edición protegido (GET)
app.get('/usuarios/:usuarioId/editar', (req, res) => {
    res.locals.userRole = userRole
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        const usuarioId = req.params.usuarioId;
        connection.query('SELECT * FROM users WHERE id = ?', [usuarioId], (err, results) => {
            if (err) {
                console.error('Error al recuperar los detalles del usuario:', err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            if (results.length === 0) {
                res.status(404).send('Usuario no encontrado');
                return;
            }
            const usuario = results[0];
            res.render('editarUsuario', {
                pageTitle: `Editar ${usuario.nombre}`,
                usuario,
            });
        });
    } else {
        res.status(403).send('Acceso denegado');
    }
});

// Ruta para procesar la actualización protegida (POST)
app.post('/usuarios/:usuarioId/editar', (req, res) => {
    res.locals.userRole = userRole
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        const usuarioId = req.params.usuarioId;
        const { nombre, correo, tipo } = req.body;

        connection.query(
            'UPDATE users SET nombre = ?, correo = ?, tipo = ? WHERE id = ?',
            [nombre, correo, tipo, usuarioId],
            (err, results) => {
                if (err) {
                    console.error('Error al actualizar el usuario:', err);
                    res.status(500).send('Error interno del servidor');
                    return;
                }
                console.log("Usuario actualizado exitosamente!!!");
                res.redirect(`/usuarios`);
            }
        );
    } else {
        res.status(403).send('Acceso denegado');
    }
});

// Ruta para procesar la eliminación protegida (POST)
app.post('/usuarios/:usuarioId/eliminar', (req, res) => {
    res.locals.userRole = userRole
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        const usuarioId = req.params.usuarioId
        connection.query(
            'DELETE FROM users WHERE id = ?',
            [usuarioId],
            (err, results) => {
                if (err) {
                    console.error('Error al eliminar el usuario:', err)
                    res.status(500).send('Error interno del servidor')
                    return
                }
                console.log("Usuario eliminado exitosamente!!!")
                res.redirect(`/usuarios`)
            }
        )
    } else {
        res.status(403).send('Acceso denegado')
    }
})

// Ruta para agregar productos (GET)
app.get('/productos/agregar', (req, res) => {
    res.locals.userRole = userRole
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
            res.render('aproducts', {
                pageTitle: 'Agregar Producto',
                categorias: categorias,
                marcas: marcas,
            })
        })
    })
    } else {
        res.status(403).send('Acceso denegado')
    }
})

// Ruta para agregar productos (POST)
app.post('/productos/agregar', upload.single('imagen'), (req, res) => {
    const { nombre, precio, stock, categoria, nueva_categoria, marca, nueva_marca, descripcion } = req.body
    const imagePath = req.file ? req.file.path : null
    if (imagePath) { // Redimensionar la imagen a 1200x1200 px con sharp
        sharp(imagePath)
            .resize(1200, 1200)
            .toFile(`${imagePath}-resized`, (err, info) => {
                if (err) {
                    console.error('Error al redimensionar la imagen:', err)
                    res.status(500).send('Error al procesar la imagen')
                    return
                }
                /*if (fs.existsSync(imagePath)) { // Elimina la imagen original si existe
                    fs.unlinkSync(imagePath)
                }*/
                // Construye la nueva ruta de la imagen basada en la categoría y el nombre del producto
                



                let categoriaProducto = categoria || nueva_categoria
                categoriaProducto = categoriaProducto.toLowerCase()
                const nombreProducto = nombre.toLowerCase().replace(/\s+/g, '-')// Convierte espacios en guiones
                const nuevaRutaImagen = `public/images/${categoriaProducto}/${nombreProducto}-${i}.jpg`
                // Renombra y mueve la imagen redimensionada al nuevo directorio
                if (fs.existsSync(`${imagePath}-resized`)) {
                    fs.renameSync(`${imagePath}-resized`, nuevaRutaImagen)  
            } else {
                    console.error(`No se encontro el archivo temporal...`)
            }
                // Renombra y mueve la imagen redimensionada al nuevo directorio
                //fs.renameSync(`${imagePath}-resized`, nuevaRutaImagen)
                // Modifica la ruta para que sea relativa
                const rutaRelativaImagen = nuevaRutaImagen.replace(/^public\//, '')
                // Guarda la dirección de la imagen en la base de datos (como rutaRelativaImagen)
                const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, marca, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)'
                connection.query(sql, [nombre, precio, stock, categoria || nueva_categoria, marca || nueva_marca, descripcion, rutaRelativaImagen], (err, result) => {
                    if (err) {
                        console.error('Error al agregar el producto:', err)
                        res.status(500).send('Error interno del servidor')
                        return
                    }
                    i++
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
            res.redirect('/productos')
        })
    }
})

// Página de detalles del producto
app.get('/productos/:productoId', (req, res) => {
    res.locals.userRole = userRole
    const productoId = req.params.productoId
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
            userRole: userRole
        })
    })
})

// Ruta para mostrar el formulario de edición protegido (GET)
app.get('/productos/:productoId/editar', (req, res) => {
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        res.locals.userRole = userRole 
        const productoId = req.params.productoId
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
            res.render('editarProducto', {
                pageTitle: `Editar ${product.nombre}`,
                product,
            })
        })
    } else {
        res.status(403).send('Acceso denegado')
    }
})

// Ruta para procesar la actualización protegida (POST)
app.post('/productos/:productoId/editar', (req, res) => {
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        const productoId = req.params.productoId
        const { nombre, categoria, stock, descripcion, precio, marca } = req.body
        // Consulta para actualizar la información del producto (sin la imagen)
        connection.query(
            'UPDATE productos SET nombre = ?, stock = ?, descripcion = ?, precio = ?, marca = ? WHERE id = ?',
            [nombre, stock, descripcion, precio, marca, productoId],
            (err, results) => {
                if (err) {
                    console.error('Error al actualizar el producto:', err)
                    res.status(500).send('Error interno del servidor')
                    return
                }
                //Se actualizo satisfactoriamente el producto
                console.log("Producto actualizado exitosamente!!!")
                res.redirect(`/productos/${productoId}`)
            }
        )
    } else {
        res.status(403).send('Acceso denegado')
    }
})

// Ruta para procesar la eliminación de un producto (POST)
app.post('/productos/:productoId/eliminar', (req, res) => {
    res.locals.userRole = userRole
    if (req.session.usuario && (req.session.usuario.tipo === "editor" || req.session.usuario.tipo === "administrador")) {
        const productoId = req.params.productoId
        connection.query(
            'DELETE FROM productos WHERE id = ?',
            [productoId],
            (err, results) => {
                if (err) {
                    console.error('Error al eliminar el usuario:', err)
                    res.status(500).send('Error interno del servidor')
                    return
                }
                console.log(productoId)
                console.log("Producto eliminado exitosamente!!!")
                res.redirect(`/productosAdmin`)
            }
        )
    } else {
        res.status(403).send('Acceso denegado')
    }
})

//Ruta para usuarios
app.get('/usuarios', (req, res) => {
    if (req.session.usuario && req.session.usuario.tipo === "administrador") {
        const usuario = req.session.usuario
        res.locals.userRole = userRole
        res.locals.userName = userName
        connection.query("SELECT * FROM users", (err, results) => {
            if (err) {
                console.error('Error al recuperar los usuarios:', err)
                res.status(500).send('Error interno del servidor')
                return
            }
            // Organiza los usuarios en grupos según su tipo
            const usuariosAdmin = results.filter(user => user.tipo === 'administrador')
            const usuariosCliente = results.filter(user => user.tipo === 'cliente')
            const usuariosEditor = results.filter(user => user.tipo === 'editor')
            res.render('usuarios', {
                pageTitle: 'Usuarios',
                usuariosAdmin: usuariosAdmin,
                usuariosCliente: usuariosCliente,
                usuariosEditor: usuariosEditor,
                usuario: usuario,
            })
        })
    } else {
        res.status(403).send('Acceso denegado')
    }
})

app.get('/checkout', (req, res) => {
    if (req.session.usuario) {
        const idUsuario = req.session.usuario.id
        res.locals.userRole = userRole
        const sql = "SELECT * FROM direcciones WHERE id_usuario = ?";
        connection.query(sql, [idUsuario], (error, results) => {
            if (error) {
                console.error(error)
                res.status(500).send("Error al recuperar las direcciones del usuario.")
            } else {
                const direcciones = results
                res.render('creacionCompra', { 
                    direcciones,
                    pageTitle: "Checkout" })
            }
        })
    } else {
        res.redirect('/login')
    }
})

//Ruta para renderizado de pagina de pago
app.get('/pago', (req, res) => {
    if (req.session.usuario) {
        // Recupera la dirección seleccionada de la sesión (asegúrate de que esté almacenada previamente)
        const direccionSeleccionadaId = req.session.direccionSeleccionada
        res.locals.userRole = userRole
        const sql = 'SELECT * FROM direcciones WHERE id = ?'
        connection.query(sql, [direccionSeleccionadaId], (error, results) => {
            if (error) {
                console.error(error)
            } else {
                const direccionSeleccionada = results[0]
                res.render('pago', {
                    direccionSeleccionada,
                    pageTitle: "Método de Pago"
                })
            }
        })
    } else {
        res.redirect('/login') 
    }
})

 //URI para seleccionar la direccion al momento de elegir el metodo de pago
app.post('/seleccionarDireccion', (req, res) => {
    const direccionSeleccionada = req.body.direccion_envio
    req.session.direccionSeleccionada = direccionSeleccionada
    res.redirect('/pago')
})

//Ruta para la creacion del pago por medio de paypal
app.post('/pay', (req, res) => {
        res.locals.userRole = userRole
        const userId = req.session.usuario.id
        const sql = 'SELECT c.id_producto, c.cantidad, p.precio, p.nombre, p.descripcion FROM carrito c JOIN productos p ON c.id_producto = p.id WHERE c.id_usuario = ?'
        connection.query(sql, [userId], (err, productosEnCarrito) => {
            if(err) {
                console.error('Error al obtener productos en el carrito:', err)
                return res.status(500).send('Error interno del servidor')
            } else {
                const items = []
                var total = 0
                productosEnCarrito.forEach((producto) => { //Creacion de arreglo con estructura json con los productos en el carrito
                    const item = {
                        name: producto.nombre,
                        sku: producto.id_producto.toString(),
                        price: producto.precio.toString(),
                        currency: "MXN",
                        quantity: producto.cantidad.toString(),
                    }
                    total += producto.precio * producto.cantidad
                    items.push(item)
                })
                req.session.total = total
                const create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/success",
                        "cancel_url": "http://localhost:3000/pago"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": items,
                        },
                        "amount": {
                            "currency": "MXN",
                            "total": total,
                        },
                        "description": "Compra realizada en rincon paramo!!!"
                    }]
                }
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        throw error
                    } else {
                        for(let i = 0;i < payment.links.length;i++){
                            if(payment.links[i].rel === 'approval_url'){
                             res.redirect(payment.links[i].href)
                             }
                          }
                     }
                })
            }
        })
        console.log("Entrada a API Paypal...")
})

//En caso de que se cancele la operacion de Paypal
app.get('/cancel', (req, res) => {
    res.locals.userRole = userRole
    res.send('Cancelled')
})

//En case de que sea saisfactoria la operacion de Paypal
app.get('/success', (req, res) => {
    res.locals.userRole = userRole
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId
    console.log(req.session.total)
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "MXN",
              "total": req.session.total,
          }
      }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log("El pago ha sido rechazado!!!")
        console.log(error.response)
        throw error
      } else {
          //console.log(JSON.stringify(payment))
          console.log("El pago se ha autorizado!!!")
          if (req.session.usuario && req.session.direccionSeleccionada) {
            const userId = req.session.usuario.id;
            const direccionSeleccionada = req.session.direccionSeleccionada
            // Paso 1: Crear una nueva compra en la tabla "compras"
            const sql1 = 'INSERT INTO compras (id_usuario, id_direccion, fecha_compra) VALUES (?, ?, NOW())'
            connection.query(sql1 , [userId, direccionSeleccionada], (err, result) => {
                if (err) {
                    console.error('Error al crear la compra:', err)
                    return res.status(500).send('Error interno del servidor')
                }
                const compraId = result.insertId // ID de la compra recién creada
                // Paso 2: Obtener los productos en el carrito del usuario, incluyendo el precio
                const sql2 = 'SELECT c.id_producto, c.cantidad, p.precio, p.nombre FROM carrito c JOIN productos p ON c.id_producto = p.id WHERE c.id_usuario = ?'
                connection.query(sql2, [userId], (err, productosEnCarrito) => {
                    if (err) {
                        console.error('Error al obtener productos en el carrito:', err)
                        return res.status(500).send('Error interno del servidor')
                    }
                    // Paso 3: Copiar los productos del carrito a "detalles_compra" con el ID de la compra
                    const detallesCompraValues = productosEnCarrito.map(producto => [compraId, producto.id_producto, producto.cantidad])
                    connection.query('INSERT INTO detalles_compra (id_compra, id_producto, cantidad_comprada) VALUES ?', [detallesCompraValues], (err) => {
                        if (err) {
                            console.error('Error al copiar los productos a detalles_compra:', err)
                            return res.status(500).send('Error interno del servidor')
                        }
                        // Paso 4: Calcular el total de la compra
                        const totalCompra = productosEnCarrito.reduce((total, producto) => {
                            return total + producto.precio * producto.cantidad
                        }, 0)
                        // Paso 5: Actualizar el total de la compra en la tabla "compras"
                        connection.query('UPDATE compras SET total = ? WHERE id = ?', [totalCompra, compraId], (err) => {
                            if (err) {
                                console.error('Error al actualizar el total de la compra:', err)
                                return res.status(500).send('Error interno del servidor')
                            }
                            // Paso 6: Actualizar el stock de productos restando la cantidad comprada y luego eliminar los productos del carrito
                            const updateStockQueries = productosEnCarrito.map(producto => {
                                return new Promise((resolve, reject) => {
                                    // Actualizar el stock restando la cantidad comprada
                                    connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [producto.cantidad, producto.id_producto], (err) => {
                                        if (err) {
                                            console.error('Error al actualizar el stock del producto:', err)
                                            reject(err)
                                        } else {
                                            resolve()
                                        }
                                    })
                                })
                            })
                            // Ejecutar todas las actualizaciones del stock en paralelo
                            Promise.all(updateStockQueries)
                                .then(() => {
                                    // Paso 7: Eliminar los productos del carrito
                                    connection.query('DELETE FROM carrito WHERE id_usuario = ?', [userId], (err) => {
                                        if (err) {
                                            console.error('Error al eliminar productos del carrito:', err)
                                            return res.status(500).send('Error interno del servidor')
                                        }
                                        // Paso 8: Redirigir al usuario a una página de confirmación o recibo
                                        res.redirect('/perfil/compras')
                                    })
                                })
                                .catch((err) => {
                                    return res.status(500).send('Error interno del servidor')
                                })
                        })
                    })
                })
            })
        } else {
            res.status(403).send('Acceso no autorizado')
        }
      }
    })
})

app.listen(process.env.PORT, () => { // Se inicia el servidor
    console.log(`Servidor a la espera en el puerto ${process.env.PORT}`)
})