import { initializeApp } from "firebase/app";

import {
  getAuth,
 GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiysA3JOlIcNzoCaSRertP0UwV32ku7ag",
  authDomain: "void-tracker-af84b.firebaseapp.com",
  projectId: "void-tracker-af84b",
  storageBucket: "void-tracker-af84b.firebasestorage.app",
  messagingSenderId: "290018807196",
  appId: "1:290018807196:web:1d60635abebc389876cc59",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const googleLogin = () =>
  signInWithPopup(auth, provider);

export const logout = () =>
  signOut(auth);    