/**
 * Firebase 延遲初始化。
 *
 * 原本在模組載入時就 import 並初始化 Firebase，導致 firebase/app 與
 * firebase/auth（壓縮後約 300 KB）被打進首屏 bundle —— 但真正需要它的只有
 * 社群登入這一個動作。改成動態 import 後，只有使用者按下 Google / Facebook
 * 登入或執行登出時才會下載，且結果會被快取，不會重複初始化。
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** 快取初始化結果（含進行中的 Promise），避免重複下載與重複 initializeApp */
let firebasePromise = null;

const initFirebase = async () => {
  const [{ initializeApp }, authModule] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]);

  const {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signOut,
  } = authModule;

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');

  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');

  return { app, auth, googleProvider, facebookProvider, signInWithPopup, signOut };
};

/** 取得（必要時才載入）Firebase 相關物件 */
export const getFirebase = () => {
  if (!firebasePromise) firebasePromise = initFirebase();
  return firebasePromise;
};

/** 依名稱取得 OAuth provider */
export const getProvider = async (name) => {
  const firebase = await getFirebase();
  return name === 'facebook' ? firebase.facebookProvider : firebase.googleProvider;
};

/** 社群登入，回傳 Firebase ID Token */
export const socialSignIn = async (providerName) => {
  const { auth, signInWithPopup } = await getFirebase();
  const provider = await getProvider(providerName);
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
};

/**
 * 登出。
 * 若使用者從未觸發過社群登入，就沒有必要為了登出而下載整個 Firebase SDK。
 */
export const firebaseSignOut = async () => {
  if (!firebasePromise) return;
  const { auth, signOut } = await getFirebase();
  await signOut(auth);
};
