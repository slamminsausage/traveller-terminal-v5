import React, { useState } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

// A simple typeText function to animate text display
const typeText = (text, setState, callback = null, index = 0, delay = 50) => {
  if (index < text.length) {
    setState((prev) => prev + text[index]);
    setTimeout(() => typeText(text, setState, callback, index + 1, delay), delay);
  } else {
    if (callback) callback();
  }
};

export default function PoopTerminal() {
  const [promptAnswered, setPromptAnswered] = useState(false);
  const [isBirthday, setIsBirthday] = useState(null); // true if Yes, false if No
  const [displayedText, setDisplayedText] = useState("");

  const handleYes = () => {
    setIsBirthday(true);
    setPromptAnswered(true);
    // Animate the birthday message
    typeText("🎉 Happy Birthday Luca!", setDisplayedText);
  };

  const handleNo = () => {
    setIsBirthday(false);
    setPromptAnswered(true);
  };

  if (!promptAnswered) {
    // Initial prompt view
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
        <Card className="w-full max-w-md border-green-400 border-2">
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              <p
                style={{
                  fontFamily: "monospace",
                  color: "#33ff33",
                  textAlign: "center",
                }}
              >
                Is it your birthday today?
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                  onClick={handleYes}
                >
                  Yes
                </Button>
                <Button
                  className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500"
                  onClick={handleNo}
                >
                  No
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    // After prompt has been answered
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
        {isBirthday ? (
          <Card className="w-full max-w-md border-green-400 border-2">
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center"
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    color: "#33ff33",
                    textAlign: "center",
                  }}
                >
                  {displayedText}
                </p>
                <img
                  src="/poopemoji.gif"  // Replace with your GIF file path
                  alt="Birthday Celebration"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    marginTop: "20px",
                    borderRadius: "8px",
                  }}
                />
              </motion.div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-green-400 border-2">
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center"
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    color: "#33ff33",
                    textAlign: "center",
                  }}
                >
                  Check back March 15th.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
}
