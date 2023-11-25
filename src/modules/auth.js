import { FacebookAuthProvider, GoogleAuthProvider, RecaptchaVerifier, TwitterAuthProvider, createUserWithEmailAndPassword, getRedirectResult, signInWithEmailAndPassword, signInWithPhoneNumber, signInWithPopup, signInWithRedirect } from 'firebase/auth'

let signupEmail = (auth) => {
    // console.log('Signup with email loaded')
    document.querySelector('#main form.signup input.submit').onclick = function(e) {
        e.preventDefault()
        let userid = document.querySelector('#main form.signup input.email').value
        let password = document.querySelector('#main form.signup input.password').value

        createUserWithEmailAndPassword(auth, userid, password)
            .then((userCredential) => {
                // Signed in 
                // const user = userCredential.user;
                toast('Signed in with Email !')
                toast('Please Fill your Profile !')
            })
            .catch((error) => {
                console.error(error)
                toast(error.message)
            })
    }
}

let loginEmail = (auth) => {
    // console.log('Login with Email loaded')
    document.querySelector('#main form.login input.submit').onclick = function(e) {
        e.preventDefault()
        let userid = document.querySelector('#main form.login input.email').value
        let password = document.querySelector('#main form.login input.password').value
        signInWithEmailAndPassword(auth, userid, password)
            .then((userCredential) => {
                // Signed in 
                // const user = userCredential.user;
                toast('Signed in with Email !')
            })
            .catch((error) => {
                console.error(error)
                toast(error.message)
                // ..
            })
    }
}

let loginGoogle = (auth) => {
    const provider = new GoogleAuthProvider()
    // provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read')
    signInWithRedirect(auth, provider).then((res) => {
        getRedirectResult(auth)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access Google APIs.
                // const credential = GoogleAuthProvider.credentialFromResult(result)
                // const token = credential.accessToken;
                // The signed-in user info.
                // const user = result.user
                toast('Signed in with Google !')
            }).catch((error) => {
                // Handle Errors here.
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // console.log(email, credential)
                console.error(error)
                toast(error.message)
            })
    }).catch((error) => {
        console.error(error)
        toast(error.message)
    })
}

let loginTwitter = (auth) => {
    const provider = new TwitterAuthProvider()
    signInWithPopup(auth, provider).then((res) => {
        // console.log(res) 
        getRedirectResult(auth)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access Google APIs.
                // const credential = GoogleAuthProvider.credentialFromResult(result)
                // const token = credential.accessToken;
                // The signed-in user info.
                // const user = result.user
                // console.log(result)
                toast('Signed in with Twitter !')
            }).catch((error) => {
                // Handle Errors here.
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // console.log(email, credential)
                console.error(error)
                toast(error.message)
            })
    }).catch((error) => {
        toast(error.message)
        if (error.code == "auth/account-exists-with-different-credential") toast(`Please use ${error.customData._tokenResponse.verifiedProvider} for ${error.customData.email}`)
    })
}

let loginFb = (auth) => {
    const provider = new FacebookAuthProvider()
    signInWithPopup(auth, provider).then((res) => {
        // console.log(res) 
        getRedirectResult(auth)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access Google APIs.
                // const credential = GoogleAuthProvider.credentialFromResult(result)
                // const token = credential.accessToken;
                // The signed-in user info.
                // const user = result.user
                // console.log(result)
                toast('Signed in with Facebook !')
            }).catch((error) => {
                // Handle Errors here.
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = FacebookAuthProvider.credentialFromError(error);
                // console.log(email, credential)
                console.error(error)
                toast(error.message)
            })
    }).catch((error) => {
        toast(error.message)
        if (error.code == "auth/account-exists-with-different-credential") toast(`Please use ${error.customData._tokenResponse.verifiedProvider} for ${error.customData.email}`)
    })
}

let submitPhoneNumberAuth = (auth) => {
    let phone = document.querySelector('#main form.signup_phone input.phone').value
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phone, appVerifier)
        .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            toast('OTP Sent Successfully !')
            document.querySelector('form.signup_phone input:last-of-type').classList.add('submit')
        }).catch((error) => {
            // Error; SMS not sent
            console.error(error)
            toast(error.message)
            grecaptcha.reset(window.recaptchaWidgetId);

            // Or, if you haven't stored the widget ID:
            window.recaptchaVerifier.render().then(function(widgetId) {
                grecaptcha.reset(widgetId);
            })
        });
}

let submitPhoneNumberAuthCode = (auth) => {
    let code = document.querySelector('#main form.signup_phone input.otp').value
    if (code.length < 5) {
        toast('Invalid OTP')
        return
    }
    confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        toast('Login Success with Phone !')
      }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        console.error(error)
        toast(error.message)
      });
}

let loginPhone = (auth) => {
    // console.log('Login with phone loaded !')
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          //submitPhoneNumberAuth(auth)
        },
        'expired-callback': () => {
            toast('ReCaptcha Loading Failed')
        }
    }, auth)
    document.querySelector('div.login form.signup_phone input.sendOTP').onclick = (e) => { 
        submitPhoneNumberAuth(auth)
        return false
    }
    document.querySelector('div.login form.signup_phone input:last-of-type').onclick = (e) => { 
        submitPhoneNumberAuthCode(auth) 
        return false
    }
}

export { loginEmail, loginFb, loginGoogle, loginPhone, loginTwitter, signupEmail }
