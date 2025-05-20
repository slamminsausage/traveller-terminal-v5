import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Character set for corruption effects
const corruptionCharacters = "!@#$%^&*()_+-=[]{}|;:,./<>?`~¡™£¢∞§¶•ªº–≠";

/**
 * Corrupts a portion of the text for an immersive glitched terminal effect
 * @param {string} text - The text to corrupt
 * @param {number} corruptionLevel - Between 0 and 1, how severe the corruption should be
 * @param {boolean} isEclipseShard - Whether this is Eclipse Shard content (special effects)
 * @returns {string} - The corrupted text
 */
const applyTextCorruption = (text, corruptionLevel = 0.02, isEclipseShard = false) => {
  if (!text) return "";
  
  // Split text into lines to preserve formatting
  const lines = text.split('\n');
  
  // Process each line
  const corruptedLines = lines.map(line => {
    // Skip empty lines
    if (line.trim() === '') return line;
    
    let corruptedLine = '';
    
    // Process each character
    for (let i = 0; i < line.length; i++) {
      // Eclipse Shard content gets special treatment
      if (isEclipseShard && 
         (line.includes("SHARD") || line.includes("Eclipse") || line.includes("Trevar")) && 
         Math.random() < 0.2) {
        // Create clusters of corruption around mentions of the Shard
        if (line.substring(i, i+5) === "SHARD" || 
            (i >= 5 && line.substring(i-5, i) === "SHARD") ||
            line.substring(i, i+7) === "Eclipse" || 
            (i >= 7 && line.substring(i-7, i) === "Eclipse") ||
            line.substring(i, i+6) === "Trevar" || 
            (i >= 6 && line.substring(i-6, i) === "Trevar")) {
          // Higher corruption near keyword mentions
          if (Math.random() < 0.4) {
            corruptedLine += corruptionCharacters.charAt(
              Math.floor(Math.random() * corruptionCharacters.length)
            );
            continue;
          }
        }
      }
      
      // Regular corruption chance based on corruptionLevel
      if (Math.random() < corruptionLevel) {
        // Replace with a random corruption character
        corruptedLine += corruptionCharacters.charAt(
          Math.floor(Math.random() * corruptionCharacters.length)
        );
      } else {
        // Keep original character
        corruptedLine += line[i];
      }
    }
    
    return corruptedLine;
  });
  
  return corruptedLines.join('\n');
};

// Get terminal effect classes based on terminal type
const getTerminalEffectClasses = (terminalId) => {
  if (!terminalId) return "terminal terminal-flicker";
  
  // Extract the terminal ID from the logs path if needed
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  // Define terminals that should have more severe effects
  const damagedTerminals = ["blacksite-es1", "sayelle-logs", "vennik-personal"];
  const minorGlitchTerminals = ["fuwnet", "vanagandr001", "fuw01", "blacktalon"];
  
  if (damagedTerminals.includes(terminalName)) {
    return "terminal terminal-severe-flicker terminal-scanlines";
  } else if (minorGlitchTerminals.includes(terminalName)) {
    return "terminal terminal-flicker terminal-scanlines";
  } else {
    // Default terminals have subtle effects
    return "terminal terminal-flicker";
  }
};

// Function to check if content should be corrupted
const shouldCorruptContent = (content, terminalId) => {
  if (!content || !terminalId) return false;
  
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  // Define which terminals should have corrupted text
  const corruptTerminals = ["blacksite-es1", "vennik-personal", "sayelle-logs", "blacktalon"];
  
  return corruptTerminals.includes(terminalName) || 
         content.includes("Eclipse Shard") || 
         content.includes("ES1") ||
         content.includes("Trevar");
};

// Get corruption level and type for specific terminal content
const getCorruptionParams = (content, terminalId) => {
  if (!content || !terminalId) return { level: 0, isEclipseShard: false };
  
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  // Check for Eclipse Shard content
  const isEclipseContent = content.includes("Eclipse Shard") || 
                         content.includes("ES1") ||
                         terminalName === "blacksite-es1";
                         
  // Check for other special terminals
  const isSayelleLog = terminalName.includes("sayelle");
  const isBlacksiteLog = terminalName.includes("blacksite");
  
  if (isEclipseContent) {
    return { level: 0.03, isEclipseShard: true };
  } else if (isBlacksiteLog) {
    return { level: 0.02, isEclipseShard: false };
  } else if (isSayelleLog) {
    return { level: 0.015, isEclipseShard: false };
  } else {
    return { level: 0.01, isEclipseShard: false };
  }
};

