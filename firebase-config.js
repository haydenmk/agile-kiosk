/*
 * Firebase connection settings for the shared (online) kiosk content.
 *
 * These values identify your Firebase project. They are meant to be public
 * (they ship to every browser), so it is fine that they live in this repo.
 * What protects your data is the Firestore rules, not these values.
 *
 * To turn online sync off, delete this file or set the value below to null.
 */
window.KIOSK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgu1UO3d_MuoA9q7AjS8LJxG2hdWs9OUc",
  authDomain: "ics-418-kiosk-app.firebaseapp.com",
  projectId: "ics-418-kiosk-app",
  storageBucket: "ics-418-kiosk-app.firebasestorage.app",
  messagingSenderId: "760373411378",
  appId: "1:760373411378:web:71a51ccda1ccbfacae462b"
};
