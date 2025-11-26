// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const CHISMOSO_ERES_NO = import.meta.env.VITE_CHISMOSO_ERES_NO
const API_AUTH_DOMAIN = import.meta.env.VITE_AUTH_DOMAIN
const API_PROJECT_ID = import.meta.env.VITE_PROJECT_ID
const API_STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET
const API_MESSAGING_SENDER_ID = import.meta.env.VITE_MESSAGING_SENDER_ID
const API_APP_ID = import.meta.env.VITE_APP_ID
const API_MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: CHISMOSO_ERES_NO,
  authDomain: API_AUTH_DOMAIN,
  projectId: API_PROJECT_ID,
  storageBucket: API_STORAGE_BUCKET,
  messagingSenderId: API_MESSAGING_SENDER_ID,
  appId: API_APP_ID,
  measurementId: API_MEASUREMENT_ID
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebaseApp);

import { getMessaging } from "firebase/messaging";
export const messaging = getMessaging(firebaseApp);