// firebase-config.js - Configuración de Firebase para Bella Indumentaria Femenina

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvE0wjrSr5FmDb0Mt_SXSamfW2kR2b5gc",
  authDomain: "bella-app-cea77.firebaseapp.com",
  databaseURL: "https://bella-app-cea77-default-rtdb.firebaseio.com",
  projectId: "bella-app-cea77",
  storageBucket: "bella-app-cea77.firebasestorage.app",
  messagingSenderId: "367247061913",
  appId: "1:367247061913:web:d526629fa5449fa48f5908"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
