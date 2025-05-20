import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravellerTerminal from "./components/TravellerTerminal";
import PoopTerminal from "./components/PoopTerminal";
import QRCodeGenerator from "./components/QRCodeGenerator"; // Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravellerTerminal />} />
        <Route path="/poop" element={<PoopTerminal />} />
        <Route path="/admin/qr-generator" element={<QRCodeGenerator />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;