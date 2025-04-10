import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css";

const Menu = () => {
  const navigate = useNavigate();

  // Remplacer "Settings" par "Test Naruto"
  const menuOptions = [
    { label: "Mode Histoire", disabled: true },
    { label: "Versus Bot", route: "/versus-bot" },
    { label: "Two Player", route: "/two-player" },
    { label: "Options", disabled: true },
    { label: "Crédits", disabled: true },
  ];

  const handleOptionClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-title">One Piece Fight</div>

      {/* Options de menu en liens directs */}
      <div className="menu-options">
        {menuOptions.map((option, index) => (
          <div
            key={index}
            className={`menu-option ${option.disabled ? "disabled" : ""}`}
            onClick={() => !option.disabled && handleOptionClick(option.route)}
          >
            {option.label}
          </div>
        ))}
      </div>

      {/* Bouton d'urgence */}
      <div style={{ marginTop: "50px", textAlign: "center" }}>
        <a
          href="/test-naruto"
          style={{
            padding: "15px 30px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          URGENCE: TESTER NARUTO
        </a>
      </div>
    </div>
  );
};

export default Menu;
