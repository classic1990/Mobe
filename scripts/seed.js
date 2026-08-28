import admin from "firebase-admin";
import fs from "node:fs";

const key=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!key) throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.");
admin.initializeApp({credential:admin.credential.cert(JSON.parse(fs.readFileSync(key,"utf8")))});
const db=admin.firestore();

const genres=[
 ["action","Action","แอ็กชัน"],["adventure","Adventure","ผจญภัย"],["animation","Animation","แอนิเมชัน"],
 ["comedy","Comedy","ตลก"],["crime","Crime","อาชญากรรม"],["drama","Drama","ดราม่า"],
 ["horror","Horror","สยองขวัญ"],["romance","Romance","โรแมนติก"],["sci-fi","Sci-Fi","ไซไฟ"],
 ["thriller","Thriller","ระทึกขวัญ"]
];

for(const [id,name,nameTH] of genres)
 await db.collection("genres").doc(id).set({name,nameTH,slug:id,active:true},{merge:true});

await db.collection("settings").doc("config").set({
 siteName:"DUY-ดู-DEE",siteDescription:"ดูหนังและซีรีส์",maintenance:false,registration:true
},{merge:true});

console.log("Seed complete.");
