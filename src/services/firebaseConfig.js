import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDb9nhoeH3HQt7JdBSVP2ZsJ6H9OvA8jLM",
  authDomain: "fir-test-72c79.firebaseapp.com",
  projectId: "fir-test-72c79",
  storageBucket: "fir-test-72c79.appspot.com",
  messagingSenderId: "458279712096",
  appId: "1:458279712096:web:66d38d9611c71ee4645a05"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };