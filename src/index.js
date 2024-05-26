// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, sendEmailVerification, updateEmail, updatePassword, updateProfile } from "firebase/auth"
import { child, get, getDatabase, ref, set } from "firebase/database"
import { firebaseConfig } from "./config/firebaseConfig"
import "./css/firebase-ui-auth.css"
import { loginEmail, loginFb, loginGoogle, loginPhone, loginTwitter, signupEmail } from "./modules/auth"
import { DBs } from "./modules/db"

//import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig)
//const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)
auth.languageCode = "en"

let globals = {
    uid: false,
    attached: false,
    isAdmin: false,
    db: false,
}

// Get a reference to the database service
const db = getDatabase(app)


onAuthStateChanged(auth, user => {
    hideLoader()
    // #hallid is a <select> element, fill it with all the halls as <option> elements from /hallList as key and value
    // document.querySelector("#hallid")
    get(child(ref(db), "hallList")).then(snapshot => {
        let d = snapshot.val()
        console.log(d)
        if (!d) d = {}
        let hallid = window.location.hash.substring(1) || "hall1"
        // console.log(hallid)
        let html = ""
        for (let i in d) {
            html += `<option value="${i}" ${i === hallid ? "selected" : ""}>${d[i]}</option>`
        }
        document.querySelector("#hallid").innerHTML = html
        document.querySelector("#hallid").onchange = e => {
            window.location.hash = e.target.value
            window.location.reload()
        }
    })
    if (user) {
        window.userDisplayName = user.displayName
        window.userEmail = user.email
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // console.log(user)
        document.querySelector("nav.top div.signin").classList.add("hidden")
        document.querySelector("nav.top div.logout").classList.remove("hidden")
        document.querySelector("nav.bottom").classList.remove("hidden")
        switchTo("home")
        globals.uid = user.uid
        globals.hallid = window.location.hash.substring(1) || "hall1"
        console.log("Selected Hall : ", globals.hallid)
        globals.db = new DBs(db, user.uid, globals.hallid)
        if (user.photoURL) {
            document.querySelector("nav.bottom span.setting").innerHTML = `<img src="${user.photoURL}" style="height: 30px; width: 30px; border-radius: 50%;" referrerpolicy="no-referrer" />`
            document.querySelector("div.setting div.content img").src = user.photoURL
        }
        globals.db.readFromPath("/admin/adminList", d => {
            if (d.val().includes(user.email) || user.email === "amankumar.spj410@gmail.com") {
                globals.isAdmin = true
                globals.db.setAdmin(true)
                document
                    .querySelector("nav.bottom span.notifications")
                    .insertAdjacentHTML(
                        "afterend",
                        `<span class="material-icons keys nav-inactive" style="width: 60px;" onclick="switchTo('keys')">vpn_keys</span><span class="material-icons bookingHistory nav-inactive" style="width: 60px;" onclick="switchTo('bookingHistory')">manage_history</span>`
                    )
                document.querySelector("nav.bottom span.notifications").setAttribute("onclick", "switchTo('notifications-admin')")
                document.querySelector("nav.bottom span.history").setAttribute("onclick", "switchTo('history-admin')")
                toast("Welcome Admin !")
            } else globals.db.setAdmin(false)
        })
        globals.db.getUserProfile(user.uid, function (snapshot) {
            let d = snapshot.val()
            if (!d) d = {}
            let upflag = false
            // console.log(d)
            if (user.photoURL && d.photoURL !== user.photoURL) {
                upflag = true
                d.photoURL = user.photoURL
            }
            if (user.displayName && d.displayName !== user.displayName) {
                upflag = true
                d.displayName = user.displayName
            }
            if (user.phoneNumber && d.phoneNumber !== user.phoneNumber) {
                upflag = true
                d.phoneNumber = user.phoneNumber
            }
            if (user.email && d.email !== user.email) {
                upflag = true
                d.email = user.email
            }
            if (upflag) globals.db.writeToPath(`users/${user.uid}/profile`, d)
        })
        if (user.displayName) document.querySelector("div.setting input.name").value = user.displayName
        if (user.email) document.querySelector("div.setting input.email").value = user.email
        if (user.phoneNumber) document.querySelector("div.setting input.phone").value = user.phoneNumber
        // ...
    } else {
        // User is signed out
        loginEmail(auth)
        document.querySelector("#loadsignup").onclick = e => {
            signupEmail(auth)
            if (e.target.innerHTML === "Signup with Email") e.target.innerHTML = "Login with Email"
            else e.target.innerHTML = "Signup with Email"
        }
        document.querySelector("div.login div.imgs img.google").onclick = () => {
            loginGoogle(auth)
        }
        document.querySelector("div.login div.imgs img.fb").onclick = () => {
            loginFb(auth)
        }
        document.querySelector("div.login div.imgs img.twitter").onclick = () => {
            loginTwitter(auth)
        }
        document.querySelector("div.login form.signup span.loginphone").onclick = () => {
            loginPhone(auth)
        }
        document.querySelector("nav.top div.signin").classList.remove("hidden")
        document.querySelector("nav.top div.logout").classList.add("hidden")
        try {
            switchTo("welcome")
        } catch (error) {
            console.error(error)
        }
    }
})

