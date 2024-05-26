const { onRequest } = require("firebase-functions/v2/https")
const logger = require("firebase-functions/logger")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        // credentials for email sending
        // configure gmail or use SMTP for other services
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
})

transporter.verify((error, success) => {
    if (error) {
        logger.error(error)
    }
})

exports.mail = onRequest(
    {
        cpu: 1,
        memory: "128MiB",
        cors: {
            origin: ["rnshalls.web.app", "rnshalls.firebaseapp.com", "halls.rnsit.ac.in"],
        },
        regions: ["asia-south1"],
    },
    (request, response) => {
        // only POST requests are allowed
        if (request.method !== "POST") {
            response.status(405).send("Method not allowed")
        }
        // default values for email of Admin used if not provided
        const { name, email = process.env.ADMIN_EMAIL || "cto@rnsit.ac.in", message } = request.body

        // validate request
        if (!name || !email || !message) {
            response.status(400).send("Invalid request")
            return
        }
        // email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            response.status(400).send("Invalid email")
            return
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL,
            to: email,
            subject: `New Hall Booking request for RNS Halls by ${name}`,
            text: message,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error(error)
                response.status(500).send("Error sending email")
            } else {
                response.status(200).send("Email sent successfully")
            }
        })
    }
)
