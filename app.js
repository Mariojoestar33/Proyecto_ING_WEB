const express = require('express')
const app = express()

const host = "127.0.0.1"
const port = 3000
const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    fs.readFile('public/index.html', (err, data) => {
        if(err) {
            res.writeHead(404)
            res.write('Error 404: No resources found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

server.listen(port, host, () => {
    console.log('Servidor en http://',host,':',port)
});