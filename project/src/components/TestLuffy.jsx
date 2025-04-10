import React, { useState, useEffect } from "react";
import Luffy from "./characters/Luffy";
import PauseMenu from "./PauseMenu";
import "../styles/MainMenu.css";

const TestLuffy = () => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="main-menu-background"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100px",
          backgroundColor: "#8B4513",
          zIndex: 5,
        }}
      />
      <Luffy position={{ x: 100, y: 400 }} isPaused={isPaused} />
      {isPaused && <PauseMenu onContinue={() => setIsPaused(false)} />}
    </div>
  );
};

export default TestLuffy;
