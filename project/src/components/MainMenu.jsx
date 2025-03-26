import React, { useState } from "react";
import "../styles/MainMenu.css";
import TestScene from "./TestScene";

const MainMenu = () => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showTestScene, setShowTestScene] = useState(false);
  const menuOptions = ["Versus Bot", "Two Players", "Settings", "Test Luffy"];

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        setSelectedOption((prev) =>
          prev > 0 ? prev - 1 : menuOptions.length - 1
        );
        break;
      case "ArrowDown":
        setSelectedOption((prev) =>
          prev < menuOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "Enter":
        handleOptionSelect(selectedOption);
        break;
      default:
        break;
    }
  };

  const handleOptionSelect = (index) => {
    switch (index) {
      case 0:
        console.log("Versus Bot selected");
        break;
      case 1:
        console.log("Two Players selected");
        break;
      case 2:
        console.log("Settings selected");
        break;
      case 3:
        setShowTestScene(true);
        break;
      default:
        break;
    }
  };

  if (showTestScene) {
    return <TestScene onBack={() => setShowTestScene(false)} />;
  }

  return (
    <div className="main-menu" tabIndex="0" onKeyDown={handleKeyDown}>
      <h1 className="game-title">Anime Fighter</h1>
      <div className="menu-options">
        {menuOptions.map((option, index) => (
          <div
            key={index}
            className={`menu-option ${
              selectedOption === index ? "selected" : ""
            }`}
            onClick={() => handleOptionSelect(index)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
