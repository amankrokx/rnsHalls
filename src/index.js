// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, onAuthStateChanged, updateProfile  } from "firebase/auth";
import * as firebaseui from 'firebaseui'
import { firebaseConfig, uiConfig } from "./config/firebaseConfig";
import './css/firebase-ui-auth.css'

//import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

onAuthStateChanged(auth, (user) => {
    hideLoader()
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log(user)
      document.querySelector('nav.top div.signin').classList.add('hidden')
      document.querySelector('nav.top div.logout').classList.remove('hidden')
      document.querySelector('nav.bottom').classList.remove('hidden')
      switchTo('notifications')
      const uid = user.uid;
      if (user.photoURL) {
            document.querySelector('nav.bottom span.setting').innerHTML = `<img src="${user.photoURL}" style="height: 36px; width: 36px; border-radius: 50%;" referrerpolicy="no-referrer" />`
            document.querySelector('div.setting div.content img').src = user.photoURL
      }
      if (user.displayName) document.querySelector('div.setting input.name').value = user.displayName
      if (user.email) document.querySelector('div.setting input.email').value = user.email
      if (user.phoneNumber) document.querySelector('div.setting input.phone').value = user.phoneNumber
      // ...
    } else {
        // User is signed out
        document.querySelector('nav.top div.signin').classList.remove('hidden')
        document.querySelector('nav.top div.logout').classList.add('hidden')
        let ui = new firebaseui.auth.AuthUI(auth).start('#firebaseui-auth-container', uiConfig );
        switchTo('welcome')
        if (ui.isPendingRedirect()) {
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    }
  });

// Event listeners...
document.querySelector('nav.top div.logout').onclick = function () {
    auth.signOut()
}

document.querySelector('div.setting input.submit').onclick = function(e) {
    if (e.target.value === 'Edit') {
        document.querySelector('div.setting input.name').disabled = false
        document.querySelector('div.setting input.email').disabled = false
        document.querySelector('div.setting input.phone').disabled = false
        e.target.value = 'Save Changes'
    } else {
        document.querySelector('div.setting input.name').disabled = true
        document.querySelector('div.setting input.email').disabled = true
        document.querySelector('div.setting input.phone').disabled = true
        let name =  document.querySelector('div.setting input.name').value
        let email_ = document.querySelector('div.setting input.email').value
        let phoneNumber_ = document.querySelector('div.setting input.phone').value
        phoneNumber_ = phoneNumber_.toString()
        console.log(name, email_, phoneNumber_)
        updateProfile(auth.currentUser, {
            displayName: name,
            email: email_,
            phoneNumber: phoneNumber_
          }).then(() => {
            // Profile updated!
            alert('Profile Updated !')
        }).catch((error) => {
            // An error occurred
            console.log(error)
            alert('Some error Occured !')
            return
        });
        e.target.value = 'Edit'
          
    }
}

function component() {
    const element = document.createElement('div');

    // Lodash, currently included via a script, is required for this line to work
    // Lodash, now imported by this script
    element.innerHTML = "Hellow World rom webpack !"
    return element;
}

document.body.appendChild(component());
