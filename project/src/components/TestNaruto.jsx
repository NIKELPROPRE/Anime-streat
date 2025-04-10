import React, { useState, useEffect } from "react";
import Naruto from "../components/characters/Naruto.jsx";
import PauseMenu from "./PauseMenu";
import "../styles/MainMenu.css"; // Importez le CSS du menu principal
import { PLAYER1_CONTROLS } from "../config/controls";

// Importez l'image de fond si TestLuffy utilise une image
// import backgroundImage from "../assets/imgs/background.jpg"; // Ajustez le chemin si nécessaire

const TestNaruto = () => {
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

  // Copiez exactement le même style de fond que dans TestLuffy
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
      {/* Sol pour les personnages */}
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

      {/* Personnage Naruto */}
      <Naruto
        position={{ x: 200, y: 400 }}
        controls={PLAYER1_CONTROLS}
        isPaused={false}
      />

      {/* Menu pause */}
      {isPaused && <PauseMenu onContinue={() => setIsPaused(false)} />}
    </div>
  );
};

export default TestNaruto;
