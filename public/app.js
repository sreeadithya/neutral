import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVRnJfrP4-VHoIHl0SFJSqSkdXT6Q3cXY",
  authDomain: "neutral-fd231.firebaseapp.com",
  projectId: "neutral-fd231",
  storageBucket: "neutral-fd231.appspot.com",
  messagingSenderId: "279993688340",
  appId: "1:279993688340:web:4905f1d9fecb0e8d5c6201"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const userEmailField = document.querySelector("#userEmailField");
const whenSignedOut = document.querySelector("#whenSignedOut");
const whenSignedIn = document.querySelector("#whenSignedIn");
const enterButton = document.querySelector("#enterButton");
const signOutButton = document.querySelector("#signOutButton");


const userSignIn = async() => {
  document.querySelector("#emailInvalidFormat").style.display = 'none'
  document.querySelector("#verificationLinkSent").style.display = 'block'
  const signInEmail = userEmailField.value;
  
  sendSignInLinkToEmail(auth, signInEmail, {
    url: 'http://127.0.0.1:5500/public/index.html?',
    handleCodeInApp: true
  })
  .then(() => {
    alert("Logged in bros!");
    window.localStorage.setItem('signInEmail', signInEmail);
    
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage)

    document.querySelector("#emailInvalidFormat").style.display = 'block'
    

  });
}

const checkAuthState = async() => {
  onAuthStateChanged(auth, user => {
    if(user) {
      console.log('user loged in')

    }
    else {

      if(isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('signInEmail')
        if (!signInEmail) {
          signInEmail = window.prompt('please provide your email')
        }
        signInWithEmailLink(auth, localStorage.getItem('signInEmail'), window.location.href)
        .then(() => {
          localStorage.removeItem('signInEmail')
          whenSignedOut.style.display = 'none';
          whenSignedIn.style.display = 'block';
        })
      }

      console.log('user aint loged in')
      whenSignedOut.style.display = 'block';
      whenSignedIn.style.display = 'none';
    }
  })
}

checkAuthState()

const userSignOut = async() => {
  await signOut(auth);
}


enterButton.addEventListener('click', (event) => {
  event.preventDefault(); 
  userSignIn();
});

signOutButton.addEventListener('click', (event) => {
  event.preventDefault(); 
  userSignOut();
});