const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport( {
    service: 'gmail',
    auth: {
        user: "mariano.pena15@gmail.com",
        pass: "Halohola3312"
    }
})

module.exports = {transporter}