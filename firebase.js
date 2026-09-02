import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPpIZ595LggROi8Le3kLn8VbEvOXGBRo4",
  authDomain: "happy-holiday-board.firebaseapp.com",
  projectId: "happy-holiday-board",
  storageBucket: "happy-holiday-board.firebasestorage.app",
  messagingSenderId: "1025901483290",
  appId: "1:1025901483290:web:68d46ec15ee23fccd248a3",
  measurementId: "G-5CVY382T0H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);