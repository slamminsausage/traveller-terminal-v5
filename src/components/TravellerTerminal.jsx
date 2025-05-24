import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SignalInterference from './SignalInterference';
import AudioManager from '../utils/AudioManager';

// Character set for corruption effects
const corruptionCharacters = "!@#$%^&*()_+-=[]{}|;:,./<>?`~¡™£¢∞§¶•ªº–≠";

// Apply text corruption for glitch effects
const applyTextCorruption = (text, corruptionLevel = 0.02, isEclipseShard = false) => {
  if (!text) return "";
  
  const lines = text.split('\n');
  const corruptedLines = lines.map(line => {
    if (line.trim() === '') return line;
    
    let corruptedLine = '';
    for (let i = 0; i < line.length; i++) {
      if (isEclipseShard && 
         (line.includes("SHARD") || line.includes("Eclipse") || line.includes("Trevar")) && 
         Math.random() < 0.2) {
        if (Math.random() < 0.4) {
          corruptedLine += corruptionCharacters.charAt(
            Math.floor(Math.random() * corruptionCharacters.length)
          );
          continue;
        }
      }
      
      if (Math.random() < corruptionLevel) {
        corruptedLine += corruptionCharacters.charAt(
          Math.floor(Math.random() * corruptionCharacters.length)
        );
      } else {
        corruptedLine += line[i];
      }
    }
    return corruptedLine;
  });
  
  return corruptedLines.join('\n');
};

// Get terminal visual effects based on type
const getTerminalEffectClasses = (terminalId) => {
  if (!terminalId) return "terminal terminal-flicker";
  
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  const damagedTerminals = ["blacksite-es1", "sayelle-logs", "vennik-personal"];
  const minorGlitchTerminals = ["fuwnet", "vanagandr001", "fuw01", "blacktalon"];
  
  if (damagedTerminals.includes(terminalName)) {
    return "terminal terminal-severe-flicker terminal-scanlines";
  } else if (minorGlitchTerminals.includes(terminalName)) {
    return "terminal terminal-flicker terminal-scanlines";
  }
  return "terminal terminal-flicker";
};

// Check if content should be corrupted
const shouldCorruptContent = (content, terminalId) => {
  if (!content || !terminalId) return false;
  
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  const corruptTerminals = ["blacksite-es1", "vennik-personal", "sayelle-logs", "blacktalon"];
  
  return corruptTerminals.includes(terminalName) || 
         content.includes("Eclipse Shard") || 
         content.includes("ES1") ||
         content.includes("Trevar");
};

// Get corruption parameters
const getCorruptionParams = (content, terminalId) => {
  if (!content || !terminalId) return { level: 0, isEclipseShard: false };
  
  const terminalName = terminalId.includes("/") 
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;
  
  const isEclipseContent = content.includes("Eclipse Shard") || 
                         content.includes("ES1") ||
                         terminalName === "blacksite-es1";
                         
  if (isEclipseContent) return { level: 0.03, isEclipseShard: true };
  if (terminalName.includes("blacksite")) return { level: 0.02, isEclipseShard: false };
  if (terminalName.includes("sayelle")) return { level: 0.015, isEclipseShard: false };
  return { level: 0.01, isEclipseShard: false };
};

// Terminal definitions
const terminals = {
  "lysani01": { requiresRoll: 8, logs: "/logs/lysani01.json" },
  "s.elara01": { requiresRoll: false, logs: "/logs/s.elara01.json" },
  "slocombe875": { requiresRoll: 8, logs: "/logs/slocombe875.json" },
  "waferterm01": { requiresRoll: false, logs: "/logs/waferterm01.json" },
  "labpc81": { requiresRoll: 6, logs: "/logs/labpc81.json" },
  "vanagandr001": { requiresRoll: 8, logs: "/logs/vanagandr001.json" },
  "blackcircuit01": { requiresRoll: 8, logs: "/logs/blackcircuit01.json" },
  "fuw01": { requiresRoll: 8, logs: "/logs/fuw01.json" },
  "azura01": { requiresRoll: 10, logs: "/logs/azura01.json" },
  "vennik01": { requiresRoll: 12, logs: "/logs/vennik01.json", requiresPassword: true, password: "vennik4ever" },
  "caldonis_public": { requiresRoll: false, logs: "/logs/caldonis_public.json" },
  "blacksite-es1": { requiresRoll: 10, logs: "/logs/blacksite-es1.json" },
  "blacktalon": { requiresRoll: 12, logs: "/logs/blacktalon.json" },
  "vennik-personal": { requiresRoll: 10, logs: "/logs/vennik-personal.json" },
  "sayelle-logs": { requiresRoll: 8, logs: "/logs/sayelle-logs.json" },
  "fuwnet": { requiresRoll: 8, logs: "/logs/fuw-network.json" },
  "01-1485-10-4-89-40": { requiresRoll: false, logs: "/logs/01-1485-10-4-89-40.json" }
};

