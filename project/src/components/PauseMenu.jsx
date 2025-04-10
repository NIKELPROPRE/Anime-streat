import React from "react";
import "../styles/PauseMenu.css";

const PauseMenu = ({ onContinue, onSettings, onReturnToMenu }) => {
  return (
    <div className="pause-menu-overlay">
      <div className="pause-menu-container">
        <div className="pause-menu-title">Pause</div>
        <div className="pause-menu-options">
          <div className="pause-menu-option" onClick={onContinue}>
            Continuer
          </div>
          <div className="pause-menu-option" onClick={onSettings}>
            Settings
          </div>
          <div className="pause-menu-option" onClick={onReturnToMenu}>
            Retour au menu
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
