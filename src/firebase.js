// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6cCzsgigo6aHEupUjXOOD0AafJJPPd-s",
  authDomain: "talkative-development.firebaseapp.com",
  projectId: "talkative-development",
  storageBucket: "talkative-development.appspot.com",
  messagingSenderId: "871429107742",
  appId: "1:871429107742:web:6e90df033b051652103e0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = app.auth()
export default app
