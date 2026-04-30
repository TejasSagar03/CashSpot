import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Your real CashSpot configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfU8eQaiA7a2OCIPJkA_WyIR2g3SegIVc",
  authDomain: "cashspot-b11af.firebaseapp.com",
  projectId: "cashspot-b11af",
  storageBucket: "cashspot-b11af.firebasestorage.app",
  messagingSenderId: "450441546630",
  appId: "1:450441546630:web:12a6eaa47ac56eeed67a07"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider(); // <-- GITHUB ADDED!