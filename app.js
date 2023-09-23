const express = require('express')
const app = express()

const host = "127.0.0.1"
const port = 3000
const path = require('path')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, '0.0.0.0', () => {
    console.log('Servidor en http://', host, ':', port)
})