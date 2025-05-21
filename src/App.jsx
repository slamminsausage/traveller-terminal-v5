import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import TravellerTerminal from "./components/TravellerTerminal";
import PoopTerminal from "./components/PoopTerminal";
import QRCodeGenerator from "./components/QRCodeGenerator";
import HiddenPage from "./components/HiddenPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TravellerTerminal />} />
        <Route path="/poop" element={<PoopTerminal />} />
        <Route path="/admin/qr-generator" element={<QRCodeGenerator />} />
        <Route path="/hidden/:pageId" element={<HiddenPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;