// Terminal definitions including all terminals
const terminals = {
  "lysani01": { requiresRoll: 8, logs: "/logs/lysani01.json" },
  "s.elara01": { requiresRoll: false, logs: "/logs/s.elara01.json" },
  "slocombe875": { requiresRoll: 8, logs: "/logs/slocombe875.json" },
  "waferterm01": { requiresRoll: false, logs: "/logs/waferterm01.json" },
  "labpc81": { requiresRoll: 6, logs: "/logs/labpc81.json" },
  "vanagandr001": { requiresRoll: 8, logs: "/logs/vanagandr001.json" },
  // New terminals for Caldonis:
  "blackcircuit01": { requiresRoll: 8, logs: "/logs/blackcircuit01.json" },
  "fuw01": { requiresRoll: 8, logs: "/logs/fuw01.json" },
  "azura01": { requiresRoll: 10, logs: "/logs/azura01.json" },
  "vennik01": { 
    requiresRoll: 12, 
    logs: "/logs/vennik01.json",
    requiresPassword: true,
    password: "vennik4ever"
  },
  "caldonis_public": { requiresRoll: false, logs: "/logs/caldonis_public.json" }, // Added comma here
  // Add these new secret terminals with correct syntax
  "blacksite-es1": { requiresRoll: 10, logs: "/logs/blacksite-es1.json" },
  "blacktalon": { requiresRoll: 12, logs: "/logs/blacktalon.json" },
  "vennik-personal": { requiresRoll: 10, logs: "/logs/vennik-personal.json" },
  "sayelle-logs": { requiresRoll: 8, logs: "/logs/sayelle-logs.json" },
  "fuwnet": { requiresRoll: 8, logs: "/logs/fuw-network.json" }
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
  const typingRef = useRef(null);
  
  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  const [logData, setLogData] = useState(null);
  const [rollCheck, setRollCheck] = useState(null);
  const [specialRollCheck, setSpecialRollCheck] = useState(null);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [selectedLogData, setSelectedLogData] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [logTypingComplete, setLogTypingComplete] = useState(false);
  const [currentView, setCurrentView] = useState("init"); // "init", "terminal", "log"

  // Password-related states
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [terminalPasswordInput, setTerminalPasswordInput] = useState("");
  const [terminalPasswordRequired, setTerminalPasswordRequired] = useState(false);
  const [terminalPasswordAttempts, setTerminalPasswordAttempts] = useState(0);

  // Grouping state for grouped logs
  const [expandedGroup, setExpandedGroup] = useState(null);
  // State for displaying a separate page for grouped audio logs
  const [showAudioLogsPage, setShowAudioLogsPage] = useState(false);
  const [audioLogsData, setAudioLogsData] = useState([]);
  
  // New states for screen flicker effects
  const [severeMalfunction, setSevereMalfunction] = useState(false);
  const [glitchText, setGlitchText] = useState("");
  const terminalRef = useRef(null);

  // Random severe glitch effect
  useEffect(() => {
    if (!activeTerminal || !selectedLogData) return;
    
    // Only enable for certain terminal types
    const terminalName = activeTerminal.logs.replace("/logs/", "").replace(".json", "");
    const glitchEnabledTerminals = ["blacksite-es1", "vennik-personal", "fuwnet", "sayelle-logs", "blacktalon"];
    
    if (glitchEnabledTerminals.includes(terminalName)) {
      // Random chance to trigger a glitch
      const randomGlitch = () => {
        // 5% chance of a glitch
        if (Math.random() < 0.05) {
          // Trigger a glitch effect
          setSevereMalfunction(true);
          
          // Generate glitch text
          const glitchMessages = [
            "WARNING: SIGNAL INTEGRITY FAILING",
            "CRC ERROR DETECTED IN DATA STREAM",
            "QUANTUM FLUCTUATION DETECTED",
            "TEMPORAL ANOMALY IN DATA BUFFER",
            "WARNING: REALITY ANCHOR DESTABILIZING",
            "SECURITY BREACH ATTEMPT DETECTED"
          ];
          
          // Pick a random message
          setGlitchText(glitchMessages[Math.floor(Math.random() * glitchMessages.length)]);
          
          // Clear the glitch after a short time
          setTimeout(() => {
            setSevereMalfunction(false);
            setGlitchText("");
          }, 1500);
        }
      };
      
      // Set up interval for random glitches
      const glitchInterval = setInterval(randomGlitch, 10000); // Check every 10 seconds
      
      return () => {
        clearInterval(glitchInterval);
      };
    }
  }, [selectedLogData, activeTerminal]);

  // Function to handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Stop the typing animation and show full text
        if (currentView === "log" && !logTypingComplete) {
          setLogTypingComplete(true);
          // Clear the typing timeout
          if (typingRef.current) {
            clearTimeout(typingRef.current);
          }
          // If this is a log with content, show it all
          if (selectedLogData) {
            let fullText = "";
            if (selectedLogData.roll_check && selectedLogData.roll_check.on_success) {
              fullText = selectedLogData.roll_check.on_success + "\n\n";
            }
            fullText += `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
            
            // Apply corruption if needed
            if (activeTerminal && shouldCorruptContent(fullText, activeTerminal.logs)) {
              const { level, isEclipseShard } = getCorruptionParams(fullText, activeTerminal.logs);
              fullText = applyTextCorruption(fullText, level, isEclipseShard);
            }
            
            setDisplayedText(fullText);
          }
        }
        // Navigate back based on current view
        else if (currentView === "log") {
          handleBackToTerminal();
        } 
        else if (currentView === "terminal") {
          handleBackToInit();
        }
      }
      else if (e.key === "Enter") {
        // Handle terminal password submission
        if (terminalPasswordRequired) {
          handleTerminalPasswordSubmit();
        }
        // Handle individual log password submission
        else if (requiresPassword && !isPasswordUnlocked) {
          handlePasswordSubmit();
        }
        // Handle main terminal code input
        else if (currentView === "init" && inputCode.trim() !== "") {
          handleAccessCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentView, logTypingComplete, selectedLogData, terminalPasswordRequired, 
      terminalPasswordInput, requiresPassword, isPasswordUnlocked, inputCode, activeTerminal]);
  
  // Auto scroll terminal to keep content in view
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedText, terminalData, logTypingComplete, currentView]);

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
          "Type the name of a terminal to access its contents.\n" +
          "Press ESC at any time to go back.\n\n";
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
      setCurrentView("terminal");
      
      // Check if the terminal requires a password
      if (terminal.requiresPassword && !isPasswordUnlocked) {
        setTerminalPasswordRequired(true);
      } 
      else if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll, success: null });
      } else {
        fetchLogs(terminal.logs);
      }
    } else {
      typeText("ACCESS DENIED. INVALID CODE.", setTerminalData);
    }
    setInputCode("");
  };

  const handleTerminalPasswordSubmit = () => {
    if (activeTerminal && terminalPasswordInput === activeTerminal.password) {
      setTerminalPasswordRequired(false);
      setIsPasswordUnlocked(true);
      
      // If password is correct, bypass the roll check entirely and fetch logs directly
      fetchLogs(activeTerminal.logs);
    } else {
      const attempts = terminalPasswordAttempts + 1;
      setTerminalPasswordAttempts(attempts);
      setTerminalPasswordInput("");
      
      if (attempts >= 3) { // After 3 failed attempts
        setTerminalPasswordRequired(false);
        
        if (activeTerminal && activeTerminal.requiresRoll) {
          setRollCheck({ difficulty: activeTerminal.requiresRoll, success: null });
          typeText("Maximum password attempts reached. Attempting alternate access method...", setTerminalData);
        } else {
          typeText("ACCESS DENIED. MAXIMUM ATTEMPTS REACHED.", setTerminalData);
          handleBackToInit();
        }
      } else {
        typeText(`ACCESS DENIED. INVALID PASSWORD. ${3 - attempts} attempts remaining.`, setTerminalData);
      }
    }
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
          setCurrentView("log");
          
          let message = "";
          if (selectedLogData.roll_check && selectedLogData.roll_check.on_success) {
            message = selectedLogData.roll_check.on_success + "\n\n";
            message += `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
          } else {
            message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
          }
          
          // Apply corruption if appropriate for this content
          if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
            const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
            message = applyTextCorruption(message, level, isEclipseShard);
          }
          
          // Store the typing function reference so we can cancel it with ESC key
          const typeWithRef = (text, setState, callback = null, index = 0, delay = 30) => {
            if (index < text.length) {
              setState(prev => prev + text[index]);
              typingRef.current = setTimeout(
                () => typeWithRef(text, setState, callback, index + 1, delay), 
                delay
              );
            } else {
              typingRef.current = null;
              if (callback) callback();
            }
          };
          
          typeWithRef(message, setDisplayedText, () => {
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
        setCurrentView("log");
        setDisplayedText("");
        setLogTypingComplete(false);
        
        let message = `Date: ${data.date}\nAuthor: ${data.author}\n\n${data.content || "No data available."}`;
        
        // Apply corruption if appropriate for this content
        if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
          const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
          message = applyTextCorruption(message, level, isEclipseShard);
        }
        
        // Store the typing function reference so we can cancel it with ESC key
        const typeWithRef = (text, setState, callback = null, index = 0, delay = 30) => {
          if (index < text.length) {
            setState(prev => prev + text[index]);
            typingRef.current = setTimeout(
              () => typeWithRef(text, setState, callback, index + 1, delay), 
              delay
            );
          } else {
            typingRef.current = null;
            if (callback) callback();
          }
        };
        
        typeWithRef(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        });
      }
    } catch (error) {
      typeText("ERROR LOADING LOGS.", setTerminalData);
    }
  };

  const handleLogClick = (log) => {
    setSelectedLogData(log);
    setCurrentView("log");
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
      if (log.requires_roll && log.roll_check && log.roll_check.difficulty >= 10) {
        setSpecialRollCheck({ difficulty: log.roll_check.difficulty });
      } else {
        setDisplayedText("");
        setLogTypingComplete(false);
        
        let message = `Date: ${log.date}\nAuthor: ${log.author}\n\n${log.content}`;
        
// Apply corruption if appropriate for this content
        if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
          const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
          message = applyTextCorruption(message, level, isEclipseShard);
        }
        
        // Store the typing function reference so we can cancel it with ESC key
        const typeWithRef = (text, setState, callback = null, index = 0, delay = 30) => {
          if (index < text.length) {
            setState(prev => prev + text[index]);
            typingRef.current = setTimeout(
              () => typeWithRef(text, setState, callback, index + 1, delay), 
              delay
            );
          } else {
            typingRef.current = null;
            if (callback) callback();
          }
        };
        
        typeWithRef(message, setDisplayedText, () => {
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
        
        let message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
        
        // Apply corruption if appropriate for this content
        if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
          const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
          message = applyTextCorruption(message, level, isEclipseShard);
        }
        
        typeText(message, setDisplayedText, () => {
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

  const handleBackToTerminal = () => {
    setSelectedLogData(null);
    setDisplayedText("");
    setLogTypingComplete(false);
    setCurrentView("terminal");
    // Cancel any ongoing typing
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  const handleBackToInit = () => {
    setLogData(null);
    setActiveTerminal(null);
    setTerminalData("");
    setCurrentView("init");
    setTerminalPasswordRequired(false);
    setTerminalPasswordInput("");
    setTerminalPasswordAttempts(0);
    setIsPasswordUnlocked(false);
  };

  if (showAudioLogsPage) {
    return (
      <div className="flex flex-col items-center h-screen bg-black">
        <h1 className="text-green-400 font-mono text-xl my-4 terminal-flicker">Encrypted Audio Logs</h1>
        <div className="w-full max-w-md border-green-400 border-2 p-4 overflow-auto terminal-flicker">
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
              setCurrentView("terminal");
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
      {currentView === "init" && (
        <div
          style={{
            fontFamily: "monospace",
            color: "#33ff33",
            whiteSpace: "pre-wrap",
            marginBottom: "10px",
            textAlign: "center"
          }}
          className="terminal-flicker"
        >
          {initText}
        </div>
      )}
      <Card className="w-full max-w-md border-green-400 border-2">
        <CardContent>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <div 
              className={activeTerminal ? getTerminalEffectClasses(activeTerminal.logs) : "terminal terminal-flicker"} 
              style={{ overflow: "auto", height: "300px", position: "relative" }}
              ref={terminalRef}
            >
              {/* Severe malfunction glitch overlay */}
              {severeMalfunction && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                  <div className="text-red-500 font-mono text-xl severe-glitch p-4 border border-red-500">
                    {glitchText}
                  </div>
                </div>
              )}
              
              {terminalPasswordRequired ? (
                <div>
                  <p>
                    Terminal requires password authentication.
                  </p>
                  <p>
                    Attempts remaining: {3 - terminalPasswordAttempts}
                  </p>
                  <div className="mt-4">
                    <Input
                      className="bg-black text-green-400 border border-green-400 px-3 py-2 font-mono focus:outline-none"
                      placeholder="Enter Password"
                      value={terminalPasswordInput}
                      onChange={(e) => setTerminalPasswordInput(e.target.value)}
                      type="password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleTerminalPasswordSubmit();
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                        onClick={handleTerminalPasswordSubmit}
                      >
                        Submit
                      </Button>
                      <Button
                        className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                        onClick={handleBackToInit}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              ) : specialRollCheck ? (
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={handlePasswordSubmit}
                    >
                      Submit
                    </Button>
                    <Button
                      className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                      onClick={handleBackToTerminal}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : selectedLogData ? (
                <div className="terminal-glitch">
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
                      onClick={handleBackToTerminal}
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
                  <Button
                    className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2"
                    onClick={handleBackToInit}
                  >
                    Back
                  </Button>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAccessCode();
                }
              }}
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