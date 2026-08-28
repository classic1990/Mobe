import admin from "firebase-admin";
import fs from "node:fs";

const email=process.argv[2];
const key=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!email) throw new Error("Usage: npm run set-admin -- admin@example.com");
if(!key) throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.");

admin.initializeApp({credential:admin.credential.cert(JSON.parse(fs.readFileSync(key,"utf8")))});
const auth=admin.auth(); const db=admin.firestore();
const user=await auth.getUserByEmail(email);

await auth.setCustomUserClaims(user.uid,{admin:true,role:"superadmin"});
await db.collection("admins").doc(user.uid).set({
 uid:user.uid,email:user.email,role:"superadmin",active:true,createdAt:admin.firestore.FieldValue.serverTimestamp()
},{merge:true});

console.log(`Admin enabled for ${email}. Sign out/in again to refresh the token.`);
