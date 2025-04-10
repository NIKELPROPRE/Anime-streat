import React, { useState, useEffect } from "react";
import Luffy from "./characters/Luffy";
import Naruto from "./characters/Naruto";
import PauseMenu from "./PauseMenu";

const TestCharacters = () => {
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
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#87CEEB",
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
        }}
      />
      {/* Luffy utilise les flèches par défaut */}
      <Luffy position={{ x: 300, y: 400 }} isPaused={isPaused} />

      {/* Naruto utilise QZSD */}
      <Naruto position={{ x: 100, y: 400 }} isPaused={isPaused} />

      {isPaused && <PauseMenu onContinue={() => setIsPaused(false)} />}
    </div>
  );
};

export default TestCharacters;
