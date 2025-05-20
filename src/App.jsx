import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravellerTerminal from "./components/TravellerTerminal";
import PoopTerminal from "./components/PoopTerminal";
import QRCodeGenerator from "./components/QRCodeGenerator";
import HiddenPage from "./components/HiddenPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravellerTerminal />} />
        <Route path="/poop" element={<PoopTerminal />} />
        <Route path="/admin/qr-generator" element={<QRCodeGenerator />} />
        <Route path="/hidden/:pageId" element={<HiddenPage />} />
      </Routes>
    </Router>
  );
}

export default App;