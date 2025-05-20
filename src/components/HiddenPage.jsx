import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { useParams, useNavigate } from "react-router-dom";

const typeText = (text, setState, callback = null, index = 0, delay = 30) => {
  if (index < text.length) {
    setState(prev => prev + text[index]);
    setTimeout(() => typeText(text, setState, callback, index + 1, delay), delay);
  } else {
    if (callback) callback();
  }
};

// Enhanced version with image and audio support for the hidden pages
const hiddenPages = {
  "eclipseshard": {
    title: "Eclipse Shard Data Fragment",
    content: `CLASSIFIED INFORMATION - LYSANI LABS
ACCESS LEVEL: ALPHA
SUBJECT: ECLIPSE SHARD

Initial analysis of the Eclipse Shard reveals properties unlike any material previously cataloged. The crystalline structure appears to respond to both electrical stimulation and nearby cognitive activity.

Test subjects exposed to the Shard for periods exceeding 30 minutes report sensory experiences that cannot be explained by conventional science. These include:
- Heightened awareness of surrounding electromagnetic fields
- Ability to perceive quantum fluctuations normally imperceptible to human senses
- Recurring visions of a vast, dark space filled with geometric patterns

WARNING: Extended exposure leads to neurological changes that persist after removal from proximity to the Shard. Subjects Trevar, Elara, and Voren all display these persistent effects, though each manifests differently.

The Shard appears to be a fragment of a larger whole. Theoretical models suggest a complete artifact would be capable of [DATA CORRUPTED]

CRITICAL: Subject Trevar's final report indicates the Shard may be attempting communication. Before his disappearance, he left the following statement:

"It doesn't just change you. It opens doors in your mind that were never meant to be opened. And something is waiting on the other side."`,
    audioFile: null,
    showImage: false,
    autoPlayAudio: false
  },
  "blacktalonops": {
    title: "Black Talon Operation Files",
    content: `BLACK TALON CARTEL
OPERATION: MIDNIGHT HARVEST

OBJECTIVE: Secure control of the Eclipse Shard and eliminate all witnesses.

ASSET STATUS:
- Rax Vennik (Syndicate): Remains cooperative but unreliable. Believes we seek the Shard for profit. Unaware of true purpose.
- Lysani Labs: Provides scientific expertise, but their corporate agenda conflicts with our goals. Monitor closely.
- Operative Nex: Successfully infiltrated auction security. Will provide internal sabotage when required.

TARGET PRIORITIES:
1. Eclipse Shard recovery
2. Elimination of all Vanagandr crew members
3. Removal of Lysani Labs personnel with direct knowledge

NOTE FROM COMMANDER:
The Vanagandr crew presents an anomaly. Standard memory suppression protocols have failed on multiple subjects. Their continued survival is problematic. The reappearance of their ship suggests the crew may have retained more knowledge than anticipated.

Recommended course: Allow auction to proceed. Use chaos as cover for asset extraction. Leave no witnesses.`,
    audioFile: null,
    showImage: false,
    autoPlayAudio: false
  },
  "blacksite": {
    title: "Blacksite ES1 Location Data",
    content: `LYSANI LABORATORIES
INTERNAL MEMORANDUM

BLACKSITE ES1 COORDINATES:
Helix Nebula, Sector 7
Relative coordinates: χ-882.45, γ-104.72, β-337.09

APPROACH PROTOCOL:
- Drop from jump at minimum safe distance
- Broadcast authentication code: SIGMA-VERMILLION-OBSIDIAN-PULSE
- Maintain velocity below 0.15c until docking clearance
- Any deviation will result in immediate defensive measures

CURRENT STATUS: ACTIVE
PRIMARY FUNCTION: Research Facility (Eclipse Shard Containment)
SECONDARY FUNCTION: Specialized Subject Testing

NOTES:
The anomalous effects of the Eclipse Shard appear to intensify within the unique gravitational conditions at this location. Subjects separated from the Shard experience withdrawal symptoms proportional to their previous exposure duration.

Subject E. Trevar demonstrated the most promising compatibility with the Shard and remains in deep containment at the facility. His neural patterns now show 87% synchronization with the Shard's energy signature.`,
    audioFile: null,
    showImage: false,
    autoPlayAudio: false
  },
  "sayelle": {
    title: "Subject: Sayelle - Enhancement Records",
    content: `VENNIK SYNDICATE
ASSET ENHANCEMENT REPORT

SUBJECT: SAYELLE
DESIGNATION: BLOODHOUND
STATUS: ACTIVE

CYBERNETIC ENHANCEMENTS:
- Ocular System: Thermal/Night Vision, Tactical HUD, Facial Recognition
- Neural Processor: Reflex Acceleration, Combat Analysis Matrix
- Musculature: Carbon-Fiber Reinforcement, Adrenaline Regulation
- Integumentary: Subdermal Armor Weave (70% Coverage)

PSYCHOLOGICAL PROFILE:
Subject exhibits intense fixation on assigned targets. Vengeance motivation remains strongest psychological driver. Personal vendetta against Vanagandr crew reinforces loyalty to Syndicate objectives.

COMBAT EVALUATION:
Subject demonstrates exceptional tracking abilities and close-quarters elimination skills. Prefers psychological warfare tactics to destabilize targets before engagement.

HANDLER NOTES:
Sayelle's survival on Neon was unexpected but ultimately beneficial. Her obsession with the Vanagandr crew has intensified following her near-death experience. This pathological focus makes her our most reliable asset for this operation.

WARNING: Bloodhound operates with extreme prejudice. Collateral damage likely if target acquisition occurs in populated areas.`,
    audioFile: null,
    showImage: false,
    autoPlayAudio: false
  },
  "fuwnet": {
    title: "Free Union of Workers - Resistance Network",
    content: `FUW ENCRYPTED NETWORK
ACCESS GRANTED - RESISTANCE HUB CONNECTED

COMRADES IN THE STRUGGLE,

Welcome to the FUWNET secure communications channel. This network exists beyond corporate surveillance and connects all resistance cells across Brendis-7.

CURRENT OPERATIONS:
- Operation BROKEN CHAIN: Disruption of Vennik supply routes
- Operation VOICE: Propaganda distribution in Old Caldonis
- Operation UPRISING: Recruitment in manufacturing sectors

EMERGENCY BROADCAST:
Intelligence has confirmed that Rax Vennik is hosting a high-security auction at his warehouse complex. House Azura representatives will be present, along with other corporate interests. This presents a rare opportunity to strike multiple targets simultaneously.

Strike team deployments are underway. All cell leaders, check secure drop points for updated instructions.

ALERT: INCREASED SURVEILLANCE
Corporate security forces have increased patrols in the underworld district. Use caution when traveling between safehouses. Utilize only authorized transit routes marked in your mesh network updates.

Remember the words of Daro Torren: "They built their towers on our backs. Now we rise, and their towers will fall."

ENCRYPTED SIGNATURE:
Mira Torren
Strike Core Command

--- END TRANSMISSION ---

THE SCALE WILL BREAK`,
    audioFile: "/audio/SCRebelRadio.mp3",
    showImage: false,
    autoPlayAudio: true
  },
  "wantedboard": {
    title: "BLACK WEB WANTED BOARD - PRIORITY TARGETS",
    content: `XENO-DARKNET SECURE ACCESS POINT
VERIFICATION: COMPLETE
DISPLAYING: HIGH-VALUE TARGET LIST

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

TARGET DESIGNATION: VANAGANDR CREW
BOUNTY STATUS: ACTIVE - 50,000 CREDITS PER HEAD (ALIVE PREFERRED)
PRIORITY: MAXIMUM
THREAT ASSESSMENT: EXTREME CAUTION ADVISED

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

TARGET #1: "KNUCK"
SPECIES: HUMAN
DESCRIPTION: Male, approximate age 35-40, muscular build, extensive technical expertise
KNOWN SKILLS: Electronics specialist, security systems expert, exceptional hacking abilities
THREAT LEVEL: HIGH
CAUTION: Extremely resourceful with improvised weapons and security countermeasures
LAST KNOWN LOCATION: Eternium Starport, Brendis-7
NOTES: Target demonstrates tactical thinking and will prioritize electronic warfare. Approaches from multiple angles and understands surveillance technologies.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

TARGET #2: "SIR BRONCO"
SPECIES: Vargr
DESCRIPTION: Male, 50s, military bearing, distinctive formal speech patterns
KNOWN SKILLS: Combat specialist, tactical leadership, heavy weapons proficiency
THREAT LEVEL: EXTREME
CAUTION: Former military, likely special forces. Highly dangerous in direct confrontation.
LAST KNOWN LOCATION: Eternium Starport, Brendis-7
NOTES: Target attempts to present as noble or chivalrous but is ruthlessly effective in combat. Will attempt to protect other crew members at personal risk. Recommend engagement only with overwhelming force or when isolated from group.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

TARGET #3: "EZRA"
SPECIES: HUMAN
DESCRIPTION: Male, mid-30s, lean build, observant demeanor, unusual sensory awareness
KNOWN SKILLS: Infiltration, perception, possible psionic abilities
THREAT LEVEL: HIGH
CAUTION: Demonstrates uncanny awareness of surroundings and hidden threats
LAST KNOWN LOCATION: Eternium Starport, Brendis-7
NOTES: Target appears to sense danger before it manifests. Surveillance operations against this subject frequently fail under unexplained circumstances. Approach with extreme caution and consider psionic dampening measures if available.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

TARGET #4: "AGATHON"
SPECIES: HUMAN
DESCRIPTION: Male, approx. 50, tall and wiry, known-celebrity of noble birth, calm under pressure
KNOWN SKILLS: Skilled in bladed combat, agile (ex-Promenade player,) Smooth talker
THREAT LEVEL: MODERATE
CAUTION: Appears non-threatening but remains poised and knows how to outmaneuver opponents
LAST KNOWN LOCATION: Eternium Starport, Brendis-7
NOTES: Target appears to be the defacto captain of the Vanagandr crew.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

ADDITIONAL INFORMATION:
- Targets travel as a semi-coordinated unit with complementary skills
- All subjects survived Neon incident (details classified)
- Likely the have developed resistance to memory modification procedures
- Unknown if they have any connection to Eclipse Shard
- Potentially aware of Blacksite ES1 location

CAPTURE PROTOCOL:
1. Psychological destabilization recommended before engagement
2. Separate targets when possible
3. Utilize specialized containment for transport
4. Do not underestimate resourcefulness
5. Client requests intact neural systems preserved

WARNING: These targets have repeatedly escaped situations with extremely low survival probability. Conventional tactical approaches may prove insufficient.

POSTING VERIFICATION: X-77291-ALPHA
AUTHORIZED BY: [REDACTED]
CONTACT: Secure transmission protocols only. Use encryption key SIGMA-VOID-ECHO-9.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`,
    audioFile: null,
    showImage: true,
    autoPlayAudio: false,
    targetImages: {
      "KNUCK": "/images/wanted/knuck.jpg",
      "SIR BRONCO": "/images/wanted/bronco.jpg", 
      "EZRA": "/images/wanted/ezra.jpg",
      "AGATHON": "/images/wanted/agathon.jpg"
    }
  }
};

