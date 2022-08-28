import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { Header } from "./components/Header";
import { Web3ContextProvider } from "./context/Web3ContextProvider";
import { ErrorBanner } from "./components/ErrorBanner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3ContextProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <ErrorBanner />
      </Web3ContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
