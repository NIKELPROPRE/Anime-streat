import React from "react";
import { useNavigate } from "react-router-dom";

const TwoPlayer = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#282c34",
        color: "white",
      }}
    >
      <h1>Two Player Mode</h1>
      <p>Cette page est en cours de développement.</p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: "#61dafb",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Retour au menu
      </button>
    </div>
  );
};

export default TwoPlayer;
