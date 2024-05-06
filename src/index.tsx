import React from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import Search from "./pages/search/search";
import Player from "./pages/player/player";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuqrrRjjjHV3A9pysLX5Z_3yIgAdrnw7w",
  authDomain: "dj-4d53a.firebaseapp.com",
  databaseURL: "https://dj-4d53a-default-rtdb.firebaseio.com",
  projectId: "dj-4d53a",
  storageBucket: "dj-4d53a.appspot.com",
  messagingSenderId: "398294135984",
  appId: "1:398294135984:web:8c23a4ef35f624db21b775",
  measurementId: "G-HDBTVM9YYH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
