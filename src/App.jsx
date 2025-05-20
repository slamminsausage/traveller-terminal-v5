// src/App.jsx with updated routes
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravellerTerminal from "./components/TravellerTerminal";
import PoopTerminal from "./components/PoopTerminal";
import HiddenPage from "./components/HiddenPage";
import QRCodeGenerator from "./components/QRCodeGenerator";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravellerTerminal />} />
        <Route path="/poop" element={<PoopTerminal />} />
        <Route path="/hidden/:pageId" element={<HiddenPage />} />
        <Route path="/admin/qr-generator" element={<QRCodeGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;