// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNLPoiD-RQmTgdAVIzK7e7T1kdK5lIKLQ",
  authDomain: "something-unique-93e58.firebaseapp.com",
  projectId: "something-unique-93e58",
  storageBucket: "something-unique-93e58.appspot.com",
  messagingSenderId: "871063169716",
  appId: "1:871063169716:web:69c993fbece15fee4645e1",
  measurementId: "G-R6P5NC7CJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);