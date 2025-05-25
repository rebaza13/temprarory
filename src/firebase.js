import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5g-XSBNweol_znaUexhymNK02w6dgYnk",
  authDomain: "shop-a-76f45.firebaseapp.com",
  projectId: "shop-a-76f45",
  storageBucket: "shop-a-76f45.firebasestorage.app",
  messagingSenderId: "1026955278485",
  appId: "1:1026955278485:web:bd4a217000521f2291c39c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
