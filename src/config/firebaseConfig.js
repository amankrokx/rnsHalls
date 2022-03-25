import { EmailAuthProvider, RecaptchaVerifier, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCtXhu_B-km2JnERkRauDWYP4cLKg-jHL0",
    authDomain: "rnshalls.firebaseapp.com",
    databaseURL: "https://rnshalls-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "rnshalls",
    storageBucket: "rnshalls.appspot.com",
    messagingSenderId: "23044137424",
    appId: "1:23044137424:web:346a1d0ee8c529ecf619d5",
    measurementId: "G-VJFXFVZ01D"
  };

const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return true;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
    },
    signInSuccessUrl: 'http://localhost:8080/',
    signInOptions: [
        {
        provider: EmailAuthProvider.PROVIDER_ID,
        signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        requireDisplayName: true
        },
        GoogleAuthProvider.PROVIDER_ID,
        {
        provider: PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
            type: 'image', // 'audio'
            size: 'invisible', // 'invisible' or 'compact'
            badge: 'bottomright' //' bottomright' or 'inline' applies to invisible.
            },
            defaultCountry: 'IN', // Set default country to the United Kingdom (+44).
            // For prefilling the national number, set defaultNationNumber.
            // This will only be observed if only phone Auth provider is used since
            // for multiple providers, the NASCAR screen will always render first
            // with a 'sign in with phone number' button.
            defaultNationalNumber: '1234567890',
            // You can also pass the full phone number string instead of the
            // 'defaultCountry' and 'defaultNationalNumber'. However, in this case,
            // the first country ID that matches the country code will be used to
            // populate the country selector. So for countries that share the same
            // country code, the selected country may not be the expected one.
            // In that case, pass the 'defaultCountry' instead to ensure the exact
            // country is selected. The 'defaultCountry' and 'defaultNationaNumber'
            // will always have higher priority than 'loginHint' which will be ignored
            // in their favor. In this case, the default country will be 'GB' even
            // though 'loginHint' specified the country code as '+1'.
            loginHint: '+91 994 789 1234'
        }
    ]
}

export {firebaseConfig, uiConfig}