// Event listeners...
document.querySelector("nav.top div.logout").onclick = function () {
    auth.signOut().then(() => {
        window.location.reload()
    })
}

document.querySelector("div.setting input.submit").onclick = function (e) {
    if (e.target.value === "Edit") {
        document.querySelector("div.setting input.name").disabled = false
        document.querySelector("div.setting input.email").disabled = false
        document.querySelector("div.setting input.phone").disabled = false
        document.querySelector("div.setting input.password").disabled = false
        e.target.value = "Save Changes"
    } else {
        document.querySelector("div.setting input.name").disabled = true
        document.querySelector("div.setting input.email").disabled = true
        document.querySelector("div.setting input.phone").disabled = true
        document.querySelector("div.setting input.password").disabled = true
        let name = document.querySelector("div.setting input.name").value
        let email_ = document.querySelector("div.setting input.email").value
        let phoneNumber_ = document.querySelector("div.setting input.phone").value
        let password = document.querySelector("div.setting input.password").value
        phoneNumber_ = phoneNumber_.toString()
        // console.log(name, email_, phoneNumber_)
        if (name && name !== auth.currentUser.displayName) {
            globals.db.writeToPath(`users/${globals.uid}/profile/displayName`, name)
            updateProfile(auth.currentUser, {
                displayName: name,
            })
                .then(() => {
                    // Profile updated!
                    toast("Name Updated !")
                })
                .catch(error => {
                    // An error occurred
                    // console.log(error)
                    toast("Some error Occured with name !")
                    return
                })
        }
        if (email_ && email_ !== auth.currentUser.email) {
            globals.db.writeToPath(`users/${globals.uid}/profile/email`, email_)
            updateEmail(auth.currentUser, email_)
                .then(() => {
                    // Email updated!
                    toast("Email ID updated !")
                    sendEmailVerification(auth.currentUser).then(() => {
                        // Email verification sent!
                        toast(`Verification Sent to ${email_}`)
                    })
                })
                .catch(error => {
                    // An error occurred
                    // console.log(error)
                    toast("Please Re-login and try again !")
                })
        }
        if (password) {
            updatePassword(auth.currentUser, password)
                .then(() => {
                    // Update successful.
                    toast("Password Updated")
                })
                .catch(error => {
                    // An error ocurred
                    toast("Sign in again then try !")
                })
        }
        e.target.value = "Edit"
    }
}

document.querySelector("div.setting input.secret-submit").onclick = function (e) {
    if (e.target.value === "Modify") {
        document.querySelector("div.setting input.secret").disabled = false
        e.target.value = "Update"
    } else {
        let secret = document.querySelector("div.setting input.secret").value
        if (!secret) {
            toast("Secret Cannot be Empty !")
        } else {
            set(ref(db, `users/${globals.uid}/`), {
                secret,
            })
                .then(() => {
                    toast("Secret Updated !")
                })
                .catch(error => {
                    console.error(error)
                    toast("Failed to update Secret")
                })
        }
    }
}