export default function HiddenPage() {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const [displayedText, setDisplayedText] = useState("");
    const [textComplete, setTextComplete] = useState(false);
    const [initText, setInitText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [initComplete, setInitComplete] = useState(false);
    const [escPressed, setEscPressed] = useState(0); // Track ESC presses
    
    const hasInitialized = useRef(false);
    const terminalRef = useRef(null);
    const typingRef = useRef({ active: false });
    const audioRef = useRef(null);
    
    const pageData = hiddenPages[pageId] || {
      title: "ACCESS DENIED",
      content: "This data fragment does not exist or has been corrupted.",
      audioFile: null,
      showImage: false,
      autoPlayAudio: false
    };
  
    // Function to handle audio playback
    const playAudio = () => {
      if (audioRef.current && pageData.autoPlayAudio) {
        audioRef.current.volume = 0.5; // Set a reasonable default volume
        audioRef.current.play().catch(error => {
          console.log("Audio autoplay prevented by browser:", error);
        });
      }
    };
  
    // Function to complete typing immediately
    const completeTyping = () => {
      if (isTyping) {
        // Stop any ongoing typing
        typingRef.current.active = false;
        setIsTyping(false);
        
        if (!initComplete) {
          // Complete initialization
          setInitText(prev => {
            const currentText = prev;
            const welcomeMessage = `\nSECURE ACCESS GRANTED\nRETRIEVING DATA FILE: ${pageData.title}\n\n`;
            return currentText + welcomeMessage;
          });
          setInitComplete(true);
          
          // Display full content immediately
          setDisplayedText(pageData.content);
          setTextComplete(true);
          
          // Play audio if this is a page with autoplay audio
          playAudio();
        } else {
          // Just complete the content
          setDisplayedText(pageData.content);
          setTextComplete(true);
        }
      }
    };
  
    // Custom typeText that can be interrupted
    const customTypeText = (text, setState, callback = null, index = 0, delay = 30) => {
      setIsTyping(true);
      typingRef.current.active = true;
      
      if (index < text.length && typingRef.current.active) {
        setState(prev => prev + text[index]);
        setTimeout(() => customTypeText(text, setState, callback, index + 1, delay), delay);
      } else {
        if (typingRef.current.active && callback) callback();
        setIsTyping(false);
        typingRef.current.active = false;
      }
    };
  
    // Event listener for ESC key
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setEscPressed(prev => {
            // First press completes typing
            if (prev === 0 && isTyping) {
              completeTyping();
              return 1;
            } 
            // Second press returns to main terminal
            else if (prev >= 1 || !isTyping) {
              navigate("/");
              return 0;
            }
            return prev;
          });
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [isTyping, navigate]);
  
    // Auto scroll function
    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, [displayedText, textComplete, initText]);
  
    // Main initialization logic
    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
  
      const loadingMessages = [
        "Establishing secure connection...",
        "Decrypting data stream...",
        "Authenticating access credentials...",
        "Security protocols bypassed."
      ];
      
      let i = 0;
      const displayNextMessage = () => {
        if (i < loadingMessages.length && typingRef.current.active) {
          customTypeText(loadingMessages[i] + "\n", setInitText, () => {
            setInitText(prev => prev + "\n");
            i++;
            displayNextMessage();
          }, 0, 50);
        } else if (typingRef.current.active) {
          const welcomeMessage = 
            `\nSECURE ACCESS GRANTED\n` +
            `RETRIEVING DATA FILE: ${pageData.title}\n\n`;
          customTypeText(welcomeMessage, setInitText, () => {
            setInitComplete(true);
            customTypeText(pageData.content, setDisplayedText, () => {
              setTextComplete(true);
              // Play audio when text is complete
              playAudio();
            });
          }, 0, 50);
        }
      };
      
      typingRef.current.active = true;
      displayNextMessage();
      
      return () => {
        typingRef.current.active = false;
        // Stop audio playback when component unmounts
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }, [pageId, pageData.title, pageData.content, pageData.autoPlayAudio]);
  
    // Rendering for wanted board with images
    const renderWantedBoard = () => {
      if (!pageData.showImage || !pageData.targetImages) return null;
      
      return (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(pageData.targetImages).map(([name, imagePath]) => (
            <div key={name} className="border border-green-400 p-2">
              <div className="text-green-400 font-mono text-center mb-2">{name}</div>
              <div className="flex justify-center">
                <img 
                  src={imagePath} 
                  alt={`Wanted: ${name}`} 
                  className="w-full h-auto max-h-48 object-cover border border-green-400" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/wanted/placeholder.jpg";
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    };
  
    return (
      <div className="flex flex-col items-center h-screen bg-black p-4">
        {/* Hidden audio element that can autoplay */}
        {pageData.audioFile && (
          <audio
            ref={audioRef}
            src={pageData.audioFile}
            loop={false}
            style={{ display: "none" }}
          />
        )}
        
        <Card className="w-full max-w-md border-green-400 border-2">
          <CardContent>
            <div
              style={{
                fontFamily: "monospace",
                color: "#33ff33",
                whiteSpace: "pre-wrap",
                marginBottom: "10px",
                textAlign: "left"
              }}
            >
              {initText}
              {isTyping && !initComplete && <span className="blinking-cursor">▌</span>}
            </div>
            <div 
              className="terminal overflow-auto h-[300px]" 
              ref={terminalRef}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>
                {displayedText}
                {isTyping && initComplete && <span className="blinking-cursor">▌</span>}
              </div>
              
              {/* Render wanted board INSIDE the scrollable terminal */}
              {textComplete && pageData.showImage && renderWantedBoard()}
              
              {/* Visible audio controls (only shown when not auto-playing) */}
              {pageData.audioFile && textComplete && !pageData.autoPlayAudio && (
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
                  <source src={pageData.audioFile} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button onClick={() => navigate("/")}>
                RETURN TO MAIN TERMINAL
              </Button>
              <div className="text-green-400 text-xs">
                {isTyping ? "Press ESC to skip typing" : "Press ESC to return"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }