import React, { useState } from "react";
import "../styles/MainMenu.css";
import TestScene from "./TestScene";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showTestScene, setShowTestScene] = useState(false);
  const navigate = useNavigate();

  // Simplifiez les options du menu pour éliminer les erreurs potentielles
  const menuOptions = [
    { label: "Mode Histoire", disabled: true },
    { label: "Versus Bot", route: "/versus-bot" },
    { label: "Two Player", route: "/two-player" },
    { label: "Settings", route: "/settings" },
    { label: "Test Luffy", route: "/test-luffy" },
    { label: "Test Naruto", route: "/test-naruto" },
    { label: "Options", disabled: true },
    { label: "Crédits", disabled: true },
  ];

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
    if (index >= 0 && index < menuOptions.length) {
      const option = menuOptions[index];
      if (option && !option.disabled && option.route) {
        navigate(option.route);
      }
    }
  };

  const handleOptionClick = (option, index) => {
    if (option && !option.disabled && option.route) {
      navigate(option.route);
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
            } ${option.disabled ? "disabled" : ""}`}
            onClick={() => handleOptionClick(option, index)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
