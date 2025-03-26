import React from "react";
import Luffy from "./characters/Luffy";
import "../styles/TestScene.css";

const TestScene = ({ onBack }) => {
  return (
    <div className="test-scene">
      <button className="back-button" onClick={onBack}>
        Retour au Menu
      </button>
      <Luffy
        position={{
          x: window.innerWidth / 2 - 50,
          y: window.innerHeight / 2 - 50,
        }}
      />
    </div>
  );
};

export default TestScene;
