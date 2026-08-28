import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.js";

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function login(email,password) {
  return signInWithEmailAndPassword(auth,email,password);
}

export async function register(name,email,password) {
  const cred=await createUserWithEmailAndPassword(auth,email,password);
  if(name) await updateProfile(cred.user,{displayName:name});
  await setDoc(doc(db,"users",cred.user.uid),{
    uid:cred.user.uid,email,name,role:"user",vip:false,createdAt:serverTimestamp()
  },{merge:true});
  return cred;
}

export async function logout() {
  return signOut(auth);
}
