// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpl8CMPd5z5rqvT72LHAiQTynSiAESr-M",
  authDomain: "menstrual-health-tracker.firebaseapp.com",
  projectId: "menstrual-health-tracker",
  storageBucket: "menstrual-health-tracker.firebasestorage.app",
  messagingSenderId: "1002109333231",
  appId: "1:1002109333231:web:884a785ebd8ac5cb68751a",
  measurementId: "G-JSCM4HBK0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };