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
      const uid = user.uid;
      console.log(user)
      switchTo('setting')
      document.querySelector('nav.top div.signin').classList.add('hidden')
      document.querySelector('nav.top div.logout').classList.remove('hidden')
      // ...
    } else {
        // User is signed out
        let ui = new firebaseui.auth.AuthUI(auth).start('#firebaseui-auth-container', uiConfig );
        switchTo('welcome')
        document.querySelector('nav.top div.signin').classList.remove('hidden')
        document.querySelector('nav.top div.logout').classList.add('hidden')
        if (ui.isPendingRedirect()) {
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    }
  });


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
