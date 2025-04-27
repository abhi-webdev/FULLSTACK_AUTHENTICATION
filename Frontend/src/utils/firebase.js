import {getAuth, GoogleAuthProvider} from "firebase/auth"

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "login-bde9c.firebaseapp.com",
  projectId: "login-bde9c",
  storageBucket: "login-bde9c.appspot.com",
  messagingSenderId: "1088622324373",
  appId: "1:1088622324373:web:dba11db544a1b497c7c99c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider =new GoogleAuthProvider()
provider.addScope('profile')
provider.addScope('email')


export {auth, provider}