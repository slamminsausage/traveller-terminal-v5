import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Terminal definitions including labpc81 and vanagandr001
const terminals = {
  "lysani01": { requiresRoll: 8, logs: "/logs/lysani01.json" },
  "s.elara01": { requiresRoll: false, logs: "/logs/s.elara01.json" },
  "slocombe875": { requiresRoll: 8, logs: "/logs/slocombe875.json" },
  "waferterm01": { requiresRoll: false, logs: "/logs/waferterm01.json" },
  "labpc81": { requiresRoll: 6, logs: "/logs/labpc81.json" },
  "vanagandr001": { requiresRoll: 7, logs: "/logs/vanagandr001.json" }
};

const typeText = (text, setState, callback = null, index = 0, delay = 30) => {
  if (index < text.length) {
    setState(prev => prev + text[index]);
    setTimeout(() => typeText(text, setState, callback, index + 1, delay), delay);
  } else {
    if (callback) callback();
  }
};

export default function TravellerTerminal() {
  const navigate = useNavigate();
  const [initText, setInitText] = useState("");
  const [initComplete, setInitComplete] = useState(false);
  const hasInitialized = useRef(false);

  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  const [logData, setLogData] = useState(null);
  const [rollCheck, setRollCheck] = useState(null);
  const [specialRollCheck, setSpecialRollCheck] = useState(null);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [selectedLogData, setSelectedLogData] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [logTypingComplete, setLogTypingComplete] = useState(false);

  // Password-related states
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);

  // Grouping state for grouped logs
  const [expandedGroup, setExpandedGroup] = useState(null);
  // State for displaying a separate page for grouped audio logs
  const [showAudioLogsPage, setShowAudioLogsPage] = useState(false);
  const [audioLogsData, setAudioLogsData] = useState([]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const loadingMessages = [
      "Initializing system...",
      "Connecting to network...",
      "Loading secure protocols...",
      "The Traveller Terminal is now online."
    ];
    let i = 0;
    const displayNextMessage = () => {
      if (i < loadingMessages.length) {
        typeText(loadingMessages[i] + "\n", setInitText, () => {
          setInitText(prev => prev + "\n");
          i++;
          displayNextMessage();
        }, 0, 50);
      } else {
        const welcomeMessage =
          "\nWelcome to The Traveller Terminal.\n" +
          "Type the name of a terminal to access its contents.\n\n";
        typeText(welcomeMessage, setInitText, () => {
          setInitComplete(true);
        }, 0, 50);
      }
    };
    displayNextMessage();
  }, []);

  const handleAccessCode = () => {
    // Check for our silly terminal first:
    if (inputCode.trim().toLowerCase() === "poop") {
      navigate("/poop");
      return;
    }
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

  const handleSpecialRollCheck = (passed) => {
    if (passed) {
      if (selectedLogData) {
        if (selectedLogData.logs) {
          setAudioLogsData(selectedLogData.logs);
          setShowAudioLogsPage(true);
        } else {
          setDisplayedText("");
          setLogTypingComplete(false);
          let message = "";
          if (selectedLogData.roll_check && selectedLogData.roll_check.on_success) {
            message = selectedLogData.content + "\n\n" + selectedLogData.roll_check.on_success;
          } else {
            message = selectedLogData.content;
          }
          typeText(message, setDisplayedText, () => {
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
    setPasswordAttempts(0);
    setIsPasswordUnlocked(false);
    setPasswordInput("");
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
    setSelectedLogData(log);
    setExpandedGroup(null);
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsPasswordUnlocked(false);
    if (log.logs) {
      if (log.requires_password) {
        setRequiresPassword(true);
      } else {
        setAudioLogsData(log.logs);
        setShowAudioLogsPage(true);
      }
    } else if (log.requires_password) {
      setRequiresPassword(true);
    } else {
      if (log.requires_roll && log.roll_check && log.roll_check.difficulty === 10) {
        setSpecialRollCheck({ difficulty: log.roll_check.difficulty });
      } else {
        setDisplayedText("");
        setLogTypingComplete(false);
        typeText(log.content, setDisplayedText, () => {
          setLogTypingComplete(true);
        });
      }
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === selectedLogData.password) {
      setIsPasswordUnlocked(true);
      setRequiresPassword(false);
      if (selectedLogData.logs) {
        setAudioLogsData(selectedLogData.logs);
        setShowAudioLogsPage(true);
      } else {
        setDisplayedText("");
        setLogTypingComplete(false);
        typeText(selectedLogData.content, setDisplayedText, () => {
          setLogTypingComplete(true);
        });
      }
    } else {
      const attempts = passwordAttempts + 1;
      setPasswordAttempts(attempts);
      if (attempts >= (selectedLogData.attemptsAllowed || 3)) {
        setRequiresPassword(false);
        setSpecialRollCheck({ difficulty: selectedLogData.roll_check.difficulty });
      } else {
        typeText("Incorrect password. Please try again.", setTerminalData);
      }
    }
  };

  if (showAudioLogsPage) {
    return (
      <div className="flex flex-col items-center h-screen bg-black">
        <h1 className="text-green-400 font-mono text-xl my-4">Encrypted Audio Logs</h1>
        <div className="w-full max-w-md border-green-400 border-2 p-4 overflow-auto">
          {audioLogsData.map((log, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h2 className="text-green-400 font-mono">{log.title}</h2>
              <p className="text-green-400 font-mono" style={{ whiteSpace: "pre-wrap" }}>{log.content}</p>
              {log.audio_file && (
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
                  <source src={log.audio_file} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          ))}
          <Button
            className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-4"
            onClick={() => {
              setShowAudioLogsPage(false);
              setAudioLogsData([]);
              setSelectedLogData(null);
            }}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen bg-black">
      <div
        style={{
          fontFamily: "monospace",
          color: "#33ff33",
          whiteSpace: "pre-wrap",
          marginBottom: "10px",
          textAlign: "center"
        }}
      >
        {initText}
      </div>
      <Card className="w-full max-w-md border-green-400 border-2">
        <CardContent>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <div className="terminal overflow-auto h-[300px]">
              {specialRollCheck ? (
                <div>
                  <p>
                    Did you pass the {specialRollCheck.difficulty}+ check for{" "}
                    {selectedLogData ? selectedLogData.title : "this file"}?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={() => handleSpecialRollCheck(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={() => handleSpecialRollCheck(false)}
                    >
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
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={() => handleRollCheck(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={() => handleRollCheck(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ) : selectedLogData && requiresPassword && !isPasswordUnlocked ? (
                <div>
                  <p>
                    Password required for {selectedLogData.title}. Attempts remaining:{" "}
                    {(selectedLogData.attemptsAllowed || 3) - passwordAttempts}
                  </p>
                  <Input
                    className="bg-black text-green-400 border border-green-400 px-3 py-2 font-mono focus:outline-none"
                    placeholder="Enter Password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    type="password"
                  />
                  <Button
                    className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2"
                    onClick={handlePasswordSubmit}
                  >
                    Submit
                  </Button>
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
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2"
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
                  {logData.map((log, index) => {
                    if (log.logs) {
                      return (
                        <div key={index}>
                          <p
                            onClick={() => handleLogClick(log)}
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                          >
                            {log.title}
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <p
                          key={index}
                          onClick={() => handleLogClick(log)}
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                        >
                          {log.title}
                        </p>
                      );
                    }
                  })}
                </div>
              ) : (
                <p className="glitch-text">
                  {terminalData || "ENTER ACCESS CODE TO PROCEED"}
                </p>
              )}
            </div>
          </motion.div>
          <div className="mt-4 flex gap-2">
            <Input
              className="bg-black text-green-400 border border-green-400 px-3 py-2 font-mono focus:outline-none"
              placeholder="Enter Access Code..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <Button
              className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
              onClick={handleAccessCode}
            >
              Enter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
