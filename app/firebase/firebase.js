import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKJTxqTvgzzRs04cUeoSmbehGGIWp_-Vo",
  authDomain: "parkeasy-12dac.firebaseapp.com",
  projectId: "parkeasy-12dac",
  storageBucket: "parkeasy-12dac.appspot.com",
  messagingSenderId: "966186455169",
  appId: "1:966186455169:web:af4a3fe3d2f1f974ecfd80"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



export const googleProvider = new GoogleAuthProvider();

export const createUserWithRole = async (uid, email, role) => {
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    role,
  });
};