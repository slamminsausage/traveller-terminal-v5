import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

const terminalStyle = {
  fontFamily: "monospace",
  color: "#33ff33",
  backgroundColor: "black",
  padding: "20px",
  minHeight: "400px",
  border: "2px solid #33ff33",
  borderRadius: "5px",
  boxShadow: "0 0 10px #33ff33"
};

// Tailwind-based styles for terminal input and buttons.
const terminalInputStyle =
  "bg-black text-green-400 border border-green-400 px-3 py-2 font-mono focus:outline-none";
const terminalButtonStyle =
  "bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500";

const terminals = {
  "lysani01": { requiresRoll: 8, logs: "/logs/lysani01.json" },
  "s.elara01": { requiresRoll: false, logs: "/logs/s.elara01.json" },
  "slocombe875": { requiresRoll: 8, logs: "/logs/slocombe875.json" },
  "waferterm01": { requiresRoll: false, logs: "/logs/waferterm01.json" },
  // Added new terminal labpc81 with a 6+ roll requirement
  "labpc81": { requiresRoll: 6, logs: "/logs/labpc81.json" }
};

// Recursive typing function using setTimeout.
const typeText = (text, setState, callback = null, index = 0) => {
  if (index < text.length) {
    setState((prev) => prev + text[index]);
    setTimeout(() => typeText(text, setState, callback, index + 1), 30);
  } else {
    if (callback) callback();
  }
};

export default function TravellerTerminal() {
  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  const [logData, setLogData] = useState(null);
  const [rollCheck, setRollCheck] = useState(null);
  const [specialRollCheck, setSpecialRollCheck] = useState(null);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [selectedLogData, setSelectedLogData] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [logTypingComplete, setLogTypingComplete] = useState(false);

  // Create a ref for the terminal content container
  const terminalContentRef = useRef(null);

  // Scroll the container to the bottom whenever displayedText updates.
  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [displayedText]);

  const handleAccessCode = () => {
    const terminal = terminals[inputCode];
    if (terminal) {
      setActiveTerminal(terminal);
      if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll, success: null });
      } else {
        fetchLogs(terminal.logs);
      }
    } else {
      typeText("ACCESS DENIED. INVALID CODE.", setTerminalData);
    }
    setInputCode("");
  };

  const handleRollCheck = (passed) => {
    if (passed) {
      if (activeTerminal) {
        fetchLogs(activeTerminal.logs);
      } else {
        typeText("ERROR: Terminal not found.", setTerminalData);
      }
    } else {
      typeText("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
    }
    setRollCheck(null);
  };

  // Updated special roll check handler to reveal the memo content after a successful roll
  const handleSpecialRollCheck = (passed) => {
    if (passed) {
      if (selectedLogData) {
        setDisplayedText("");
        setLogTypingComplete(false);
        if (selectedLogData.title === "Internal Memo - Urgent Subject Transfer") {
          // Combine the on_success message and the actual content.
          const combinedText =
            selectedLogData.roll_check.on_success + "\n\n" + selectedLogData.content;
          typeText(combinedText, setDisplayedText, () => {
            setLogTypingComplete(true);
          });
        } else if (selectedLogData.roll_check && selectedLogData.roll_check.on_success) {
          typeText(selectedLogData.roll_check.on_success, setDisplayedText, () => {
            setLogTypingComplete(true);
          });
        } else {
          typeText(selectedLogData.content, setDisplayedText, () => {
            setLogTypingComplete(true);
          });
        }
      } else {
        typeText("ERROR: Log not found.", setTerminalData);
      }
    } else {
      if (selectedLogData && selectedLogData.roll_check && selectedLogData.roll_check.on_failure) {
        typeText(selectedLogData.roll_check.on_failure, setTerminalData);
      } else {
        typeText("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
      }
      setSelectedLogData(null);
    }
    setSpecialRollCheck(null);
  };

  const fetchLogs = async (logPath) => {
    try {
      const response = await fetch(logPath);
      const data = await response.json();
      if (Array.isArray(data)) {
        setLogData(data);
      } else {
        setSelectedLogData(data);
        setDisplayedText("");
        setLogTypingComplete(false);
        typeText(data.content || "No data available.", setDisplayedText, () => {
          setLogTypingComplete(true);
        });
      }
    } catch (error) {
      typeText("ERROR LOADING LOGS.", setTerminalData);
    }
  };

  const handleLogClick = (log) => {
    // Modified condition: now "Internal Memo - Urgent Subject Transfer" also requires a special roll check.
    if (log.title === "Erased Transmission" || log.title === "Internal Memo - Urgent Subject Transfer") {
      setSelectedLogData(log);
      setSpecialRollCheck({ difficulty: log.roll_check.difficulty });
    } else {
      setSelectedLogData(log);
      setDisplayedText("");
      setLogTypingComplete(false);
      typeText(log.content, setDisplayedText, () => {
        setLogTypingComplete(true);
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Card className="w-[600px] border-green-400 border-2">
        <CardContent>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {/* Attach the ref here */}
            <div ref={terminalContentRef} style={terminalStyle} className="overflow-auto h-[300px] terminal">
              {specialRollCheck ? (
                <div>
                  <p>
                    Did you pass the {specialRollCheck.difficulty}+ check for{" "}
                    {selectedLogData ? selectedLogData.title : "this file"}?
                  </p>
                  <div className="flex gap-2">
                    <Button className={terminalButtonStyle} onClick={() => handleSpecialRollCheck(true)}>
                      Yes
                    </Button>
                    <Button className={terminalButtonStyle} onClick={() => handleSpecialRollCheck(false)}>
                      No
                    </Button>
                  </div>
                </div>
              ) : rollCheck ? (
                <div>
                  <p>
                    Did you pass the {rollCheck.difficulty}+ Electronics (Computers) check?
                  </p>
                  <div className="flex gap-2">
                    <Button className={terminalButtonStyle} onClick={() => handleRollCheck(true)}>
                      Yes
                    </Button>
                    <Button className={terminalButtonStyle} onClick={() => handleRollCheck(false)}>
                      No
                    </Button>
                  </div>
                </div>
              ) : selectedLogData ? (
                <div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{displayedText}</div>
                  {selectedLogData.audio_file && (
                    <audio
                      controls
                      style={{
                        backgroundColor: "black",
                        border: "1px solid #33ff33",
                        borderRadius: "5px",
                        width: "100%",
                        marginTop: "10px",
                        color: "#33ff33"
                      }}
                    >
                      <source src={selectedLogData.audio_file} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {logTypingComplete && (
                    <Button
                      className={terminalButtonStyle}
                      onClick={() => {
                        setSelectedLogData(null);
                        setDisplayedText("");
                        setLogTypingComplete(false);
                      }}
                    >
                      Back
                    </Button>
                  )}
                </div>
              ) : logData ? (
                <div>
                  {logData.map((log, index) => (
                    <p
                      key={index}
                      onClick={() => handleLogClick(log)}
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      {log.title}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="glitch-text">{terminalData || "ENTER ACCESS CODE TO PROCEED"}</p>
              )}
            </div>
          </motion.div>
          <div className="mt-4 flex gap-2">
            <Input
              className={terminalInputStyle}
              placeholder="Enter Access Code..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <Button className={terminalButtonStyle} onClick={handleAccessCode}>
              Enter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
