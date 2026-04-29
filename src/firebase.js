import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDf2oMvtItQQwlypZY5gUpQdK4nNsCnNAA",
    authDomain: "abdtodo-20238.firebaseapp.com",
    projectId: "abdtodo-20238",
    storageBucket: "abdtodo-20238.firebasestorage.app",
    messagingSenderId: "898393399692",
    appId: "1:898393399692:web:d9905bb86f14d08de8f6a9",
    measurementId: "G-84JDJBMSXR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'syncspace-app';