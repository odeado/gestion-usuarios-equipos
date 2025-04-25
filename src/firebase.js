import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKO3c4WitANxhIC5Wc0IjXF8X8mi68nF8",
  authDomain: "gestion-usuarios-equipos.firebaseapp.com",
  projectId: "gestion-usuarios-equipos",
  storageBucket: "gestion-usuarios-equipos.appspot.com",
  messagingSenderId: "124302724881",
  appId: "1:124302724881:web:4a68cac2ae22d7b21c06b0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Exporta la instancia de Firestore
export const storage = getStorage(app);