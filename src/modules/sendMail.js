/**
 *
 * @param {string?} name user's name
 * @param {string?} message
//  * @param {string?} email Email address of the Admin
 */
function sendMail(name = "RNSHalls User", message = "", email) {
    // send email
    if (message === "") {
        message = `${new Date()}\nNew Hall Booking request for RNS Halls by ${name}\nVisit at https://rnshalls.web.app  or  https://halls.rnsit.ac.in\n\n RNS Halls`
    }
    fetch("/mail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({
            name,
            email: email || undefined,
            message,
        }),
    }).then((response) => {
        if (response.ok) {
            console.log("Email sent successfully")
        } else {
            console.error("Error sending email")
            alert("Warn: Admin not notified. Please inform them manually if urgent.")
        }
    })
}

export default sendMail
