// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, updatePassword, sendEmailVerification, updateProfile, updateEmail  } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { loginEmail, loginGoogle, loginPhone, signupEmail } from './modules/auth'
import { firebaseConfig } from "./config/firebaseConfig";
import './css/firebase-ui-auth.css'

const admins = ['amankumar.spj410@gmail.com', 'prahladavadhani@gmail.com']
//import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)
auth.languageCode = 'en';

let globals = {
    uid : false,
    attached : false,
    isAdmin : false,
}
// Get a reference to the database service
const db = getDatabase(app);

let attachEvents = () => {
    if (!globals.attached) {
        globals.attached = true
        onValue(ref(db, `users/${globals.uid}/secret`), (snapshot) => {
            document.querySelector('div.setting input.secret').value = snapshot.val()
        })
    }
}

onAuthStateChanged(auth, (user) => {
    hideLoader()
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log(user)
      document.querySelector('nav.top div.signin').classList.add('hidden')
      document.querySelector('nav.top div.logout').classList.remove('hidden')
      document.querySelector('nav.bottom').classList.remove('hidden')
      switchTo('home')
      globals.uid = user.uid;
      attachEvents()
      if (user.photoURL) {
            document.querySelector('nav.bottom span.setting').innerHTML = `<img src="${user.photoURL}" style="height: 36px; width: 36px; border-radius: 50%;" referrerpolicy="no-referrer" />`
            document.querySelector('div.setting div.content img').src = user.photoURL
      }
      if (admins.includes(user.email)) {
          globals.isAdmin = true
          document.querySelector('nav.bottom span.notifications').setAttribute('onclick', "switchTo('notifications-admin')")
          document.querySelector('nav.bottom span.history').setAttribute('onclick', "switchTo('history-admin')")
          alert('Welcome Admin !')
      }
      if (user.displayName) document.querySelector('div.setting input.name').value = user.displayName
      if (user.email) document.querySelector('div.setting input.email').value = user.email
      if (user.phoneNumber) document.querySelector('div.setting input.phone').value = user.phoneNumber
      // ...
    } else {
        // User is signed out
        loginEmail(auth)
        document.querySelector('#loadsignup').onclick = (e) => { 
            signupEmail(auth)
            if (e.target.innerHTML === 'Signup with Email') e.target.innerHTML = 'Login with Email'
            else e.target.innerHTML = 'Signup with Email'
        }
        document.querySelector('div.login div.imgs img.google').onclick = () => { loginGoogle(auth) }
        document.querySelector('div.login form.signup span.loginphone').onclick = () => { loginPhone(auth) }
        document.querySelector('nav.top div.signin').classList.remove('hidden')
        document.querySelector('nav.top div.logout').classList.add('hidden')
        switchTo('welcome')
    }
  });

// Event listeners...
document.querySelector('nav.top div.logout').onclick = function () {
    auth.signOut().then(() => {
        window.location.reload()
    })
}

document.querySelector('div.setting input.submit').onclick = function(e) {
    if (e.target.value === 'Edit') {
        document.querySelector('div.setting input.name').disabled = false
        document.querySelector('div.setting input.email').disabled = false
        document.querySelector('div.setting input.phone').disabled = false
        document.querySelector('div.setting input.password').disabled = false
        e.target.value = 'Save Changes'
    } else {
        document.querySelector('div.setting input.name').disabled = true
        document.querySelector('div.setting input.email').disabled = true
        document.querySelector('div.setting input.phone').disabled = true
        document.querySelector('div.setting input.password').disabled = true
        let name =  document.querySelector('div.setting input.name').value
        let email_ = document.querySelector('div.setting input.email').value
        let phoneNumber_ = document.querySelector('div.setting input.phone').value
        let password = document.querySelector('div.setting input.password').value
        phoneNumber_ = phoneNumber_.toString()
        console.log(name, email_, phoneNumber_)
        if (name && name !== auth.currentUser.displayName) {
            updateProfile(auth.currentUser, {
                displayName: name,
            }).then(() => {
                // Profile updated!
                alert('Name Updated !')
            }).catch((error) => {
                // An error occurred
                console.log(error)
                alert('Some error Occured with name !')
                return
            })
        }
        if (email_ && email_ !== auth.currentUser.email) {
            updateEmail(auth.currentUser, email_).then(() => {
                // Email updated!
                alert('Email ID updated ! Please verify email Sent !')
                sendEmailVerification(auth.currentUser)
                    .then(() => {
                        // Email verification sent!
                        // ...
                    });
              }).catch((error) => {
                  // An error occurred
                  console.log(error)
                  alert("Please Re-login and try again !")
                });
            }
            if (password) {
                updatePassword(auth.currentUser, password).then(() => {
                    // Update successful.
                    alert('Password Updated')
                }).catch((error) => {
                    // An error ocurred
                    alert('Sign in again then try !')
                });
                
            }
            e.target.value = 'Edit'
            
    }
}

document.querySelector('div.setting input.secret-submit').onclick = function(e) {
    if (e.target.value === 'Modify') {
        document.querySelector('div.setting input.secret').disabled = false
        e.target.value = 'Update'
    }
    else {
        let secret = document.querySelector('div.setting input.secret').value
        if (!secret) {
            alert('Secret Cannot be Empty !')
        } else {
            set(ref(db, `users/${globals.uid}/`), {
                secret
            }).then(() => {
                alert("Secret Updated !")
            }).catch((error) => {
                console.error(error)
                alert("failed to update Secret")
            })
        }
    }
}
