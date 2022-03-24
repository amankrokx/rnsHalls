// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, onAuthStateChanged  } from "firebase/auth";
import * as firebaseui from 'firebaseui'
import { firebaseConfig, uiConfig } from "./config/firebaseConfig";
import './css/firebase-ui-auth.css'
import './modules/loader.js'

//import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log(user)
      document.querySelector('nav.top div.signin').classList.add('hidden')
      document.querySelector('nav.top div.logout').classList.remove('hidden')
      document.querySelector('nav.bottom').classList.remove('hidden')
      switchTo('setting')
      const uid = user.uid;
      if (user.photoURL) {
            document.querySelector('nav.bottom span.setting').innerHTML = `<img src="${user.photoURL}" style="height: 36px; width: 36px; border-radius: 50%;" />`
            //document.querySelector('div.setting div.content img').src = user.photoURL
      }
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

setTimeout(() => {
    //switchTo('welcome')
    showLoader()
}, 3000);

function component() {
    const element = document.createElement('div');

    // Lodash, currently included via a script, is required for this line to work
    // Lodash, now imported by this script
    element.innerHTML = "Hellow World rom webpack !"
    return element;
}

document.body.appendChild(component());
