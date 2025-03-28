import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8_6FQflRq2Pm91HWMxJ1ZaJzXb9xaAjU",
  authDomain: "taiwancultureproject.firebaseapp.com",
  projectId: "taiwancultureproject",
  storageBucket: "taiwancultureproject.firebasestorage.app",
  messagingSenderId: "14090914910",
  appId: "1:14090914910:web:3b7caa65d640d7a59ab8cf"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider, signInWithPopup, signOut  };