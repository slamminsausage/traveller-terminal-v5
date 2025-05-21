// src/components/QRCodeGenerator.jsx
import React, { useState } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeGenerator() {
  const [pageId, setPageId] = useState("eclipseshard");
  const [baseUrl, setBaseUrl] = useState("https://traveller-terminal-v5.netlify.app");
  
  // List of all available hidden pages
  const availablePages = [
    { id: "eclipseshard", name: "Eclipse Shard Data" },
    { id: "blacktalonops", name: "Black Talon Operations" },
    { id: "blacksite", name: "Blacksite ES1 Location" },
    { id: "sayelle", name: "Sayelle Enhancement Records" },
    { id: "fuwnet", name: "FUW Resistance Intel" }, // Changed from "fuw" to "fuwnet"
    { id: "wantedboard", name: "Black Web Wanted Board" }
  ];
  
  // Ensure the base URL doesn't have a trailing slash when we concatenate
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const fullUrl = `${normalizedBaseUrl}/#/hidden/${pageId}`;

  const downloadQRCode = () => {
    const svgElement = document.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 200;
    
    // Create image from SVG
    const img = new Image();
    img.onload = function() {
      // Draw white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Create download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${pageId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4">
      <h1 className="text-green-400 font-mono text-xl mb-4">QR Code Generator</h1>
      
      <Card className="w-full max-w-md border-green-400 border-2 mb-4">
        <CardContent>
          <div className="mb-4">
            <label className="text-green-400 font-mono block mb-2">Base URL:</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://traveller-terminal-v5.netlify.app"
            />
          </div>
          
          <div className="mb-4">
            <label className="text-green-400 font-mono block mb-2">Select Hidden Page:</label>
            <select 
              className="bg-black text-green-400 border border-green-400 p-2 w-full font-mono focus:outline-none"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            >
              {availablePages.map(page => (
                <option key={page.id} value={page.id}>{page.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-green-400 font-mono text-sm mb-4">
            Full URL: {fullUrl}
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-md border-green-400 border-2">
        <CardContent className="flex flex-col items-center">
          <div className="p-4 bg-white mb-4">
            <QRCodeSVG 
              value={fullUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-green-400 font-mono text-center mb-4">
            <p>Print this QR code and include it on your physical handout.</p>
            <p>When players scan it, they'll access the hidden page.</p>
          </div>
          
          <Button onClick={downloadQRCode}>
            DOWNLOAD QR CODE
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}