// Typing effect with sound
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
  const hasInitialized = useRef(false);
  const typingRef = useRef(null);
  const terminalRef = useRef(null);
  
  // Core state
  const [initText, setInitText] = useState("");
  const [initComplete, setInitComplete] = useState(false);
  const [currentView, setCurrentView] = useState("init");
  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  
  // Terminal state
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [logData, setLogData] = useState(null);
  const [selectedLogData, setSelectedLogData] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [logTypingComplete, setLogTypingComplete] = useState(false);
  
  // Security state
  const [rollCheck, setRollCheck] = useState(null);
  const [specialRollCheck, setSpecialRollCheck] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [terminalPasswordRequired, setTerminalPasswordRequired] = useState(false);
  const [terminalPasswordInput, setTerminalPasswordInput] = useState("");
  const [terminalPasswordAttempts, setTerminalPasswordAttempts] = useState(0);
  
  // Visual effects state
  const [severeMalfunction, setSevereMalfunction] = useState(false);
  const [glitchText, setGlitchText] = useState("");
  
  // Command mode state
  const [commandMode, setCommandMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandOutput, setCommandOutput] = useState([]);

  // Audio logs state
  const [showAudioLogsPage, setShowAudioLogsPage] = useState(false);
  const [audioLogsData, setAudioLogsData] = useState([]);

  // Signal interference and audio state
  const [signalInterferenceLevel, setSignalInterferenceLevel] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Terminal commands definition
  const terminalCommands = {
    help: {
      description: "Display available commands",
      execute: () => {
        const helpText = Object.entries(terminalCommands)
          .map(([cmd, info]) => `${cmd.padEnd(15)} - ${info.description}`)
          .join('\n');
        return `Available commands:\n\n${helpText}\n\nType 'exit' to return to normal mode.`;
      }
    },
    scan: {
      description: "Scan for nearby terminals",
      execute: () => {
        AudioManager.playEffect('corruption', 0.2);
        const availableTerminals = Object.keys(terminals);
        const scanResults = availableTerminals.map((t, i) => {
          const corrupted = ['blacksite-es1', 'sayelle-logs', 'vennik-personal'].includes(t);
          const encrypted = terminals[t].requiresPassword;
          const status = corrupted ? '[CORRUPTED]' : encrypted ? '[ENCRYPTED]' : '[ONLINE]';
          return `${i + 1}. ${t.padEnd(20)} ${status}`;
        }).join('\n');
        
        return `Scanning local network...\n\n${scanResults}\n\nUse 'connect [terminal_name]' to establish connection.`;
      }
    },
    trace: {
      description: "Trace signal origin",
      execute: () => {
        AudioManager.playEffect('glitch', 0.3);
        const traces = [
          "Tracing signal path...",
          "Hop 1: Eternium Starport Relay [OK]",
          "Hop 2: Caldonis Central Hub [OK]", 
          "Hop 3: ████████████ [ENCRYPTED]",
          "Hop 4: Blacksite ES1 [CONNECTION LOST]",
          "",
          "WARNING: Trace detected by remote system",
          "ALERT: Counter-trace initiated"
        ];
        return traces.join('\n');
      }
    },
    decrypt: {
      description: "Attempt to decrypt corrupted data",
      execute: () => {
        if (selectedLogData && activeTerminal) {
          const chance = Math.random();
          if (chance > 0.7) {
            AudioManager.playEffect('access_granted', 0.3);
            return "Decryption successful! Corruption reduced by 15%.\nRe-displaying content with improved clarity...";
          } else if (chance > 0.3) {
            AudioManager.playEffect('corruption', 0.2);
            return "Partial decryption achieved. Some data recovered.\nCorruption reduced by 5%.";
          } else {
            AudioManager.playEffect('access_denied', 0.4);
            return "Decryption failed. Data integrity compromised.\nWARNING: Security countermeasures detected.";
          }
        }
        return "No encrypted data in current buffer.";
      }
    },
    ping: {
      description: "Check connection stability",
      execute: () => {
        const latency = Math.floor(Math.random() * 200) + 50;
        const packetLoss = Math.floor(Math.random() * 15);
        const jitter = Math.floor(Math.random() * 30);
        
        AudioManager.playEffect('keypress', 0.2);
        
        return `Connection diagnostics:
        
Latency: ${latency}ms
Packet Loss: ${packetLoss}%
Jitter: ${jitter}ms
Signal Strength: ${100 - packetLoss}%
        
${packetLoss > 10 ? 'WARNING: Connection unstable' : 'Connection stable'}`;
      }
    },
    whoami: {
      description: "Display current user info",
      execute: () => {
        return `Current User: GUEST_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}
Access Level: RESTRICTED
Session Started: ${new Date().toLocaleTimeString()}
Origin: Eternium Starport
Terminal: ${activeTerminal ? activeTerminal.logs.replace('/logs/', '').replace('.json', '') : 'NONE'}`;
      }
    },
    clear: {
      description: "Clear terminal screen",
      execute: () => {
        setCommandOutput([]);
        return null;
      }
    },
    ls: {
      description: "List available files",
      execute: () => {
        if (logData) {
          const files = logData.map((log, i) => {
            const locked = log.requires_roll ? `[LOCKED:${log.roll_check.difficulty}+]` : '';
            const password = log.requires_password ? '[PASSWORD]' : '';
            return `${i.toString().padStart(2, '0')}. ${log.title.padEnd(40)} ${locked}${password}`;
          }).join('\n');
          return `Directory listing:\n\n${files}\n\nUse 'cat [number]' to view file contents.`;
        }
        return "No files in current directory. Use 'scan' to find terminals.";
      }
    },
    cat: {
      description: "Display file contents",
      execute: (args) => {
        if (!args || args.length === 0) {
          return "Usage: cat [file_number]";
        }
        
        const fileIndex = parseInt(args[0]);
        if (logData && fileIndex >= 0 && fileIndex < logData.length) {
          handleLogClick(logData[fileIndex]);
          return `Loading file: ${logData[fileIndex].title}...`;
        }
        
        return `Error: File not found. Use 'ls' to list available files.`;
      }
    },
    connect: {
      description: "Connect to a terminal",
      execute: (args) => {
        if (!args || args.length === 0) {
          return "Usage: connect [terminal_name]";
        }
        
        const terminalName = args.join(' ').toLowerCase();
        if (terminals[terminalName]) {
          setInputCode(terminalName);
          handleAccessCode();
          return `Attempting connection to ${terminalName}...`;
        }
        
        return `Error: Terminal '${terminalName}' not found. Use 'scan' to list available terminals.`;
      }
    }
  };

  // Hidden/Easter egg commands
  const hiddenCommands = {
    riftjaw: () => {
      setSevereMalfunction(true);
      AudioManager.playEffect('warning', 0.5);
      setTimeout(() => setSevereMalfunction(false), 3000);
      return "WARNING: UNAUTHORIZED ACCESS ATTEMPT DETECTED\n\nᚱᛁᚠᛏᛃᚨᚹ ᛊᛏᛁᚱᛊ ᛒᛖᚾᛖᚨᚦ\n\nSYSTEM LOCKDOWN INITIATED";
    },
    eclipse: () => {
      AudioManager.playEffect('glitch', 0.4);
      const glitchText = "QUANTUM FLUCTUATION DETECTED IN LOCAL SPACETIME\n\n" +
        "Reality anchor holding at " + (Math.random() * 30 + 70).toFixed(1) + "%\n" +
        "Dimensional barriers: UNSTABLE\n" +
        "Eclipse Shard resonance detected: " + (Math.random() * 1000).toFixed(0) + " Hz\n\n" +
        "ERROR: Cannot triangulate signal source";
      return applyTextCorruption(glitchText, 0.1, true);
    },
    trevar: () => {
      AudioManager.playEffect('corruption', 0.3);
      return "SUBJECT FILE CLASSIFIED - OMEGA CLEARANCE REQUIRED\n\n" +
        "Last known status: CONTAINED\n" +
        "Location: [REDACTED]\n" +
        "Neural synchronization: 87%\n" +
        "Warning: Subject demonstrates Class-IV psionic manifestations";
    },
    vanagandr: () => {
      return "VESSEL REGISTRY: VANAGANDR\n" +
        "Class: Type-S Scout/Courier (Modified)\n" +
        "Status: IMPOUNDED - PENDING AUCTION\n" +
        "Special Modifications: CLASSIFIED\n" +
        "Warning: Ship systems contain encrypted data\n" +
        "Warning: Potential biohazard in cargo hold";
    }
  };

  // Initialize audio manager
  useEffect(() => {
    AudioManager.preloadSounds();
  }, []);

  // Update signal interference based on terminal
  useEffect(() => {
    if (!activeTerminal) {
      setSignalInterferenceLevel(0);
      return;
    }
    
    const terminalName = activeTerminal.logs.replace("/logs/", "").replace(".json", "");
    
    // Set interference levels based on terminal type
    const interferenceMap = {
      'blacksite-es1': 0.8,
      'sayelle-logs': 0.7,
      'vennik-personal': 0.6,
      'blacktalon': 0.5,
      'fuwnet': 0.4,
      'vanagandr001': 0.3,
      'default': 0.1
    };
    
    const level = interferenceMap[terminalName] || interferenceMap.default;
    setSignalInterferenceLevel(level);
    
    // Play connection sound
    if (soundEnabled) {
      AudioManager.playEffect('access_granted', 0.3);
    }
  }, [activeTerminal, soundEnabled]);

  // Play key sounds
  const playKeySound = () => {
    if (soundEnabled && Math.random() > 0.7) {
      AudioManager.playEffect('keypress', 0.1);
    }
  };

  // Play typing sounds
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' && soundEnabled) {
        playKeySound();
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [soundEnabled]);

  // Enhanced typing with sound
  const typeTextWithSound = (text, setState, callback = null, index = 0, delay = 30) => {
    if (soundEnabled) {
      if (text.includes("ACCESS DENIED")) {
        AudioManager.playEffect('access_denied', 0.4);
      } else if (text.includes("ERROR")) {
        AudioManager.playEffect('warning', 0.3);
      } else if (text.includes("ACCESS GRANTED") || text.includes("successful")) {
        AudioManager.playEffect('access_granted', 0.3);
      }
    }
    
    typeText(text, setState, callback, index, delay);
  };

  // Command processing
  const processCommand = (input) => {
    const parts = input.trim().toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    
    if (command === 'exit') {
      setCommandMode(false);
      setCommandOutput([]);
      return;
    }
    
    if (terminalCommands[command]) {
      const output = terminalCommands[command].execute(args);
      if (output !== null) {
        setCommandOutput(prev => [...prev, { command: input, output }]);
      }
    } else if (hiddenCommands[command]) {
      const output = hiddenCommands[command]();
      setCommandOutput(prev => [...prev, { command: input, output }]);
    } else {
      setCommandOutput(prev => [...prev, { 
        command: input, 
        output: `Command not recognized: '${command}'. Type 'help' for available commands.` 
      }]);
    }
    
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
  };

  // Command input handler
  const handleCommandKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(inputCode);
      setInputCode('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputCode(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputCode(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCode('');
      }
    }
  };

  // Initialize terminal
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
        typeTextWithSound(loadingMessages[i] + "\n", setInitText, () => {
          setInitText(prev => prev + "\n");
          i++;
          displayNextMessage();
        }, 0, 50);
      } else {
        const welcomeMessage =
          "\nWelcome to The Traveller Terminal.\n" +
          "Type the name of a terminal to access its contents.\n" +
          "Press ESC at any time to go back.\n\n";
        typeTextWithSound(welcomeMessage, setInitText, () => {
          setInitComplete(true);
        }, 0, 50);
      }
    };
    displayNextMessage();
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedText, terminalData, logTypingComplete, currentView, commandOutput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (currentView === "log" && !logTypingComplete) {
          setLogTypingComplete(true);
          if (typingRef.current) {
            clearTimeout(typingRef.current);
          }
          if (selectedLogData) {
            let fullText = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
            
            if (activeTerminal && shouldCorruptContent(fullText, activeTerminal.logs)) {
              const { level, isEclipseShard } = getCorruptionParams(fullText, activeTerminal.logs);
              fullText = applyTextCorruption(fullText, level, isEclipseShard);
            }
            
            setDisplayedText(fullText);
          }
        } else if (currentView === "log") {
          handleBackToTerminal();
        } else if (currentView === "terminal") {
          handleBackToInit();
        }
      } else if (e.key === "Enter" && !commandMode) {
        if (terminalPasswordRequired) {
          handleTerminalPasswordSubmit();
        } else if (requiresPassword) {
          handlePasswordSubmit();
        } else if (currentView === "init" && inputCode.trim() !== "") {
          handleAccessCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, logTypingComplete, selectedLogData, terminalPasswordRequired, 
      requiresPassword, inputCode, activeTerminal, commandMode]);

  // Random glitch effects
  useEffect(() => {
    if (!activeTerminal || !selectedLogData) return;
    
    const terminalName = activeTerminal.logs.replace("/logs/", "").replace(".json", "");
    const glitchEnabledTerminals = ["blacksite-es1", "vennik-personal", "fuwnet", "sayelle-logs", "blacktalon"];
    
    if (glitchEnabledTerminals.includes(terminalName)) {
      const randomGlitch = () => {
        if (Math.random() < 0.05) {
          setSevereMalfunction(true);
          if (soundEnabled) {
            AudioManager.playEffect('glitch', 0.3);
          }
          
          const glitchMessages = [
            "WARNING: SIGNAL INTEGRITY FAILING",
            "CRC ERROR DETECTED IN DATA STREAM",
            "QUANTUM FLUCTUATION DETECTED",
            "TEMPORAL ANOMALY IN DATA BUFFER",
            "WARNING: REALITY ANCHOR DESTABILIZING",
            "SECURITY BREACH ATTEMPT DETECTED"
          ];
          
          setGlitchText(glitchMessages[Math.floor(Math.random() * glitchMessages.length)]);
          
          setTimeout(() => {
            setSevereMalfunction(false);
            setGlitchText("");
          }, 1500);
        }
      };
      
      const glitchInterval = setInterval(randomGlitch, 10000);
      return () => clearInterval(glitchInterval);
    }
  }, [selectedLogData, activeTerminal, soundEnabled]);

  // Terminal access handler
  const handleAccessCode = () => {
    if (inputCode.trim().toLowerCase() === "poop") {
      navigate("/poop");
      return;
    }
    
    if (inputCode.trim() === "01-1485-10-4-89-40") {
      navigate("/riftjaw");
      return;
    }
    
    const terminal = terminals[inputCode];
    if (terminal) {
      setActiveTerminal(terminal);
      setCurrentView("terminal");
      
      if (terminal.requiresPassword) {
        setTerminalPasswordRequired(true);
      } else if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll });
      } else {
        fetchLogs(terminal.logs);
      }
    } else {
      typeTextWithSound("ACCESS DENIED. INVALID CODE.", setTerminalData);
    }
    setInputCode("");
  };

  // Terminal password handler
  const handleTerminalPasswordSubmit = () => {
    if (activeTerminal && terminalPasswordInput === activeTerminal.password) {
      setTerminalPasswordRequired(false);
      fetchLogs(activeTerminal.logs);
    } else {
      const attempts = terminalPasswordAttempts + 1;
      setTerminalPasswordAttempts(attempts);
      setTerminalPasswordInput("");
      
      if (attempts >= 3) {
        setTerminalPasswordRequired(false);
        
        if (activeTerminal && activeTerminal.requiresRoll) {
          setRollCheck({ difficulty: activeTerminal.requiresRoll });
          typeTextWithSound("Maximum password attempts reached. Attempting alternate access method...", setTerminalData);
        } else {
          typeTextWithSound("ACCESS DENIED. MAXIMUM ATTEMPTS REACHED.", setTerminalData);
          setTimeout(() => handleBackToInit(), 2000);
        }
      } else {
        typeTextWithSound(`ACCESS DENIED. INVALID PASSWORD. ${3 - attempts} attempts remaining.`, setTerminalData);
      }
    }
  };

  // Roll check handler
  const handleRollCheck = (passed) => {
    if (passed) {
      if (activeTerminal) {
        fetchLogs(activeTerminal.logs);
      } else {
        typeTextWithSound("ERROR: Terminal not found.", setTerminalData);
      }
    } else {
      typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
    }
    setRollCheck(null);
  };

  // Special roll check handler
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
          
          if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
            const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
            message = applyTextCorruption(message, level, isEclipseShard);
          }
          
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
    } else {
      if (selectedLogData && selectedLogData.roll_check && selectedLogData.roll_check.on_failure) {
        typeTextWithSound(selectedLogData.roll_check.on_failure, setTerminalData);
      } else {
        typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
      }
      setSelectedLogData(null);
    }
    setSpecialRollCheck(null);
    setPasswordAttempts(0);
    setPasswordInput("");
  };

  // Fetch logs from terminal
 const fetchLogs = async (logPath) => {
   try {
     const response = await fetch(logPath);
     const data = await response.json();
     
     if (Array.isArray(data)) {
       setLogData(data);
     } else {
       // Handle special multi-level authentication
       if (logPath.includes("01-1485-10-4-89-40")) {
         navigate("/riftjaw");
       } else {
         setSelectedLogData(data);
         setCurrentView("log");
         setDisplayedText("");
         setLogTypingComplete(false);
         
         let message = `Date: ${data.date}\nAuthor: ${data.author}\n\n${data.content || "No data available."}`;
         
         if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
           const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
           message = applyTextCorruption(message, level, isEclipseShard);
         }
         
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
   } catch (error) {
     typeTextWithSound("ERROR LOADING LOGS.", setTerminalData);
   }
 };

 // Handle log click
 const handleLogClick = (log) => {
   setSelectedLogData(log);
   setCurrentView("log");
   setPasswordAttempts(0);
   setPasswordInput("");
   
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
       
       if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
         const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
         message = applyTextCorruption(message, level, isEclipseShard);
       }
       
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

 // Password submit handler
 const handlePasswordSubmit = () => {
   if (passwordInput === selectedLogData.password) {
     setRequiresPassword(false);
     
     if (selectedLogData.logs) {
       setAudioLogsData(selectedLogData.logs);
       setShowAudioLogsPage(true);
     } else {
       setDisplayedText("");
       setLogTypingComplete(false);
       
       let message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
       
       if (activeTerminal && shouldCorruptContent(message, activeTerminal.logs)) {
         const { level, isEclipseShard } = getCorruptionParams(message, activeTerminal.logs);
         message = applyTextCorruption(message, level, isEclipseShard);
       }
       
       typeTextWithSound(message, setDisplayedText, () => {
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
       typeTextWithSound("Incorrect password. Please try again.", setTerminalData);
     }
   }
 };

 // Navigation handlers
 const handleBackToTerminal = () => {
   setSelectedLogData(null);
   setDisplayedText("");
   setLogTypingComplete(false);
   setCurrentView("terminal");
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
   setRequiresPassword(false);
   setPasswordInput("");
   setPasswordAttempts(0);
   setSignalInterferenceLevel(0);
 };

 // Audio logs page
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

 // Main render
 return (
   <div className="flex flex-col items-center min-h-screen bg-black p-2 sm:p-4">
     {/* Signal Interference Component */}
     <SignalInterference 
       level={signalInterferenceLevel} 
       terminalType={activeTerminal ? 'corrupted' : 'normal'} 
     />
     
     {/* Sound Toggle Button */}
     <div className="fixed top-4 left-4 z-50">
       <Button
         className="bg-green-400 text-black font-mono px-2 py-1 rounded text-xs hover:bg-green-500"
         onClick={() => {
           const isMuted = AudioManager.toggleMute();
           setSoundEnabled(!isMuted);
         }}
       >
         {soundEnabled ? '🔊' : '🔇'}
       </Button>
     </div>
     
     {currentView === "init" && (
       <div
         style={{
           fontFamily: "monospace",
           color: "#33ff33",
           whiteSpace: "pre-wrap",
           marginBottom: "10px",
           textAlign: "center",
           fontSize: "12px"
         }}
         className="terminal-flicker px-2 sm:text-sm lg:text-base"
       >
         {initText}
       </div>
     )}
     
     <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg border-green-400 border-2">
       <CardContent className="p-3 sm:p-4 lg:p-6">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
           <div 
             className={`${activeTerminal ? getTerminalEffectClasses(activeTerminal.logs) : "terminal terminal-flicker"} sm:h-[300px] lg:h-[350px] sm:text-xs lg:text-sm`}
             style={{ 
               overflow: "auto", 
               height: "250px",
               position: "relative",
               fontSize: "11px"
             }}
             ref={terminalRef}
           >
             {/* Severe malfunction overlay */}
             {severeMalfunction && (
               <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                 <div className="text-red-500 font-mono text-sm sm:text-lg lg:text-xl severe-glitch p-2 sm:p-4 border border-red-500">
                   {glitchText}
                 </div>
               </div>
             )}
             
             {/* Terminal password prompt */}
             {terminalPasswordRequired ? (
               <div className="p-2">
                 <p className="mb-2">Terminal requires password authentication.</p>
                 <p className="mb-4">Attempts remaining: {3 - terminalPasswordAttempts}</p>
                 <div className="mt-4">
                   <Input
                     className="bg-black text-green-400 border border-green-400 px-2 sm:px-3 py-2 font-mono focus:outline-none w-full text-xs sm:text-sm"
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
                   <div className="flex flex-col sm:flex-row gap-2 mt-2">
                     <Button
                       className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                       onClick={handleTerminalPasswordSubmit}
                     >
                       Submit
                     </Button>
                     <Button
                       className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                       onClick={handleBackToInit}
                     >
                       Back
                     </Button>
                   </div>
                 </div>
               </div>
             ) : specialRollCheck ? (
               <div className="p-2">
                 <p className="mb-4 text-xs sm:text-sm">
                   Did you pass the {specialRollCheck.difficulty}+ check for{" "}
                   {selectedLogData ? selectedLogData.title : "this file"}?
                 </p>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={() => handleSpecialRollCheck(true)}
                   >
                     Yes
                   </Button>
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={() => handleSpecialRollCheck(false)}
                   >
                     No
                   </Button>
                 </div>
               </div>
             ) : rollCheck ? (
               <div className="p-2">
                 <p className="mb-4 text-xs sm:text-sm">
                   Did you pass the {rollCheck.difficulty}+ Electronics (Computers) check?
                 </p>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={() => handleRollCheck(true)}
                   >
                     Yes
                   </Button>
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={() => handleRollCheck(false)}
                   >
                     No
                   </Button>
                 </div>
               </div>
             ) : selectedLogData && requiresPassword ? (
               <div className="p-2">
                 <div style={{ whiteSpace: "pre-wrap", marginBottom: "10px" }} className="text-xs sm:text-sm">{displayedText}</div>
                 <p className="mb-2 text-xs sm:text-sm">
                   Password required. Attempts remaining:{" "}
                   {(selectedLogData.attemptsAllowed || 3) - passwordAttempts}
                 </p>
                 <Input
                   className="bg-black text-green-400 border border-green-400 px-2 sm:px-3 py-2 font-mono focus:outline-none w-full text-xs sm:text-sm"
                   placeholder="Enter Password"
                   value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}
                   type="password"
                   onKeyPress={(e) => {
                     if (e.key === 'Enter') {
                       handlePasswordSubmit();
                     }
                   }}
                 />
                 <div className="flex flex-col sm:flex-row gap-2 mt-2">
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={handlePasswordSubmit}
                   >
                     Submit
                   </Button>
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={handleBackToTerminal}
                   >
                     Back
                   </Button>
                 </div>
               </div>
             ) : selectedLogData ? (
               <div className="terminal-glitch p-2">
                 <div style={{ whiteSpace: "pre-wrap" }} className="text-xs sm:text-sm">{displayedText}</div>
                 {selectedLogData.audio_file && (
                   <audio
                     controls
                     className="w-full mt-2"
                     style={{
                       backgroundColor: "black",
                       border: "1px solid #33ff33",
                       borderRadius: "5px",
                       color: "#33ff33"
                     }}
                   >
                     <source src={selectedLogData.audio_file} type="audio/mp3" />
                     Your browser does not support the audio element.
                   </audio>
                 )}
                 {logTypingComplete && (
                   <Button
                     className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2 w-full sm:w-auto text-xs sm:text-sm"
                     onClick={handleBackToTerminal}
                   >
                     Back
                   </Button>
                 )}
               </div>
             ) : logData ? (
               <div className="p-2">
                 {logData.map((log, index) => (
                   <p
                     key={index}
                     onClick={() => handleLogClick(log)}
                     className="cursor-pointer underline py-2 sm:py-1 text-xs sm:text-sm hover:text-green-300"
                   >
                     {log.title}
                   </p>
                 ))}
                 <Button
                   className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2 w-full sm:w-auto text-xs sm:text-sm"
                   onClick={handleBackToInit}
                 >
                   Back
                 </Button>
               </div>
             ) : currentView === "init" && commandMode ? (
               <div className="command-interface p-2">
                 <div className="command-output" style={{ 
                   minHeight: '150px', 
                   maxHeight: '200px', 
                   overflowY: 'auto',
                   marginBottom: '10px'
                 }}>
                   {commandOutput.map((entry, index) => (
                     <div key={index} style={{ marginBottom: '10px' }} className="text-xs sm:text-sm">
                       <div style={{ color: '#33ff33' }}>&gt; {entry.command}</div>
                       <div style={{ whiteSpace: 'pre-wrap', marginLeft: '10px' }}>
                         {entry.output}
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="command-prompt flex items-center">
                   <span className="mr-1 text-xs sm:text-sm">&gt;</span>
                   <Input
                     className="bg-black text-green-400 border-0 px-0 py-0 font-mono focus:outline-none flex-grow text-xs sm:text-sm"
                     placeholder="Enter command..."
                     value={inputCode}
                     onChange={(e) => setInputCode(e.target.value)}
                     onKeyDown={handleCommandKeyDown}
                     autoFocus
                   />
                 </div>
               </div>
             ) : (
               <p className="glitch-text p-2 text-xs sm:text-sm">
                 {terminalData || "ENTER ACCESS CODE TO PROCEED"}
               </p>
             )}
           </div>
         </motion.div>
         
         {/* Input section */}
         {currentView === "init" && (
           <div className="mt-3 sm:mt-4">
             {/* Command mode toggle */}
             <div className="command-mode-toggle mb-2 text-right">
               <Button
                 className="bg-green-400 text-black font-mono px-2 py-1 rounded text-xs hover:bg-green-500"
                 onClick={() => {
                   setCommandMode(!commandMode);
                   setCommandOutput([]);
                 }}
               >
                 {commandMode ? 'GUI MODE' : 'COMMAND MODE'}
               </Button>
             </div>
             
             {/* Regular input (only show if not in command mode) */}
             {!commandMode && (
               <div className="flex flex-col sm:flex-row gap-2">
                 <Input
                   className="bg-black text-green-400 border border-green-400 px-2 sm:px-3 py-2 font-mono focus:outline-none text-xs sm:text-sm flex-grow"
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
                   className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 text-xs sm:text-sm w-full sm:w-auto"
                   onClick={handleAccessCode}
                 >
                   Enter
                 </Button>
               </div>
             )}
           </div>
         )}
       </CardContent>
     </Card>
   </div>
 );
}