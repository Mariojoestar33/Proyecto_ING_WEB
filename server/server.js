//Creacion de variables de aplicacion y dependencias
const express = require('express')
//const mysql = require('mysql')
const app = express()

//app.use(express.static('public')) //Asignacion de ruta de hojas estaticas

//Ruta de la pagina principal
app.get('/api', (req, res) => {
    res.json({ "users": ["userOne", "userTwo", "userThree"] })
    //res.sendFile(__dirname, 'public', 'index.html')
})

//Conexion y creacion de la base de datos

/*const db = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rincon'
})

db.connect( (err) => {
    if(err) {
        console.error('Error de conexion: ' + err.message)
    } else
    console.log('¡¡Conexion exitosa!!')
})*/

//Chequeo del estado del servidor

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000!!!')
})